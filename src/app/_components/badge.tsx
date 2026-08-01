import type { ActivityStatus } from "@/generated/prisma/client";

type BadgeProps = {
  status: ActivityStatus;
  /** "top" を指定すると上辺がフラット（カード上端貼り付け用） */
  placement?: "default" | "top";
};

const statusConfig = {
  PUBLISHED: {
    label: "募集中",
    className: "bg-orange-500 text-white",
  },
  CLOSED: {
    label: "終了",
    className: "bg-[var(--color-secondary-500)] text-white",
  },
  DRAFT: {
    label: "下書き",
    className: "bg-[var(--color-neutral-300)] text-[var(--color-neutral-700)]",
  },
} satisfies Record<ActivityStatus, { label: string; className: string }>;

export function Badge({ status, placement = "default" }: BadgeProps) {
  const { label, className } = statusConfig[status];
  const rounded = placement === "top" ? "rounded-b-lg" : "rounded-lg";
  return (
    <span
      className={`inline-block px-4 py-3 text-sm font-bold leading-none ${rounded} ${className}`}
    >
      {label}
    </span>
  );
}
