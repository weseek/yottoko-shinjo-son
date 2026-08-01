"use client";

import { Icon } from "@/app/_components/Icon";
import { buttonClassName } from "@/app/_components/button-variants";

export interface OperationGuideProps {
  /** ガイドを閉じ、カメラアクセス要求(HomeArFallbackSceneのマウント)へ進むためのコールバック(7.3, 7.4)。 */
  onDismiss: () => void;
}

const ITEMS = [
  {
    icon: "open-with",
    text: "一本指でドラッグすると、ヒメッコを移動できます",
  },
  {
    icon: "pinch-outline",
    text: "二本指でピンチすると、ヒメッコの大きさを変えられます",
  },
  {
    icon: "rotate-right",
    text: "画面内のボタンで、ヒメッコの向きを回転できます",
  },
] as const;

/**
 * カメラへのアクセスを許可する前に、ヒメッコの操作方法(移動・拡大縮小・回転)を
 * 説明するガイド(7.1-7.5)。状態を持たない表示専用コンポーネント。
 */
export default function OperationGuide({ onDismiss }: OperationGuideProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 15,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(30, 28, 25, 0.85)",
        padding: 24,
      }}
    >
      <div
        style={{
          backgroundColor: "var(--color-neutral-0)",
          borderRadius: 16,
          padding: "32px 24px",
          maxWidth: 360,
          width: "100%",
        }}
      >
        <h2
          className="font-bold"
          style={{
            fontSize: 20,
            color: "var(--color-neutral-800)",
            margin: "0 0 20px 0",
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          ヒメッコの操作方法
        </h2>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {ITEMS.map((item) => (
            <li
              key={item.icon}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <Icon
                name={item.icon}
                width={28}
                height={28}
                className="shrink-0 text-arcana-primary-green"
              />
              <p
                style={{
                  fontSize: 16,
                  color: "var(--color-neutral-600)",
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {item.text}
              </p>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="操作方法を確認してカメラへ進む"
          className={buttonClassName(
            "primary",
            "w-full min-h-[48px] mt-7 px-7 py-3.5",
          )}
        >
          はじめる
        </button>
      </div>
    </div>
  );
}
