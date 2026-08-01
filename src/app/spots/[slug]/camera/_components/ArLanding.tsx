"use client";

import AppHeader from "@/app/_components/AppHeader";
import CharacterContainer from "@/app/_components/CharacterContainer";
import { Icon } from "@/app/_components/Icon";
import SectionHeading from "@/app/_components/SectionHeading";
import { buttonClassName } from "@/app/_components/button-variants";
import FloorRecognitionToggle from "@/app/camera/_components/FloorRecognitionToggle";
import dynamic from "next/dynamic";
import Link from "next/link";

const NORMALIZE_JP_RE =
  /(?<=[\u3000-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]) +(?=[\u3000-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF])/g;

function normalizeJapanese(text: string): string {
  return text.replace(NORMALIZE_JP_RE, "");
}

const ModelViewer = dynamic(
  () => import("@/app/camera/_components/ModelViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[var(--color-camera-bg)] text-sm leading-[1.5] text-neutral-500">
        読み込み中…
      </div>
    ),
  },
);

export interface ArLandingProps {
  spot: {
    name: string;
    himekkoDescription?: string | null;
    arAssetUrl?: string | null;
  };
  onStart: () => void;
  /** 床認識が現在オンかどうか */
  floorRecognitionEnabled: boolean;
  /** トグル操作時に反転後の値で呼ばれる */
  onToggleFloorRecognition: (enabled: boolean) => void;
  /**
   * ページフッター。AppFooter はサーバー専用の env（CONTACT_EMAIL）を読むため、
   * クライアントコンポーネントである本コンポーネントから import するとバンドルに
   * 取り込まれてハイドレーション時に例外になる。サーバー側（page.tsx）で描画した
   * ReactNode を受け取る。
   */
  footer: React.ReactNode;
}

export default function ArLanding({
  spot,
  onStart,
  floorRecognitionEnabled,
  onToggleFloorRecognition,
  footer,
}: ArLandingProps) {
  return (
    <div className="min-h-[100dvh] bg-arcana-bg">
      {/* ヘッダー */}
      <AppHeader maxWidth="max-w-lg" />

      {/* メインコンテンツ */}
      <main className="mx-auto max-w-lg px-4 pb-12 pt-6">
        {/* 戻るリンク */}
        <nav aria-label="パンくず">
          <Link
            href="/spots"
            className="inline-flex min-h-[48px] items-center gap-1 no-underline leading-[1.5] text-secondary-500"
          >
            <Icon name="chevron-left" width={20} height={20} />
            スポット一覧に戻る
          </Link>
        </nav>

        {/* タイトルセクション */}
        <div className="mt-6 text-center">
          <p className="text-base font-bold leading-[1.5] text-[var(--color-arcana-orange)]">
            <span className="text-[18px] font-bold">＼</span> スポット限定{" "}
            <span className="text-[18px] font-bold">／</span>
          </p>
          <SectionHeading
            as="h1"
            containerClassName="mt-1"
            className="text-[32px] font-bold leading-[1.3] text-arcana-green"
          >
            ひめっこと撮影
          </SectionHeading>
        </div>

        {/* カード（スポット詳細ページと同じバッジ配置パターン） */}
        <div className="relative mt-8">
          {/* スポット設置バッジ — カード上端から突き出すタブ */}
          <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2">
            <span className="inline-flex items-center gap-2 rounded-b-lg bg-spot px-4 py-3 text-[15px] font-bold leading-none text-white">
              <Icon name="location-on-outline" width={15} height={15} />
              スポット設置
            </span>
          </div>

          <div className="overflow-hidden rounded-3xl border-3 border-arcana-limegreen bg-white">
            <div className="px-5 pb-7 pt-12">
              {/* スポット名 */}
              <p className="text-center text-2xl font-bold leading-[1.5] text-arcana-green">
                {spot.name}
              </p>

              {/* ひめっこキャラクター（GLBプレビュー） */}
              <div className="mt-4 h-[260px] overflow-hidden rounded-2xl bg-[var(--color-camera-bg)]">
                {spot.arAssetUrl ? (
                  <ModelViewer
                    src={spot.arAssetUrl}
                    alt={`${spot.name}のひめっこキャラクター`}
                    cameraOrbit="0deg 75deg 105%"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm leading-[1.5] text-neutral-400">
                    キャラクター準備中
                  </div>
                )}
              </div>

              {/* ひめっこ説明文（設定時のみ表示） */}
              {spot.himekkoDescription && (
                <p className="mt-5 leading-[1.8] text-[var(--color-arcana-body-blue)]">
                  {normalizeJapanese(spot.himekkoDescription)}
                </p>
              )}

              {/* 床認識トグル */}
              <div className="mt-6">
                <FloorRecognitionToggle
                  enabled={floorRecognitionEnabled}
                  onChange={onToggleFloorRecognition}
                />
              </div>

              {/* ARで撮影するボタン */}
              <button
                type="button"
                onClick={onStart}
                className={buttonClassName(
                  "standard",
                  "mt-7 min-h-[56px] w-full cursor-pointer gap-3 leading-none shadow-[var(--shadow-md)]",
                )}
                aria-label="ARで撮影する"
              >
                <Icon name="photo-camera-outline" width={22} height={22} />
                AR で撮影する
              </button>

              {/* カメラ許可の注意書き */}
              <p className="mt-3 text-sm leading-[1.5] text-neutral-500">
                ※ AR 表示にはカメラへのアクセス許可が必要です
              </p>
            </div>
          </div>
        </div>

        {/* 撮影詳細リンク */}
        <div className="mt-8 text-center">
          <Link
            href="/camera"
            className="inline-flex min-h-[48px] items-center gap-1 no-underline leading-[1.5] text-arcana-green"
          >
            撮影についての詳細はこちら
            <Icon name="chevron-right" width={18} height={18} />
          </Link>
        </div>
      </main>

      <CharacterContainer
        leftSrc="/assets/character/siro-maneki.png"
        rightSrc="/assets/character/kuro-maneki.png"
      />
      {footer}
    </div>
  );
}
