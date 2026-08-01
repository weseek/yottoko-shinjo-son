"use client";

import type { CustomInputProps } from "@premieroctet/next-admin";
import type { ChangeEvent } from "react";

type Option = { value: string; label: string };

/**
 * next-admin は編集フォームの初期データで enum 種別のフィールドを
 * `{ label, value }` オブジェクトに変換して渡す（作成時や onChange 後は文字列）。
 * どちらの形でも現在値を取り出せるように正規化する。
 * これをしないと value が空文字にフォールバックし、常に先頭オプションが
 * 選択表示されてしまう（例: 既存レコードを開くと必ず「下書き」になる）。
 */
function resolveValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "value" in value) {
    const inner = (value as { value: unknown }).value;
    return typeof inner === "string" ? inner : "";
  }
  return "";
}

export function EnumSelectInput({
  value,
  onChange,
  disabled,
  required,
  name,
  options,
}: CustomInputProps & { options: Option[] }) {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange?.({
      target: { value: e.target.value, name },
    } as unknown as ChangeEvent<HTMLInputElement>);
  };

  return (
    <select
      name={name}
      value={resolveValue(value)}
      onChange={handleChange}
      disabled={disabled}
      required={required}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
