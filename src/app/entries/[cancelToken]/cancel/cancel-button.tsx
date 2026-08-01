"use client";

import { buttonClassName } from "@/app/_components/button-variants";
import { useFormStatus } from "react-dom";

export function CancelSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="submit"
        disabled={pending}
        className={buttonClassName(
          "primary",
          "min-h-[52px] w-full px-8 disabled:opacity-60",
        )}
      >
        {pending ? "処理中..." : "キャンセルする"}
      </button>
      <p className="mt-3 text-center text-sm text-[var(--color-neutral-500)]">
        ボタンを押すとキャンセルが確定します
      </p>
    </>
  );
}
