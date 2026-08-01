import { Icon } from "@/app/_components/Icon";
import { Badge } from "@/app/_components/badge";
import { JoinButton } from "@/app/_components/join-button";
import type { ActivityStatus } from "@/generated/prisma/client";
import { formatDateRange } from "@/lib/format-date";
import Image from "next/image";

type ActivityCardProps = {
  id: number;
  title: string;
  description: string;
  status: ActivityStatus;
  startDate: string;
  endDate: string | null;
  thumbnailUrl: string | null;
};

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function ActivityCard({
  id,
  title,
  description,
  status,
  startDate,
  endDate,
  thumbnailUrl,
}: ActivityCardProps) {
  const isPublished = status === "PUBLISHED";

  return (
    <div className="relative">
      {/* バッジ: overflow-hidden の外側に配置してクリッピングを回避 */}
      <div className="absolute right-8 top-0 z-10">
        <Badge status={status} placement="top" />
      </div>
      <article className="overflow-hidden rounded-3xl border-3 border-arcana-limegreen bg-neutral-0 shadow-yellow">
        {/* サムネイル */}
        <div className="relative aspect-video w-full bg-neutral-100">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-neutral-300"
              aria-hidden="true"
            >
              <Icon name="image-outline" width={48} height={48} />
            </div>
          )}
        </div>

        {/* コンテンツ */}
        <div className="px-5 py-6">
          <h3 className="text-2xl font-bold leading-snug text-balance text-secondary-500">
            {title}
          </h3>
          <time
            dateTime={new Date(startDate).toISOString()}
            className="mt-2 block text-arcana-orange-secondary"
          >
            {formatDateRange(startDate, endDate)}
          </time>
          <p className="mt-3 text-base leading-relaxed text-pretty text-neutral-600">
            {truncate(description, 80)}
          </p>

          {/* ボタン */}
          <div className="mt-5 flex gap-2 sm:gap-3">
            <JoinButton
              variant="outline"
              href={`/activities/${id}`}
              className="flex-1"
            >
              詳しく見る
            </JoinButton>
            {isPublished && (
              <JoinButton
                variant="primary"
                href={`/activities/${id}/apply`}
                className="flex-1"
              >
                参加してみる
              </JoinButton>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
