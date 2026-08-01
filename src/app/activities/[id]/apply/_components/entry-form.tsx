"use client";

import { Icon } from "@/app/_components/Icon";
import { buttonClassName } from "@/app/_components/button-variants";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { EntryFormState } from "../actions";
import { createEntry } from "../actions";

const INITIAL_STATE: EntryFormState = { errors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClassName(
        "primary",
        "min-h-[52px] w-full px-8 py-3 disabled:cursor-not-allowed disabled:opacity-70",
      )}
    >
      {pending ? "送信中..." : "申し込む"}
    </button>
  );
}

type EntryFormProps = {
  activityId: number;
};

export function EntryForm({ activityId }: EntryFormProps) {
  const boundAction = createEntry.bind(null, activityId);
  const [state, formAction] = useActionState(boundAction, INITIAL_STATE);

  return (
    <form action={formAction}>
      <div className="grid gap-6">
        {/* お名前 */}
        <div>
          <label
            htmlFor="entry-name"
            className="mb-2 block font-bold text-neutral-700"
          >
            お名前
            <span className="ml-2 inline-block rounded-full bg-orange-500 px-2.5 py-0.5  font-bold text-white">
              必須
            </span>
          </label>
          <input
            id="entry-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            aria-describedby={
              state.errors.name ? "entry-name-error" : undefined
            }
            aria-invalid={state.errors.name ? true : undefined}
            className={`w-full rounded-md bg-neutral-0 px-4 py-3 leading-normal text-neutral-700 outline-none transition-all duration-150 ease-[ease] ${
              state.errors.name
                ? "border-2 border-[var(--color-danger-500,#dc2626)]"
                : "border border-neutral-300"
            }`}
            placeholder="例: 山田 太郎"
          />
          {state.errors.name && (
            <p
              id="entry-name-error"
              role="alert"
              className="mt-2 text-sm text-[var(--color-danger-500,#dc2626)]"
            >
              {state.errors.name}
            </p>
          )}
        </div>

        {/* メッセージ */}
        <div>
          <label
            htmlFor="entry-message"
            className="mb-2 block font-bold text-neutral-700"
          >
            メッセージ
            <span className="ml-2 inline-block rounded-full bg-neutral-200 px-2.5 py-0.5  font-bold text-neutral-600">
              任意
            </span>
          </label>
          <textarea
            id="entry-message"
            name="message"
            rows={4}
            className="w-full rounded-md border border-neutral-300 bg-neutral-0 px-4 py-3 leading-normal text-neutral-700 outline-none resize-y transition-all duration-150 ease-[ease]"
            placeholder="参加にあたってのメッセージがあればお書きください"
          />
          {/* 注意事項 */}
          <ul className="mt-3 space-y-1.5">
            {[
              "個人情報を記入しないでください",
              "いただいたメッセージへのご返答はできません",
            ].map((note) => (
              <li
                key={note}
                className="flex items-start gap-2 text-sm text-neutral-600"
              >
                <Icon
                  name="error-outline"
                  width={18}
                  height={18}
                  className="mt-0.5 shrink-0 text-[var(--color-secondary-500)]"
                />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* サーバーエラー */}
      <div aria-live="polite" className="mt-4">
        {state.errors.server && (
          <p
            role="alert"
            className="rounded-lg border border-[var(--color-danger-200,#fecaca)] bg-[var(--color-danger-50,#fef2f2)] px-4 py-3 text-[var(--color-danger-500,#dc2626)]"
          >
            {state.errors.server}
          </p>
        )}
      </div>

      {/* 送信ボタン */}
      <div className="mt-8">
        <SubmitButton />
      </div>
    </form>
  );
}
