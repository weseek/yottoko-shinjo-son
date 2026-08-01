import { options } from "@/app/admin/options";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { PrismaClient, PromisePageProps } from "@premieroctet/next-admin";
import { NextAdmin } from "@premieroctet/next-admin/adapters/next";
import { getNextAdminProps } from "@premieroctet/next-admin/appRouter";
import { headers } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function AdminPage({
  params,
  searchParams,
}: PromisePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  async function handleLogout() {
    "use server";
    await auth.api.signOut({ headers: await headers() });
    redirect("/admin/login");
  }

  const props = await getNextAdminProps({
    params: resolvedParams.nextadmin,
    searchParams: resolvedSearchParams,
    basePath: "/admin",
    apiBasePath: "/api/admin",
    prisma: prisma as unknown as PrismaClient,
    options,
  });

  const title = (
    <span className="flex items-center gap-2 ms-3">
      <Image
        src="/assets/logo.svg"
        alt="よっとこ！新庄村"
        width={185}
        height={36}
        className="h-8 w-auto shrink-0"
      />
      <span className="font-semibold">管理画面</span>
    </span>
  );

  return (
    <NextAdmin
      {...props}
      title={title}
      translations={{
        // 一般アクション
        "actions.label": "アクション",
        "actions.delete.label": "削除",
        "actions.create.label": "作成",
        "actions.edit.label": "編集",
        "actions.some_failed_condition":
          "一部のレコードでアクションを完了できませんでした",
        "export.label": "エクスポート",
        // フォーム
        "form.button.save.label": "保存",
        "form.button.save_edit.label": "保存して編集を続ける",
        "form.button.delete.label": "削除",
        "form.delete.alert": "本当に削除しますか？",
        "form.create.succeed": "作成しました",
        "form.update.succeed": "更新しました",
        "form.delete.succeed": "削除しました",
        "form.validation.error": "入力内容を確認してください",
        // フォームウィジェット
        "form.widgets.file_upload.label": "ファイルを選択",
        "form.widgets.file_upload.drag_and_drop": "またはドラッグ＆ドロップ",
        "form.widgets.file_upload.delete": "削除",
        "form.widgets.multiselect.select": "選択してください",
        "form.widgets.scalar_array.add": "項目を追加",
        // 一覧ヘッダー
        "list.header.add.label": "追加",
        "list.header.search.placeholder": "検索",
        "list.header.result": "検索",
        "list.header.search.result": "{{count}} 件",
        "list.header.search.result_filtered": "{{count}} 件（絞り込み中）",
        // 一覧フッター
        "list.footer.indicator.showing": "",
        "list.footer.indicator.to": "〜",
        "list.footer.indicator.of": "件中",
        // 一覧行アクション
        "list.row.actions.delete.label": "削除",
        "list.row.actions.delete.alert":
          "{{count}} 件のレコードを削除しますか？",
        "list.row.actions.delete.success": "削除しました",
        "list.row.actions.delete.error": "削除中にエラーが発生しました",
        "list.row.actions.export": "{{format}} でエクスポート",
        // 空一覧
        "list.empty.label": "データがありません",
        "list.empty.caption": "左上の「追加」ボタンからも追加できます",
        // EmptyState のボタンが `add.label + " " + model.name` で組み立てられるため
        // model.name を空にして「追加」のみ表示させる
        "model.Spot.name": "",
        "model.Activity.name": "",
        "model.Entry.name": "",
        "model.HomeCameraConfig.name": "",
        // セレクター
        "selector.loading": "読み込み中...",
        // テーマ
        "theme.dark": "カラーモード: ダーク",
        "theme.light": "カラーモード: ライト",
        "theme.system": "カラーモード: システム",
        // ユーザー
        "user.logout": "ログアウト",
        // 詳細検索
        "search.advanced.title": "詳細検索",
        "search.advanced.add": "フィルターを追加",
        "search.advanced.clear": "クリア",
        "search.advanced.cancel": "キャンセル",
        "search.advanced.save": "適用",
        "search.advanced.and_or_group": "AND / OR グループ",
        "search.advanced.conditions.equals": "と等しい",
        "search.advanced.conditions.not": "と等しくない",
        "search.advanced.conditions.in": "いずれかに含まれる",
        "search.advanced.conditions.notIn": "いずれにも含まれない",
        "search.advanced.conditions.lt": "より小さい",
        "search.advanced.conditions.lte": "以下",
        "search.advanced.conditions.gt": "より大きい",
        "search.advanced.conditions.gte": "以上",
        "search.advanced.conditions.contains": "を含む",
        "search.advanced.conditions.search": "を検索",
        "search.advanced.conditions.startsWith": "で始まる",
        "search.advanced.conditions.endsWith": "で終わる",
        "search.advanced.conditions.null": "が空である",
        "search.advanced.conditions.nnull": "が空でない",
      }}
      user={{
        data: { name: session?.user.name ?? "管理者" },
        logout: handleLogout,
      }}
    />
  );
}
