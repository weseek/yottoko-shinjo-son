import { ActivityImagesInput } from "@/app/admin/_components/activity-images-input";
import { EnumSelectInput } from "@/app/admin/_components/enum-select-input";
import { GlbUrlInput } from "@/app/admin/_components/glb-url-input";
import { ImageUploadInput } from "@/app/admin/_components/image-upload-input";
import { SpotPublicUrls } from "@/app/admin/_components/spot-public-urls";
import { TextareaInput } from "@/app/admin/_components/textarea-input";
import { env } from "@/env";
import { formatJstDate } from "@/lib/format-date";
import { geocodeAddress } from "@/lib/geocode";
import { jstDateTimeLocalToUtcIso } from "@/lib/jst-datetime";
import { prisma } from "@/lib/prisma";
import type { NextAdminOptions } from "@premieroctet/next-admin";
import { HookError } from "@premieroctet/next-admin";

const isDevEnv = env.APP_ENV === "development";
const gcsBucket = env.GCS_BUCKET ?? null;
// 管理画面でスポットの公開 URL を案内するためのベース URL
const appBaseUrl = env.BETTER_AUTH_URL;

const pendingImagesCache = new WeakMap<object, string[]>();

const formatDate = (value: unknown) => {
  if (!value) return "—";
  return formatJstDate(value as string, { month: "short" });
};

export const options: NextAdminOptions = {
  title: "管理画面",
  sidebar: {
    groups: [
      {
        title: "コンテンツ管理",
        models: ["Activity", "Spot", "HomeCameraConfig"],
      },
      {
        title: "申込管理",
        models: ["Entry"],
      },
    ],
  },
  model: {
    Activity: {
      toString: (activity) => `${activity.title}`,
      title: "交流",
      icon: "CalendarDaysIcon",
      aliases: {
        id: "ID",
        title: "タイトル",
        description: "説明",
        detail: "詳細情報",
        imagesManagement: "画像",
        status: "ステータス",
        startDate: "開始日",
        endDate: "終了日",
        createdAt: "作成日",
        updatedAt: "更新日",
      },
      list: {
        display: ["id", "title", "status", "startDate", "endDate"],
        search: ["title" as never],
        defaultSort: { field: "createdAt", direction: "desc" },
        defaultListSize: 20,
        copy: ["title"],
        fields: {
          status: {
            formatter: (value: unknown) => {
              const labels: Record<string, string> = {
                DRAFT: "📝 下書き",
                PUBLISHED: "🟢 公開中",
                CLOSED: "⛔ 終了",
              };
              return labels[value as string] ?? value;
            },
          },
          startDate: {
            formatter: formatDate,
          },
          endDate: {
            formatter: formatDate,
          },
        },
        filters: [
          {
            name: "すべて",
            active: true,
            value: {},
          },
          {
            name: "📝 下書き",
            active: false,
            value: { status: "DRAFT" },
            group: "status",
          },
          {
            name: "🟢 公開中",
            active: false,
            value: { status: "PUBLISHED" },
            group: "status",
          },
          {
            name: "⛔ 終了",
            active: false,
            value: { status: "CLOSED" },
            group: "status",
          },
        ],
      },
      edit: {
        display: [
          {
            title: "基本情報",
            id: "basic-info",
            description: "交流の基本情報を入力してください",
          },
          "title",
          "description",
          {
            title: "詳細情報",
            id: "detail-info",
            description:
              "集合場所・定員・持ち物など、参加に必要な情報を入力してください",
          },
          "detail",
          {
            title: "スケジュール",
            id: "schedule",
            description: "開催期間とステータスを設定してください",
          },
          "status",
          "startDate",
          "endDate",
          {
            title: "画像",
            id: "imagesManagement",
            description: "交流の画像を管理してください",
          },
          "imagesManagement",
        ],
        fields: {
          title: {
            required: true,
            helperText: "交流の名前を入力",
          },
          description: {
            required: true,
            helperText: "交流の紹介文を入力（訪問者に体験の魅力を伝える文章）",
          },
          detail: {
            input: <TextareaInput />,
            helperText:
              "推奨テンプレート:\n集合日時: \n集合場所: \n定員: \n対象: \n持ち物: ",
          },
          startDate: { required: true },
        },
        customFields: {
          status: {
            input: (
              <EnumSelectInput
                options={[
                  { value: "DRAFT", label: "📝 下書き" },
                  { value: "PUBLISHED", label: "🟢 公開中" },
                  { value: "CLOSED", label: "⛔ 終了" },
                ]}
              />
            ),
          },
          imagesManagement: { input: <ActivityImagesInput /> },
        },
        hooks: {
          beforeDb: async (values, mode, request) => {
            if (mode === "create") {
              const imagesValue = values.imagesManagement;
              if (typeof imagesValue === "string" && imagesValue) {
                pendingImagesCache.set(
                  request,
                  imagesValue.split(",").filter(Boolean),
                );
              }
            }
            // datetime-local 入力は TZ 情報を持たない JST の壁時計時刻として
            // 送られてくる。ランタイム TZ 依存を避けるため、ここで明示的に
            // UTC ISO へ変換してから保存・比較する。
            if (typeof values.startDate === "string" && values.startDate) {
              values.startDate = jstDateTimeLocalToUtcIso(values.startDate);
            }
            if (typeof values.endDate === "string" && values.endDate) {
              values.endDate = jstDateTimeLocalToUtcIso(values.endDate);
            }
            if (
              values.endDate &&
              values.startDate &&
              new Date(values.endDate as string) <
                new Date(values.startDate as string)
            ) {
              throw new HookError(400, {
                error: "終了日は開始日以降にしてください",
              });
            }
            const { imagesManagement: _ignored, ...rest } = values;
            return rest;
          },
          afterDb: async (data, mode, request) => {
            if (
              mode === "create" &&
              "createdId" in data &&
              data.createdId != null
            ) {
              const urls = pendingImagesCache.get(request);
              if (urls?.length) {
                await Promise.all(
                  urls.map((url, order) =>
                    prisma.activityImage.create({
                      data: { activityId: Number(data.createdId), url, order },
                    }),
                  ),
                );
                pendingImagesCache.delete(request);
              }
            }
            return data;
          },
        },
      },
    },
    Spot: {
      toString: (spot) => `${spot.name}`,
      title: "スポット",
      icon: "MapPinIcon",
      aliases: {
        status: "ステータス",
        id: "ID",
        slug: "スラッグ",
        name: "スポット名",
        description: "説明",
        address: "住所",
        latitude: "緯度",
        longitude: "経度",
        qrCodeLocation: "QRコードの場所",
        imageUrl: "画像アップロード",
        arAssetUrl: "ARアセットURL",
        himekkoDescription: "スポット限定ひめっこ説明文",
        publicUrls: "公開URL",
        createdAt: "作成日",
        updatedAt: "更新日",
      },
      list: {
        display: ["id", "name", "slug", "status", "createdAt"],
        search: ["name" as never],
        defaultSort: { field: "createdAt", direction: "desc" },
        defaultListSize: 20,
        fields: {
          status: {
            formatter: (value: unknown) => {
              const labels: Record<string, string> = {
                DRAFT: "📝 下書き",
                PUBLISHED: "🟢 公開中",
                CLOSED: "⛔ 終了",
              };
              return labels[value as string] ?? value;
            },
          },
          createdAt: { formatter: formatDate },
        },
        filters: [
          { name: "すべて", active: true, value: {} },
          {
            name: "📝 下書き",
            active: false,
            value: { status: "DRAFT" },
            group: "status",
          },
          {
            name: "🟢 公開中",
            active: false,
            value: { status: "PUBLISHED" },
            group: "status",
          },
          {
            name: "⛔ 終了",
            active: false,
            value: { status: "CLOSED" },
            group: "status",
          },
        ],
      },
      edit: {
        display: [
          {
            title: "公開URL",
            id: "public-urls",
            description:
              "公開される詳細ページと AR カメラページの URL（スラッグから自動生成）",
          },
          "publicUrls",
          {
            title: "基本情報",
            id: "basic-info",
            description: "スポットの基本情報を入力してください",
          },
          "name",
          "slug",
          "description",
          "address",
          "latitude",
          "longitude",
          "qrCodeLocation",
          "status",
          {
            title: "メディア",
            id: "media",
            description: "画像・ARアセットのURLを入力してください",
          },
          "imageUrl",
          "arAssetUrl",
          {
            title: "スポット限定ひめっこ説明文",
            id: "himekko-description",
            description:
              "カメラページに表示するスポット固有のひめっこ説明文（任意）",
          },
          "himekkoDescription",
        ],
        fields: {
          name: { required: true, helperText: "スポットの名称" },
          slug: {
            required: true,
            helperText:
              "URLに使用する識別子（英数字・ハイフンのみ)\n例): gaisen-sakura",
          },
          description: { required: true, helperText: "スポットの紹介文" },
          address: {
            required: true,
            helperText: "スポットの住所（例: 岡山県真庭郡新庄村2190-1）",
          },
          latitude: {
            helperText:
              "緯度。空欄で保存すると住所から自動取得します。手入力した値は優先されます（自動取得し直すには空欄にして保存）",
          },
          longitude: {
            helperText: "経度。緯度と同じく、空欄なら住所から自動取得します",
          },
          qrCodeLocation: {
            required: true,
            input: <TextareaInput placeholder="" />,
          },
          imageUrl: { input: <ImageUploadInput /> },
          arAssetUrl: {
            input: <GlbUrlInput bucket={gcsBucket} isDev={isDevEnv} />,
          },
          himekkoDescription: {
            input: <TextareaInput placeholder="" />,
            helperText: "スポット限定ひめっこの説明文（カメラページに表示）",
          },
        },
        customFields: {
          publicUrls: {
            input: <SpotPublicUrls baseUrl={appBaseUrl} />,
          },
          status: {
            input: (
              <EnumSelectInput
                options={[
                  { value: "DRAFT", label: "📝 下書き" },
                  { value: "PUBLISHED", label: "🟢 公開中" },
                  { value: "CLOSED", label: "⛔ 終了" },
                ]}
              />
            ),
          },
        },
        hooks: {
          // 緯度・経度が未入力なら住所から自動ジオコーディングする。
          // 手入力済みの座標はそのまま尊重し、API も呼ばない
          // （住所変更後に取り直したい場合は緯度・経度を空にして保存する運用）。
          beforeDb: async (values) => {
            // next-admin のフォーム値は緩い型なので Record として扱う
            const v = values as Record<string, unknown>;
            const hasManualCoords =
              v.latitude != null &&
              v.longitude != null &&
              v.latitude !== "" &&
              v.longitude !== "";

            if (!hasManualCoords && typeof v.address === "string") {
              const coords = await geocodeAddress(v.address);
              // 取得失敗時は null のまま保存し、地図ではピンなし扱いにする
              v.latitude = coords?.lat ?? null;
              v.longitude = coords?.lng ?? null;
            }

            // publicUrls は DB カラムを持たない表示専用の仮想フィールドなので除去する
            const { publicUrls: _publicUrls, ...rest } = values;
            return rest;
          },
        },
      },
    },
    HomeCameraConfig: {
      toString: () => "自宅でひめっこ撮影設定",
      title: "自宅でひめっこ撮影",
      icon: "CameraIcon",
      aliases: {
        id: "ID",
        label: "ラベル",
        scale: "スケール",
        arAssetUrl: "ARアセットURL",
        createdAt: "作成日",
        updatedAt: "更新日",
      },
      edit: {
        display: [
          {
            title: "基本情報",
            id: "basic-info",
            description: "ARモデルのラベルとスケールを設定してください",
          },
          "label",
          "scale",
          {
            title: "ARモデル（GLBファイル）",
            id: "ar-model",
            description: "AR表示に使用するGLBファイルのURLを入力してください",
          },
          "arAssetUrl",
        ],
        fields: {
          arAssetUrl: {
            input: <GlbUrlInput bucket={gcsBucket} isDev={isDevEnv} />,
          },
        },
        hooks: {
          beforeDb: async (values, mode) => {
            if (mode === "create") {
              const existing = await prisma.homeCameraConfig.findFirst();
              if (existing) {
                throw new HookError(400, {
                  error:
                    "自宅撮影設定はすでに登録されています。既存の設定を編集してください。",
                });
              }
            }
            if (values.scale !== null && values.scale !== undefined) {
              const s = values.scale as unknown as number;
              if (s <= 0 || s > 10) {
                throw new HookError(400, {
                  error:
                    "スケールは 0 より大きく 10 以下の値を入力してください",
                });
              }
            }
            for (const key of ["arAssetUrl", "label"] as const) {
              if (values[key] === "") values[key] = null;
            }
            return values;
          },
        },
      },
    },
    Entry: {
      toString: (entry) => `${entry.name}`,
      title: "申込",
      icon: "InboxIcon",
      aliases: {
        id: "ID",
        name: "お名前",
        message: "メッセージ",
        status: "ステータス",
        activityId: "交流",
        deletedAt: "削除日",
        createdAt: "申込日",
        updatedAt: "更新日",
      },
      list: {
        display: ["id", "name", "activity", "status", "createdAt"],
        search: ["name" as never],
        defaultSort: { field: "createdAt", direction: "desc" },
        defaultListSize: 20,
        copy: ["name"],
        fields: {
          status: {
            formatter: (value: unknown) => {
              const labels: Record<string, string> = {
                NEW: "🆕 新規",
                IN_PROGRESS: "🔄 対応中",
                DONE: "✅ 対応済み",
                CANCELLED: "❌ キャンセル",
              };
              return labels[value as string] ?? value;
            },
          },
          createdAt: {
            formatter: formatDate,
          },
        },
        filters: [
          {
            name: "すべて",
            active: true,
            value: {},
          },
          {
            name: "🆕 新規",
            active: false,
            value: { status: "NEW" },
            group: "status",
          },
          {
            name: "🔄 対応中",
            active: false,
            value: { status: "IN_PROGRESS" },
            group: "status",
          },
          {
            name: "✅ 対応済み",
            active: false,
            value: { status: "DONE" },
            group: "status",
          },
          {
            name: "❌ キャンセル",
            active: false,
            value: { status: "CANCELLED" },
            group: "status",
          },
        ],
      },
      edit: {
        display: [
          {
            title: "申込情報",
            id: "entry-info",
            description: "申込者の情報",
          },
          "name",
          "message",
          {
            title: "対応状況",
            id: "entry-status",
            description: "ステータスを変更してください",
          },
          "status",
        ],
        fields: {
          name: { required: true },
        },
        customFields: {
          status: {
            input: (
              <EnumSelectInput
                options={[
                  { value: "NEW", label: "🆕 新規" },
                  { value: "IN_PROGRESS", label: "🔄 対応中" },
                  { value: "DONE", label: "✅ 対応済み" },
                  { value: "CANCELLED", label: "❌ キャンセル" },
                ]}
              />
            ),
          },
        },
      },
    },
  },
};
