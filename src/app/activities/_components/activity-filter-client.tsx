"use client";

import { buttonClassName } from "@/app/_components/button-variants";
import type { ActivityStatus } from "@/generated/prisma/client";
import { useState } from "react";
import { ActivityCard } from "./activity-card";

type Activity = {
  id: number;
  title: string;
  description: string;
  status: ActivityStatus;
  startDate: string;
  endDate: string | null;
  thumbnailUrl: string | null;
};

type Filter = "all" | "published";

export function ActivityFilterClient({
  activities,
}: { activities: Activity[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all"
      ? activities
      : activities.filter((a) => a.status === "PUBLISHED");

  return (
    <div>
      {/* フィルターボタン */}
      <div className="mb-4 flex gap-3">
        <FilterButton
          variant="standard"
          ariaPressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          すべて
        </FilterButton>
        <FilterButton
          variant="outline"
          ariaPressed={filter === "published"}
          onClick={() => setFilter("published")}
        >
          募集中のみ
        </FilterButton>
      </div>

      {/* カード一覧 */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-base text-neutral-500">
          現在募集中の体験メニューはありません
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} {...activity} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterButton({
  variant,
  ariaPressed,
  onClick,
  children,
}: {
  variant: "standard" | "outline";
  ariaPressed: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={ariaPressed}
      onClick={onClick}
      className={buttonClassName(variant, "px-6 py-2.5")}
    >
      {children}
    </button>
  );
}
