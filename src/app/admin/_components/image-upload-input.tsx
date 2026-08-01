"use client";

import { Icon } from "@/app/_components/Icon";
import type { CustomInputProps } from "@premieroctet/next-admin";
import { type ChangeEvent, useRef, useState } from "react";

export function ImageUploadInput({
  value,
  onChange,
  disabled,
  required,
  name,
}: CustomInputProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "アップロードに失敗しました");
    } else {
      onChange?.({
        target: { value: data.url },
      } as ChangeEvent<HTMLInputElement>);
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      {value && (
        <div>
          <img
            src={value}
            alt="現在の画像"
            className="h-32 w-48 rounded-lg object-cover"
          />
          <p className="mt-1 break-all text-xs text-[var(--color-neutral-400)]">
            {value}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
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
            onChange={handleFileChange}
            disabled={disabled || uploading}
            required={required && !value}
          />
        </label>

        {value && (
          <button
            type="button"
            className="text-sm text-[var(--color-error)] hover:underline"
            onClick={() =>
              onChange?.({
                target: { value: "" },
              } as ChangeEvent<HTMLInputElement>)
            }
          >
            削除
          </button>
        )}
      </div>

      {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}

      <input type="hidden" name={name} value={value ?? ""} />
    </div>
  );
}
