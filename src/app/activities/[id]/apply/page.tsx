import CharacterContainer from "@/app/_components/CharacterContainer";
import { Icon } from "@/app/_components/Icon";
import SectionHeading from "@/app/_components/SectionHeading";
import { formatDateRange } from "@/lib/format-date";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EntryForm } from "./_components/entry-form";

async function getPublishedActivity(id: number) {
  return prisma.activity.findFirst({
    where: { id, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      images: {
        orderBy: { order: "asc" },
        take: 1,
      },
    },
  });
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isFinite(id) || id <= 0) {
    notFound();
  }

  const activity = await getPublishedActivity(id);

  if (!activity) {
    return (
      <div className="py-16 text-center">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--color-neutral-100)" }}
        >
          <Icon
            name="cancel-outline"
            width={32}
            height={32}
            style={{ color: "var(--color-neutral-400)" }}
          />
        </div>
        <p
          className="text-xl font-bold"
          style={{ color: "var(--color-neutral-700)" }}
        >
          申込を受け付けていません
        </p>
        <p className="mt-2" style={{ color: "var(--color-neutral-500)" }}>
          このコンテンツは現在申込を受け付けていないか、公開されていません。
        </p>
        <Link
          href="/activities"
          className="mt-8 inline-flex items-center gap-1"
          style={{
            color: "var(--color-primary-500)",
            textDecoration: "none",
            transition: "var(--transition-fast)",
          }}
        >
          <Icon name="chevron-left" width={20} height={20} />
          一覧に戻る
        </Link>
      </div>
    );
  }

  const firstImage = activity.images[0] ?? null;

  return (
    <article>
      {/* パンくず */}
      <nav aria-label="パンくず" className="mb-6">
        <Link
          href={`/activities/${activity.id}`}
          className="inline-flex items-center gap-1 no-underline text-secondary-500 [transition:var(--transition-fast)]"
        >
          <Icon name="chevron-left" width={20} height={20} />
          交流詳細に戻る
        </Link>
      </nav>

      {/* ページタイトル */}
      <div className="mb-8 text-center">
        <SectionHeading className="text-[32px] font-bold leading-[1.3] text-secondary-500">
          参加申し込み
        </SectionHeading>
      </div>

      {/* カード */}
      <div className="overflow-hidden rounded-3xl border-3 border-secondary-300 bg-white shadow-yellow">
        {/* アクティビティ画像 */}
        {firstImage && (
          <div className="relative aspect-video w-full">
            <Image
              src={firstImage.url}
              alt={activity.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* アクティビティ情報 */}
        <div className="px-6 pt-6 pb-1 text-center">
          <h3 className="text-2xl font-bold text-secondary-500 leading-[1.4]">
            {activity.title}
          </h3>
          <time
            dateTime={new Date(activity.startDate).toISOString()}
            className="mt-2 block tabular-nums text-arcana-orange-secondary whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {formatDateRange(activity.startDate, activity.endDate ?? null)}
          </time>
        </div>

        {/* フォーム */}
        <div className="px-6 pb-12 mt-6">
          <EntryForm activityId={activity.id} />
        </div>
      </div>

      <div className="mt-10">
        <CharacterContainer
          leftSrc="/assets/character/siro-egao.png"
          rightSrc="/assets/character/kuro-egao.png"
        />
      </div>
    </article>
  );
}
