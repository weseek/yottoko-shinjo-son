import CharacterContainer from "@/app/_components/CharacterContainer";
import { buttonClassName } from "@/app/_components/button-variants";
import { JoinButton } from "@/app/_components/join-button";
import { env } from "@/env";
import { formatDateRange } from "@/lib/format-date";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getEntryByToken(cancelToken: string) {
  // 完了ページは表示専用のためキャンセル済みエントリも取得する
  return prisma.entry.findFirst({
    where: { cancelToken },
    select: {
      name: true,
      activity: {
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });
}

interface MailtoParams {
  title: string;
  id: number;
  startDate: Date;
  endDate: Date | null;
  entryName: string | null;
  cancelUrl: string;
}

function buildMailtoHref(params: MailtoParams): string {
  const subject = encodeURIComponent("【よっとこ！新庄村】予約完了のお知らせ");

  const lines = [
    "■ 予約内容",
    "",
    `アクティビティ名：${params.title}`,
    `アクティビティID：${params.id}`,
    `実施日時：${formatDateRange(params.startDate, params.endDate)}`,
  ];

  if (params.entryName) {
    lines.push(`予約者名：${params.entryName}`);
  }

  lines.push("", `キャンセル用URL：${params.cancelUrl}`);

  const body = encodeURIComponent(lines.join("\r\n"));
  return `mailto:?subject=${subject}&body=${body}`;
}

export default async function EntryCompletePage({
  params,
}: {
  params: Promise<{ cancelToken: string }>;
}) {
  const { cancelToken } = await params;
  const entry = await getEntryByToken(cancelToken);

  if (!entry) {
    notFound();
  }

  const activity = entry.activity;
  const entryName = entry.name;

  // リクエストヘッダーからオリジンを動的に取得（Cloudflareトンネル等でも正しいURLを生成）
  const headersList = await headers();
  const proto = (headersList.get("x-forwarded-proto") ?? "http")
    .split(",")[0]
    .trim();
  const host =
    headersList.get("x-forwarded-host") ??
    headersList.get("host") ??
    new URL(env.BETTER_AUTH_URL).host;
  const origin = `${proto}://${host}`;

  const cancelUrl = `${origin}/entries/${cancelToken}/cancel`;

  return (
    <div className="py-8 text-center">
      {/* キャラクター画像 */}
      <div className="mb-5">
        <CharacterContainer
          leftSrc="/assets/character/siro-maneki.png"
          rightSrc="/assets/character/kuro-maneki.png"
          gapClassName="gap-8"
        />
      </div>

      {/* 完了メッセージ */}
      <h2 className="text-[28px] font-bold leading-[1.3] text-arcana-primary-green">
        申し込み完了しました
      </h2>

      {/* 申込内容カード */}
      <div className="mx-auto mt-6 max-w-md overflow-hidden rounded-2xl bg-white shadow-[2px_3px_0_rgba(255,218,72,0.5)]">
        <div className="p-6 text-left">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-body-blue">アクティビティ名:</dt>
              <dd className="mt-0.5 text-base font-bold text-body-blue">
                {activity.title}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-body-blue">アクティビティID:</dt>
              <dd className="mt-0.5 text-base text-body-blue">{activity.id}</dd>
            </div>

            <div>
              <dt className="text-sm text-body-blue">実施日時:</dt>
              <dd className="mt-0.5 text-base font-bold text-body-blue">
                {formatDateRange(activity.startDate, activity.endDate)}
              </dd>
            </div>

            {entryName && (
              <div>
                <dt className="text-sm text-body-blue">予約者名:</dt>
                <dd className="mt-0.5 text-base font-bold text-body-blue">
                  {entryName}
                </dd>
              </div>
            )}

            <div>
              <dt className="text-sm text-body-blue">キャンセル用URL</dt>
              <dd className="mt-0.5 break-all text-base font-bold text-body-blue">
                <a
                  href={cancelUrl}
                  className="text-arcana-primary-green underline"
                >
                  {cancelUrl}
                </a>
              </dd>
            </div>
          </dl>

          {/* スクリーンショット案内 */}
          <p className="mt-5 rounded-lg border border-arcana-orange-secondary bg-[var(--color-arcana-pale-orange)] px-4 py-3 text-sm font-bold leading-relaxed text-arcana-orange-secondary">
            申込内容をこの場で保存してください。
            スクリーンショット、又は「自分にメールで共有」ボタンがご利用いただけます。
          </p>

          {/* メール共有ボタン */}
          <div className="mt-4">
            <a
              href={buildMailtoHref({
                title: activity.title,
                id: activity.id,
                startDate: activity.startDate,
                endDate: activity.endDate,
                entryName,
                cancelUrl,
              })}
              className={buttonClassName("primary", "min-h-[52px] w-full px-8")}
            >
              自分にメールで共有
            </a>
            <p className="mt-2 text-center text-sm text-[var(--color-neutral-500)]">
              メールアプリが開きます
            </p>
          </div>
        </div>
      </div>

      {/* キャンセル案内 */}
      <p className="mx-auto mt-8 flex max-w-md gap-1 text-left text-sm font-bold leading-relaxed text-body-blue">
        <span aria-hidden="true">※</span>
        <span>
          ご都合が悪くなった場合は、キャンセル用URLからお手続きお願いします。
        </span>
      </p>

      {/* 導線 */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <JoinButton
          variant="outline"
          href={`/activities/${activity.id}`}
          className="max-w-[220px]"
        >
          ‹ 交流詳細に戻る
        </JoinButton>
        <Link
          href="/activities"
          className="inline-flex items-center gap-1 text-base text-arcana-primary-green no-underline"
        >
          ‹ 一覧に戻る
        </Link>
      </div>
    </div>
  );
}
