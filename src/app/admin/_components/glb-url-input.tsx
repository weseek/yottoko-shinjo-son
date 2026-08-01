"use client";

import { Icon } from "@/app/_components/Icon";
import type { CustomInputProps } from "@premieroctet/next-admin";
import type { ChangeEvent } from "react";

type Props = CustomInputProps & {
  bucket?: string | null;
  isDev?: boolean;
};

export function GlbUrlInput({
  value,
  onChange,
  disabled,
  name,
  bucket,
  isDev,
}: Props) {
  const consoleUrl = bucket
    ? `https://console.cloud.google.com/storage/browser/${bucket}/ar-models`
    : null;
  const placeholder = isDev
    ? "/assets/your-model.glb"
    : bucket
      ? `https://storage.googleapis.com/${bucket}/ar-models/your-model.glb`
      : "https://storage.googleapis.com/<bucket>/ar-models/<filename>.glb";

  return (
    <div className="flex flex-col gap-3">
      {isDev ? (
        <div className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3 text-sm text-[var(--color-neutral-700)]">
          <p className="font-medium">開発環境（ローカル配置）</p>
          <p className="mt-1.5 text-[var(--color-neutral-600)]">
            <code className="rounded bg-[var(--color-neutral-100)] px-1">
              public/
            </code>{" "}
            配下に{" "}
            <code className="rounded bg-[var(--color-neutral-100)] px-1">
              .glb
            </code>{" "}
            ファイルを置き、対応する URL を入力欄に貼り付けてください。
          </p>
          <p className="mt-1 text-[var(--color-neutral-500)]">
            例:{" "}
            <code className="rounded bg-[var(--color-neutral-100)] px-1">
              public/assets/your-model.glb
            </code>{" "}
            →{" "}
            <code className="rounded bg-[var(--color-neutral-100)] px-1">
              /assets/your-model.glb
            </code>
          </p>
          <p className="mt-1 text-[var(--color-neutral-500)]">
            キャラクターの 3D モデルはリポジトリに含まれていません。別途入手して
            配置してください。
          </p>
        </div>
      ) : (
        <div className="rounded-md border border-[var(--color-neutral-200)] bg-[var(--color-neutral-50)] p-3 text-sm text-[var(--color-neutral-700)]">
          <p className="font-medium">アップロード手順（GCS）</p>
          <ol className="mt-1.5 list-inside list-decimal space-y-1 text-[var(--color-neutral-600)]">
            <li>
              下のボタンから GCS バケット
              {bucket && (
                <code className="mx-1 rounded bg-[var(--color-neutral-100)] px-1">
                  {bucket}
                </code>
              )}
              の{" "}
              <code className="rounded bg-[var(--color-neutral-100)] px-1">
                ar-models/
              </code>{" "}
              を開く（フォルダが無ければ作成）
            </li>
            <li>
              「ファイルをアップロード」から{" "}
              <code className="rounded bg-[var(--color-neutral-100)] px-1">
                .glb
              </code>{" "}
              を選択
              <ul className="ml-5 mt-0.5 list-disc text-xs text-[var(--color-neutral-500)]">
                <li>
                  ファイル名は半角英数字＋ハイフン推奨（例:{" "}
                  <code>himekko-v2.glb</code>）
                </li>
                <li>
                  アップロード後にオブジェクトを開き、権限が「公開」になっていることを確認
                </li>
              </ul>
            </li>
            <li>
              オブジェクト詳細 →「公開 URL」（
              <code className="rounded bg-[var(--color-neutral-100)] px-1">
                https://storage.googleapis.com/...
              </code>
              ）をコピー
            </li>
            <li>下の入力欄に貼り付けて、ページ下部の「保存」を押す</li>
          </ol>
          {consoleUrl && (
            <a
              href={consoleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 inline-flex items-center gap-1.5 rounded-md border border-[var(--color-neutral-300)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--color-neutral-700)] transition-colors hover:bg-[var(--color-neutral-100)]"
            >
              <Icon name="open-in-new" width={14} height={14} />
              GCS Console を開く
            </a>
          )}
        </div>
      )}

      <input
        type="text"
        name={name}
        value={value ?? ""}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChange?.({
            target: { value: e.target.value },
          } as ChangeEvent<HTMLInputElement>)
        }
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-md border border-[var(--color-neutral-300)] bg-white px-3 py-2 text-sm text-[var(--color-neutral-900)] placeholder:text-[var(--color-neutral-400)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
