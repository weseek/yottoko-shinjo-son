import { Icon } from "@/app/_components/Icon";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

async function getSampleActivity() {
  return prisma.activity.findFirst({
    where: { status: { in: ["PUBLISHED", "CLOSED"] } },
    orderBy: { startDate: "desc" },
    select: { id: true, title: true, status: true },
  });
}

async function getSampleSpot() {
  return prisma.spot.findFirst({
    orderBy: { createdAt: "desc" },
    select: { slug: true, name: true },
  });
}

export default async function Home() {
  const [sampleActivity, sampleSpot] = await Promise.all([
    getSampleActivity(),
    getSampleSpot(),
  ]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* ヘッダー */}
      <header className="border-b border-b-[var(--color-neutral-200)] bg-[var(--color-neutral-0)] shadow-[var(--shadow-sm)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo.svg"
              alt="よっとこ！"
              height={36}
              width={185}
              className="h-9 w-auto"
              priority
            />
          </div>
          <span className="rounded-full border border-[var(--color-warning)] bg-[var(--color-warning-bg)] px-3 py-1 text-sm font-bold text-[var(--color-warning)]">
            {env.APP_ENV.toUpperCase()}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10 text-[18px] leading-[1.6]">
        {/* 体験フロー */}
        <section className="mb-12">
          <h2 className="mb-2 text-2xl font-bold text-neutral-800">
            体験フロー
          </h2>
          <p className="mb-6 text-neutral-500">
            来村者が実際にたどるフローを体験できます
          </p>

          {/* 軸①: AR記念撮影 */}
          <FlowSection
            label="軸① AR記念撮影"
            color="var(--color-secondary-400)"
          >
            {sampleSpot ? (
              <>
                <FlowStep
                  step={1}
                  title="QR を読み取ってスポットページを開く"
                  description={`「${sampleSpot.name}」のスポット紹介ページ`}
                  href={`/spots/${sampleSpot.slug}`}
                />
                <FlowStep
                  step={2}
                  title="ヒメッコと AR 記念撮影"
                  description="カメラを起動してキャラクターと一緒に撮影します"
                  href={`/spots/${sampleSpot.slug}/camera`}
                />
                <FlowStep
                  step={3}
                  title="スポット一覧で他のスポットを探す"
                  description="村内の撮影スポットをリストで確認します"
                  href="/spots"
                  isLast
                />
              </>
            ) : (
              <>
                <FlowStep
                  step={1}
                  title="スポット一覧を見る"
                  description="まだスポットが登録されていません"
                  href="/spots"
                />
                <FlowStep
                  step={2}
                  title="スポットを登録する"
                  description="管理画面からスポットを作成してください"
                  href="/admin"
                  isLast
                />
              </>
            )}
          </FlowSection>

          {/* 自宅撮影 */}
          <FlowSection
            label="自宅でヒメッコと撮影"
            color="var(--color-accent-wisteria)"
          >
            <FlowStep
              step={1}
              title="自宅でヒメッコと AR 撮影"
              description="QR コード不要でどこでもヒメッコと記念撮影できます"
              href="/camera"
              isLast
            />
          </FlowSection>

          {/* 軸②: 交流マッチング */}
          <FlowSection
            label="軸② 交流マッチング"
            color="var(--color-primary-400)"
          >
            <FlowStep
              step={1}
              title="交流コンテンツ一覧を見る"
              description="公開中の体験メニューを一覧で確認します"
              href="/activities"
            />
            {sampleActivity && sampleActivity.status === "PUBLISHED" ? (
              <>
                <FlowStep
                  step={2}
                  title="コンテンツの詳細を見る"
                  description={`「${sampleActivity.title}」の詳細ページを開きます`}
                  href={`/activities/${sampleActivity.id}`}
                />
                <FlowStep
                  step={3}
                  title="参加を申し込む"
                  description="名前を入力して参加申込を送信します"
                  href={`/activities/${sampleActivity.id}/apply`}
                />
                <FlowStep
                  step={4}
                  title="申込完了"
                  description="申込完了画面を確認します"
                  href={`/activities/${sampleActivity.id}/apply/complete`}
                  isLast
                />
              </>
            ) : sampleActivity ? (
              <FlowStep
                step={2}
                title="コンテンツの詳細を見る"
                description={`「${sampleActivity.title}」の詳細ページを開きます（終了済み）`}
                href={`/activities/${sampleActivity.id}`}
                isLast
              />
            ) : (
              <FlowStep
                step={2}
                title="コンテンツがありません"
                description="管理画面からアクティビティを作成してください"
                href="/admin"
                isLast
              />
            )}
          </FlowSection>
        </section>

        {/* 全ページリンク */}
        <section className="mb-12">
          <h2 className="mb-2 text-2xl font-bold text-neutral-800">
            ページ一覧
          </h2>
          <p className="mb-6 text-neutral-500">すべてのページへのリンク</p>

          <div className="grid gap-6">
            {/* 来村者向け — スポット */}
            <PageGroup title="来村者向け — AR記念撮影">
              <PageLink
                href="/camera"
                label="自宅で撮影"
                description="/camera"
              />
              <PageLink
                href="/spots"
                label="スポット一覧"
                description="/spots"
              />
              {sampleSpot && (
                <>
                  <PageLink
                    href={`/spots/${sampleSpot.slug}`}
                    label="スポット詳細"
                    description={`/spots/${sampleSpot.slug}`}
                  />
                  <PageLink
                    href={`/spots/${sampleSpot.slug}/camera`}
                    label="AR撮影"
                    description={`/spots/${sampleSpot.slug}/camera`}
                  />
                </>
              )}
            </PageGroup>

            {/* 来村者向け — 交流 */}
            <PageGroup title="来村者向け — 交流マッチング">
              <PageLink
                href="/activities"
                label="交流コンテンツ一覧"
                description="/activities"
              />
              {sampleActivity && (
                <>
                  <PageLink
                    href={`/activities/${sampleActivity.id}`}
                    label="コンテンツ詳細"
                    description={`/activities/${sampleActivity.id}`}
                  />
                  {sampleActivity.status === "PUBLISHED" && (
                    <>
                      <PageLink
                        href={`/activities/${sampleActivity.id}/apply`}
                        label="参加申込フォーム"
                        description={`/activities/${sampleActivity.id}/apply`}
                      />
                      <PageLink
                        href={`/activities/${sampleActivity.id}/apply/complete`}
                        label="申込完了"
                        description={`/activities/${sampleActivity.id}/apply/complete`}
                      />
                    </>
                  )}
                </>
              )}
            </PageGroup>

            {/* 管理者向け */}
            <PageGroup title="管理者向け">
              <PageLink
                href="/admin"
                label="管理ダッシュボード"
                description="/admin"
              />
            </PageGroup>

            {/* 開発ツール */}
            <PageGroup title="開発ツール">
              <PageLink
                href="/admin/emails"
                label="メールビューア"
                description="/admin/emails"
              />
            </PageGroup>

            {/* API */}
            <PageGroup title="API">
              <PageLink
                href="/api/health"
                label="ヘルスチェック"
                description="/api/health"
              />
            </PageGroup>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t border-neutral-200 py-8 text-center text-sm text-neutral-500">
        <p>
          Arcana Dev Portal — このページは {env.APP_ENV} 環境でのみ表示されます
        </p>
      </footer>
    </div>
  );
}

/* ─── サブコンポーネント ─── */

function FlowSection({
  label,
  color,
  children,
}: {
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div
        className="mb-0 rounded-t-xl px-5 py-3 font-bold text-neutral-0"
        style={{ backgroundColor: color }}
      >
        {label}
      </div>
      <div className="overflow-hidden rounded-b-xl border border-t-0 border-neutral-200 bg-neutral-0">
        {children}
      </div>
    </div>
  );
}

function FlowStep({
  step,
  title,
  description,
  href,
  isLast = false,
}: {
  step: number;
  title: string;
  description: string;
  href: string;
  isLast?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-start gap-4 bg-neutral-0 px-6 py-5 no-underline transition-all duration-150 ease-[ease] ${
        isLast ? "" : "border-b border-neutral-100"
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 font-bold text-primary-500">
        {step}
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-neutral-700">{title}</p>
        <p className="mt-1 text-neutral-400">{description}</p>
      </div>
      <Icon
        name="chevron-right"
        className="ml-auto mt-1 shrink-0 text-neutral-300"
        width={20}
        height={20}
      />
    </Link>
  );
}

function PageGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-0">
      <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-3 text-sm font-bold uppercase tracking-wider text-neutral-500">
        {title}
      </div>
      {children}
    </div>
  );
}

function PageLink({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border-b border-neutral-100 px-6 py-4 no-underline transition-all duration-150 ease-[ease]"
    >
      <span className="text-[18px] text-neutral-700">{label}</span>
      <code className="text-sm text-neutral-400">{description}</code>
    </Link>
  );
}
