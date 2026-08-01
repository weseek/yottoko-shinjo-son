"use client";

import { Icon } from "@/app/_components/Icon";
import { useState } from "react";

type ImageItem = {
  id: number;
  url: string;
};

type Props = {
  images: ImageItem[];
  alt: string;
  className?: string;
};

export function ActivityImageCarousel({
  images,
  alt,
  className = "mt-8",
}: Props) {
  const [current, setCurrent] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className={`${className} flex aspect-video w-full items-center justify-center rounded-lg bg-[var(--color-neutral-100)] text-[var(--color-neutral-300)]`}
        role="img"
        aria-label="画像なし"
      >
        <Icon name="image-outline" width={64} height={64} />
      </div>
    );
  }

  const hasPrev = current > 0;
  const hasNext = current < images.length - 1;

  const prev = () => setCurrent((i) => Math.max(0, i - 1));
  const next = () => setCurrent((i) => Math.min(images.length - 1, i + 1));

  return (
    <div className={className}>
      {/* メイン画像エリア */}
      <section
        className="relative overflow-hidden rounded-lg"
        aria-label="画像ギャラリー"
      >
        <div className="aspect-video w-full bg-[var(--color-neutral-100)]">
          <img
            key={images[current].id}
            src={images[current].url}
            alt={`${alt}（${current + 1}枚目）`}
            className="h-full w-full rounded-lg object-cover"
          />
        </div>

        {/* 枚数カウンター */}
        {images.length > 1 && (
          <div
            className="absolute right-3 top-3 rounded-full bg-[rgba(30,28,25,0.6)] px-3 py-1 text-sm leading-normal tabular-nums text-[var(--color-neutral-0)]"
            aria-hidden="true"
          >
            {current + 1} / {images.length}
          </div>
        )}

        {/* 前へボタン */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={prev}
            disabled={!hasPrev}
            aria-label="前の画像"
            className={`absolute left-3 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full border border-[var(--color-neutral-200)] bg-[rgba(255,255,255,0.92)] shadow-[var(--shadow-md)] ${hasPrev ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-35"}`}
          >
            <Icon
              name="chevron-left"
              width={20}
              height={20}
              className="text-[var(--color-neutral-700)]"
            />
          </button>
        )}

        {/* 次へボタン */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={next}
            disabled={!hasNext}
            aria-label="次の画像"
            className={`absolute right-3 top-1/2 -translate-y-1/2 flex size-12 items-center justify-center rounded-full border border-[var(--color-neutral-200)] bg-[rgba(255,255,255,0.92)] shadow-[var(--shadow-md)] ${hasNext ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-35"}`}
          >
            <Icon
              name="chevron-right"
              width={20}
              height={20}
              className="text-[var(--color-neutral-700)]"
            />
          </button>
        )}
      </section>

      {/* ドットインジケーター */}
      {images.length > 1 && (
        <div
          className="mt-3 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="画像を選択"
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`${i + 1}枚目の画像`}
              onClick={() => setCurrent(i)}
              className={`h-2 min-w-2 cursor-pointer rounded border-0 p-0 ${
                i === current
                  ? "w-6 bg-[var(--color-primary-400)]"
                  : "w-2 bg-[var(--color-neutral-300)]"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
