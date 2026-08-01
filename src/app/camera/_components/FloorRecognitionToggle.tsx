"use client";

import { useId } from "react";

export interface FloorRecognitionToggleProps {
  /** 現在、床認識がオンかどうか */
  enabled: boolean;
  /** タップ時に反転後の値で呼ばれる */
  onChange: (enabled: boolean) => void;
}

/**
 * 床認識のオン/オフを切り替える表示専用トグルスイッチ。
 * 自宅撮影(HomeArExperience)・スポット撮影(ArLanding経由のSpotArExperience)の
 * 両ページから共有利用する(app/camera/_components配下をhome/spotで無改名共有する
 * 既存の前例に倣う)。
 *
 * 内部stateを持たない制御コンポーネント(呼び出し元がfloorRecognitionEnabledを保持する)。
 *
 * shadcn/ui Switch(https://ui.shadcn.com/docs/components/base/switch)のtrack+thumb
 * 表現に倣ったスライド式スイッチとして実装している。コードレビューで、状態ごとにラベル文言・
 * アイコンが丸ごと切り替わる旧ボタン実装は「ボタンとスイッチが混在して見える」との指摘を受け、
 * スイッチ専用の見た目に変更した(research.md「Design Decisions > トグルUIの表現形式 > Revision」参照)。
 *
 * スイッチの原則として、ラベル(「床認識機能を有効にする」)は状態にかかわらず固定表示する。
 * 状態依存の説明はラベルではなく、スイッチ下のキャプションでのみ出し分ける。
 *
 * role="switch"とaria-checkedで状態を伝え、aria-labelledbyで固定ラベルと関連付ける(5.2)。
 * 視覚的な状態表現もトラック色とサムの位置の両方で行い、色のみに依存しない。
 */
export default function FloorRecognitionToggle({
  enabled,
  onChange,
}: FloorRecognitionToggleProps) {
  const labelId = useId();

  return (
    <div>
      <div className="flex items-center gap-4">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-labelledby={labelId}
          onClick={() => onChange(!enabled)}
          className="relative inline-flex size-12 shrink-0 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
        >
          <span
            aria-hidden="true"
            className={`inline-flex h-7 w-12 items-center rounded-full p-0.5 transition-colors ${
              enabled ? "bg-arcana-primary-green" : "bg-neutral-400"
            }`}
          >
            <span
              className={`block size-6 rounded-full bg-white shadow-[var(--shadow-md)] transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </span>
        </button>
        <span id={labelId} className="text-base leading-[1.5] text-body-blue">
          床認識機能を有効にする
        </span>
      </div>
      <p className="mt-1 text-sm leading-[1.5] text-neutral-500">
        {enabled
          ? "床を自動で検出して、ひめっこを立体的に配置します"
          : "手動でひめっこの位置を調整しながら撮影できます"}
      </p>
    </div>
  );
}
