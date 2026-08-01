"use client";

import { useEffect, useRef } from "react";
import ModelViewer from "./ModelViewer";

export interface ArModalProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export default function ArModal({ src, alt, onClose }: ArModalProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    // biome-ignore lint/a11y/useSemanticElements: <dialog> requires JS showModal/close lifecycle that conflicts with React conditional rendering; role=dialog + aria-modal is equivalent for AT
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ひめっこ 3D ビューア"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(30,28,25,0.85)] px-4"
    >
      <div className="relative w-full max-w-lg">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute -top-12 right-0 flex h-11 w-11 items-center justify-center rounded-full border-0 bg-[rgba(255,255,255,0.15)] text-2xl leading-none text-[var(--color-neutral-0)] transition hover:bg-[rgba(255,255,255,0.25)]"
        >
          ×
        </button>
        <div
          className="overflow-hidden rounded-2xl"
          style={{ aspectRatio: "1 / 1" }}
        >
          <ModelViewer src={src} alt={alt} />
        </div>
        <p className="mt-4 text-center text-base text-[var(--color-neutral-0)] leading-[1.5]">
          お使いの端末では AR 表示に対応していないため、3D
          モデルでご覧ください。
        </p>
      </div>
    </div>
  );
}
