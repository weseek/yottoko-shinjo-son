"use client";

import type { CustomInputProps } from "@premieroctet/next-admin";
import { useEffect, useState } from "react";

type Props = CustomInputProps & {
  /** 公開サイトのベース URL（例: https://example.com）。未指定なら相対パスで表示する */
  baseUrl?: string | null;
};

/** baseUrl から origin を取り出す。不正な値なら null（相対パス表示にフォールバック） */
function toOrigin(baseUrl?: string | null): string | null {
  if (!baseUrl) return null;
  try {
    return new URL(baseUrl).origin;
  } catch {
    return null;
  }
}

function buildUrl(origin: string | null, path: string): string {
  return origin ? `${origin}${path}` : path;
}

function UrlRow({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // クリップボード API が使えない環境では何もしない（リンクから手動コピー可能）
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-[var(--color-neutral-500)]">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 flex-1 truncate rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-sm text-blue-700 underline decoration-blue-300 underline-offset-2 hover:text-blue-800"
        >
          {url}
        </a>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`${label}のURLをコピー`}
          className="inline-flex shrink-0 items-center rounded-md border border-[var(--color-neutral-300)] bg-white px-2.5 py-2 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-neutral-100)]"
        >
          {copied ? "コピー済み" : "コピー"}
        </button>
      </div>
    </div>
  );
}

/**
 * スポットの公開 URL（詳細ページ・AR カメラページ）を管理画面に表示する読み取り専用パネル。
 * DB カラムには対応しない仮想フィールドのため、options.tsx の beforeDb で値を除去する。
 *
 * 表示するスラッグは、保存済みの値（item.slug）を初期値とし、
 * 編集フォームのスラッグ入力欄をライブ購読して入力中も即時反映する。
 */
export function SpotPublicUrls({ item, baseUrl }: Props) {
  const savedSlug =
    item && typeof item === "object" && typeof item.slug === "string"
      ? item.slug
      : "";
  const [slug, setSlug] = useState(savedSlug);

  // 同フォーム内のスラッグ入力欄を購読し、入力に追従して URL を更新する。
  // 入力欄が見つからない場合は保存済みスラッグのままフォールバックする。
  useEffect(() => {
    const input =
      document.querySelector<HTMLInputElement>('input[name="slug"]');
    if (!input) return;
    setSlug(input.value || savedSlug);
    const handle = () => setSlug(input.value);
    input.addEventListener("input", handle);
    return () => input.removeEventListener("input", handle);
  }, [savedSlug]);

  const origin = toOrigin(baseUrl);
  const trimmedSlug = slug.trim();

  if (!trimmedSlug) {
    return (
      <p className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] px-3 py-2 text-sm text-[var(--color-neutral-500)]">
        スラッグを入力すると、公開される詳細ページと AR カメラページの URL
        がここに表示されます。
      </p>
    );
  }

  const detailUrl = buildUrl(origin, `/spots/${trimmedSlug}`);
  const cameraUrl = buildUrl(origin, `/spots/${trimmedSlug}/camera`);

  return (
    <div className="flex flex-col gap-3">
      <UrlRow label="スポット詳細ページ" url={detailUrl} />
      <UrlRow label="AR カメラページ" url={cameraUrl} />
      <p className="text-xs text-[var(--color-neutral-400)]">
        ※ 公開（ステータス「公開中」）にすると上記 URL でアクセスできます。
      </p>
    </div>
  );
}
