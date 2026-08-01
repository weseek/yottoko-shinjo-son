"use client";

import { Icon } from "@/app/_components/Icon";
import type { CustomInputProps } from "@premieroctet/next-admin";
import { usePathname } from "next/navigation";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

type ImageItem = {
  id: number;
  url: string;
  order: number;
};

export function ActivityImagesInput({
  disabled,
  onChange,
  name,
}: CustomInputProps) {
  const pathname = usePathname();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingIdRef = useRef(0);

  const match = pathname?.match(/\/activity\/(\d+)/);
  const activityId = match ? Number(match[1]) : null;

  useEffect(() => {
    if (!activityId) return;
    fetch(`/api/admin/activity-images?activityId=${activityId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setImages(data);
      })
      .catch(() => setError("画像の取得に失敗しました"));
  }, [activityId]);

  const notifyForm = (updatedImages: ImageItem[]) => {
    onChange?.({
      target: { value: updatedImages.map((img) => img.url).join(",") },
    } as ChangeEvent<HTMLInputElement>);
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        setError(uploadData.error ?? "アップロードに失敗しました");
        return;
      }

      if (activityId) {
        const nextOrder =
          images.length > 0
            ? Math.max(...images.map((img) => img.order)) + 1
            : 0;
        const createRes = await fetch("/api/admin/activity-images", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activityId,
            url: uploadData.url,
            order: nextOrder,
          }),
        });
        const createData = await createRes.json();
        if (!createRes.ok) {
          setError(createData.error ?? "画像の登録に失敗しました");
          return;
        }
        setImages((prev) => [...prev, createData]);
      } else {
        const tempId = --pendingIdRef.current;
        const updated = [
          ...images,
          { id: tempId, url: uploadData.url, order: images.length },
        ];
        setImages(updated);
        notifyForm(updated);
      }
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (img: ImageItem) => {
    setError(null);

    if (activityId) {
      const res = await fetch(`/api/admin/activity-images/${img.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "削除に失敗しました");
        return;
      }
    }

    const updated = images.filter((i) => i.id !== img.id);
    setImages(updated);
    if (!activityId) notifyForm(updated);
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= images.length) return;

    const current = images[index];
    const target = images[swapIndex];
    setError(null);

    if (activityId) {
      const [res1, res2] = await Promise.all([
        fetch(`/api/admin/activity-images/${current.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: target.order }),
        }),
        fetch(`/api/admin/activity-images/${target.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: current.order }),
        }),
      ]);
      if (!res1.ok || !res2.ok) {
        setError("並び替えに失敗しました");
        return;
      }
    }

    const newImages = [...images];
    newImages[index] = { ...current, order: target.order };
    newImages[swapIndex] = { ...target, order: current.order };
    const sorted = newImages.sort((a, b) => a.order - b.order);
    setImages(sorted);
    if (!activityId) notifyForm(sorted);
  };

  return (
    <div className="flex flex-col gap-4">
      {images.length > 0 && (
        <div className="flex flex-col gap-3">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <img
                src={img.url}
                alt={`画像 ${index + 1}`}
                className="h-20 w-28 flex-shrink-0 rounded object-cover"
              />
              <p className="min-w-0 flex-1 break-all text-xs text-[var(--color-neutral-400)]">
                {img.url}
              </p>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(index, "up")}
                  disabled={index === 0}
                  aria-label="上へ移動"
                  className="rounded px-2 py-1 text-sm hover:bg-[var(--color-neutral-100)] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, "down")}
                  disabled={index === images.length - 1}
                  aria-label="下へ移動"
                  className="rounded px-2 py-1 text-sm hover:bg-[var(--color-neutral-100)] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(img)}
                className="text-sm text-[var(--color-error)] hover:underline"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}

      <label
        className={`inline-flex w-fit cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
          disabled || uploading
            ? "cursor-not-allowed opacity-50"
            : "hover:bg-[var(--color-neutral-50)]"
        }`}
      >
        <Icon name="upload" width={16} height={16} />
        {uploading ? "アップロード中..." : "画像を選択"}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleUpload}
          disabled={disabled || uploading}
        />
      </label>

      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

      <input
        type="hidden"
        name={name}
        value={images.map((img) => img.url).join(",")}
      />
    </div>
  );
}
