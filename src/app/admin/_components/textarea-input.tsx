"use client";

import type { CustomInputProps } from "@premieroctet/next-admin";
import type { ChangeEvent } from "react";

export function TextareaInput({
  value,
  onChange,
  disabled,
  required,
  name,
  placeholder = "集合日時:\n集合場所:\n定員:\n対象:\n持ち物:",
}: CustomInputProps & { placeholder?: string }) {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.({
      target: { value: e.target.value, name },
    } as unknown as ChangeEvent<HTMLInputElement>);
  };

  return (
    <textarea
      name={name}
      value={typeof value === "string" ? value : ""}
      onChange={handleChange}
      disabled={disabled}
      required={required}
      rows={8}
      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      placeholder={placeholder}
    />
  );
}
