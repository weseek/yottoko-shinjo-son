import CharacterContainer from "@/app/_components/CharacterContainer";
import { formatDateRange } from "@/lib/format-date";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getActivity(id: number) {
  return prisma.activity.findFirst({
    where: { id },
    select: { title: true, startDate: true, endDate: true },
  });
}

export default async function CancelCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ activityId?: string; name?: string }>;
}) {
  const { activityId: activityIdParam, name } = await searchParams;
  const activityId = Number(activityIdParam);
  const activity =
    Number.isFinite(activityId) && activityId > 0
      ? await getActivity(activityId)
      : null;
  const entryName = name ?? null;

  return (
    <div className="py-8 text-center">
      {/* 猫イラスト */}
      <div className="mb-6">
        <CharacterContainer
          leftSrc="/assets/character/siro-ojigi.png"
          rightSrc="/assets/character/kuro-ojigi.png"
          gapClassName="gap-8"
        />
      </div>

      {/* 完了メッセージ */}
      <h2 className="text-[28px] font-bold leading-[1.4] text-arcana-primary-green">
        交流の予約が
        <br />
        キャンセルされました
      </h2>

      {/* キャンセル済み申込内容カード */}
      {activity && (
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
            </dl>
          </div>
        </div>
      )}

      {/* 導線 */}
      <div className="mt-8">
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
