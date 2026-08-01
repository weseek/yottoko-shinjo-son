import CharacterContainer from "@/app/_components/CharacterContainer";
import { Icon } from "@/app/_components/Icon";
import { Badge } from "@/app/_components/badge";
import { JoinButton } from "@/app/_components/join-button";
import { ActivityImageCarousel } from "@/app/activities/_components/activity-image-carousel";
import { formatDateRange } from "@/lib/format-date";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

async function getActivityById(id: number) {
  const activity = await prisma.activity.findFirst({
    where: {
      id,
      status: { in: ["PUBLISHED", "CLOSED"] },
    },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
  });
  return activity;
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  const activity = await getActivityById(id);

  if (!activity) {
    notFound();
  }

  const isClosed = activity.status === "CLOSED";

  return (
    <article>
      {/* パンくず */}
      <nav aria-label="パンくず" className="mb-8">
        <Link
          href="/activities"
          className="inline-flex items-center gap-1 no-underline [transition:var(--transition-fast)] text-arcana-primary-green"
        >
          <Icon name="chevron-left" width={20} height={20} />
          一覧に戻る
        </Link>
      </nav>

      {/* カード */}
      <div className="relative">
        {/* バッジ：activity-card と同じ手法で上辺中央に配置 */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
          <Badge status={activity.status} placement="top" />
        </div>

        <div className="overflow-hidden rounded-3xl bg-white shadow-yellow">
          {/* タイトル・日程 */}
          <div className="px-6 pt-8 pb-0 text-center">
            <h1 className="text-[32px] font-bold leading-[1.3] text-balance text-secondary-500 mt-8">
              {activity.title}
            </h1>
            <p className="mt-3 tabular-nums text-arcana-orange-secondary">
              <time
                dateTime={new Date(activity.startDate).toISOString()}
                aria-label={`開催日時: ${formatDateRange(activity.startDate, activity.endDate ?? null)}`}
              >
                {formatDateRange(activity.startDate, activity.endDate ?? null)}
              </time>
            </p>
          </div>

          {/* 画像 */}
          <div className="px-4">
            <ActivityImageCarousel
              images={activity.images}
              alt={activity.title}
              className="mt-5"
            />
          </div>

          {/* 説明・詳細・ボタン */}
          <div className="px-6 pb-8">
            <div className="mt-6 whitespace-pre-wrap text-[18px] leading-[1.8] text-pretty text-[var(--color-neutral-600)]">
              {activity.description}
            </div>

            {activity.detail && (
              <div className="mt-6 whitespace-pre-wrap leading-[1.8] text-[var(--color-neutral-700)]">
                {activity.detail}
              </div>
            )}

            {!isClosed && (
              <div className="mt-10 flex justify-center">
                <JoinButton
                  variant="primary"
                  href={`/activities/${activity.id}/apply`}
                  className="!px-12 !py-4 text-[18px]"
                >
                  参加してみる
                </JoinButton>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <CharacterContainer
          leftSrc="/assets/character/siro-maneki.png"
          rightSrc="/assets/character/kuro-maneki.png"
        />
      </div>
    </article>
  );
}
