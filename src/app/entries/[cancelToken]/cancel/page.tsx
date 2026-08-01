import CharacterContainer from "@/app/_components/CharacterContainer";
import SectionHeading from "@/app/_components/SectionHeading";
import { EntryStatus } from "@/generated/prisma/client";
import { formatDateRange } from "@/lib/format-date";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { cancelEntry } from "./actions";
import { CancelSubmitButton } from "./cancel-button";

async function getEntryByToken(cancelToken: string) {
  return prisma.entry.findFirst({
    where: { cancelToken, status: { notIn: [EntryStatus.CANCELLED] } },
    select: {
      id: true,
      name: true,
      activity: {
        select: { id: true, title: true, startDate: true, endDate: true },
      },
    },
  });
}

export default async function CancelPage({
  params,
}: {
  params: Promise<{ cancelToken: string }>;
}) {
  const { cancelToken } = await params;

  const entry = await getEntryByToken(cancelToken);

  if (!entry) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-bold text-[var(--color-neutral-700)]">
          申込が見つかりません
        </p>
        <p className="mt-2 text-base text-[var(--color-neutral-500)]">
          すでにキャンセル済みか、URLが正しくない可能性があります。
        </p>
        <Link
          href="/activities"
          className="mt-8 inline-flex items-center gap-1 text-base text-arcana-primary-green no-underline"
        >
          ‹ 一覧に戻る
        </Link>
      </div>
    );
  }

  const cancelAction = cancelEntry.bind(null, cancelToken);

  return (
    <div className="py-8 text-center">
      {/* タイトル */}
      <SectionHeading
        mark={false}
        className="text-[28px] font-bold leading-[1.3] text-arcana-primary-green"
      >
        交流のキャンセル
      </SectionHeading>

      {/* 申込内容カード */}
      <div className="mx-auto mt-8 max-w-md overflow-hidden rounded-2xl bg-white shadow-[2px_3px_0_rgba(255,218,72,0.5)]">
        <div className="p-6 text-left">
          <dl className="space-y-4">
            <div>
              <dt className="text-sm text-body-blue">アクティビティ名:</dt>
              <dd className="mt-0.5 text-base font-bold text-body-blue">
                {entry.activity.title}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-body-blue">アクティビティID:</dt>
              <dd className="mt-0.5 text-base text-body-blue">
                {entry.activity.id}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-body-blue">実施日時:</dt>
              <dd className="mt-0.5 text-base font-bold text-body-blue">
                {formatDateRange(
                  entry.activity.startDate,
                  entry.activity.endDate,
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm text-body-blue">予約者名:</dt>
              <dd className="mt-0.5 text-base font-bold text-body-blue">
                {entry.name}
              </dd>
            </div>
          </dl>

          {/* キャンセルボタン */}
          <form action={cancelAction} className="mt-6">
            <CancelSubmitButton />
          </form>
        </div>
      </div>

      {/* 猫イラスト */}
      <div className="mt-8">
        <CharacterContainer
          leftSrc="/assets/character/siro-default.png"
          rightSrc="/assets/character/kuro-default.png"
        />
      </div>
    </div>
  );
}
