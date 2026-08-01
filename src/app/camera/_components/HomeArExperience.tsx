"use client";

import CharacterContainer from "@/app/_components/CharacterContainer";
import { Icon } from "@/app/_components/Icon";
import SectionHeading from "@/app/_components/SectionHeading";
import { StepList } from "@/app/_components/StepList";
import { buttonClassName } from "@/app/_components/button-variants";
import type { ModelConfig } from "@/lib/ar/types";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import FloorRecognitionToggle from "./FloorRecognitionToggle";

const ModelViewer = dynamic(() => import("./ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-arcana-bg text-base text-neutral-500 leading-[1.5]">
      読み込み中…
    </div>
  ),
});

const HiddenArViewer = dynamic(() => import("./HiddenArViewer"), {
  ssr: false,
});
const ArModal = dynamic(() => import("./ArModal"), { ssr: false });
const HomeArFallbackExperience = dynamic(
  () => import("./HomeArFallbackExperience"),
  { ssr: false },
);

export interface HomeArExperienceProps {
  model: ModelConfig;
}

const STEPS = [
  "スポットのQRコードをスキャンする\n（スポット限定の場合）",
  "「ARで撮影する」ボタンをタップし、カメラのアクセスを許可する",
  "「ARで表示」をタップするとカメラが起動",
  "撮影場所を決めてスマホを動かすとひめっこが出現！",
  "写真を撮って保存したり、SNSでシェア！",
];

const SPOT_BTN = buttonClassName(
  "standard",
  "min-h-[52px] gap-2 px-6 py-3.5 leading-[1.5] shadow-[var(--shadow-md)]",
);

export default function HomeArExperience({ model }: HomeArExperienceProps) {
  const arElRef = useRef<HTMLElement | null>(null);
  const [showArModal, setShowArModal] = useState(false);
  // 申告リンクタップで代替AR撮影体験に切り替えるための表示ステート(4.2)。
  // Scene Viewer/Quick Lookの起動導線(handleArClick)とは独立しており、
  // この状態のみが「home」の通常コンテンツと「fallback」の代替体験の
  // どちらを表示するかを切り替える。
  const [view, setView] = useState<"home" | "fallback">("home");
  // 床認識トグルの状態(初期値オン)。オフのときはhandleArClickがネイティブAR/ArModal分岐に
  // 進まず、事後申告リンクと同じ代替AR撮影体験(fallback)に切り替える(design.md参照)。
  const [floorRecognitionEnabled, setFloorRecognitionEnabled] = useState(true);

  const handleArReady = useCallback((el: HTMLElement) => {
    arElRef.current = el;
  }, []);

  const handleArClick = useCallback(() => {
    if (!floorRecognitionEnabled) {
      setView("fallback");
      return;
    }
    const el = arElRef.current as
      | (HTMLElement & {
          canActivateAR?: boolean;
          activateAR?: () => void;
        })
      | null;
    if (el?.canActivateAR && el.activateAR) {
      el.activateAR();
    } else {
      setShowArModal(true);
    }
  }, [floorRecognitionEnabled]);

  // 申告リンクタップ後は代替AR撮影体験(HomeArFallbackExperience)に画面を切り替える(4.2)。
  // Scene Viewer/Quick Lookの起動導線(HiddenArViewer/handleArClick/ArModal)を含む
  // 通常のホーム画面コンテンツは表示しない。model は page.tsx から渡された同じ安定した
  // 参照をそのまま渡す(HomeArFallbackScene の useEffect 依存配列に含まれるため、
  // 新しいオブジェクトを生成すると不要なカメラ再取得・シーン再構築が発生する)。
  if (view === "fallback") {
    return (
      <HomeArFallbackExperience model={model} onBack={() => setView("home")} />
    );
  }

  return (
    <>
      <HiddenArViewer
        src={model.url}
        scale={model.scale ?? 1}
        onReady={handleArReady}
      />

      {/* 戻るナビゲーション */}
      <nav className="px-4 mt-7 mb-16" aria-label="前のページへ戻る">
        <Link
          href="/activities"
          className="inline-flex items-center gap-1 text-base no-underline text-secondary-500 leading-[1.5]"
        >
          <Icon name="chevron-left" width={20} height={20} />
          交流を探す
        </Link>
      </nav>

      <div className="px-4 pb-16">
        {/* ─── ヒーローセクション ─── */}
        <section aria-labelledby="hero-heading" className="pb-16">
          <SectionHeading
            as="h1"
            id="hero-heading"
            className="text-3xl font-bold text-secondary-500"
          >
            ひめっこと撮影
          </SectionHeading>

          <div className="mt-8 flex justify-center">
            <Image
              src="/assets/photo-take-illust.png"
              alt="ひめっこと仲間たちのキャラクターイラスト"
              width={360}
              height={240}
              className="w-full max-w-xs object-contain"
              priority
            />
          </div>

          <p className="mt-8 text-base leading-[1.6] text-neutral-700 text-pretty">
            スポットに設置されたQRコードを読み込むと新庄村のイメージキャラクター「ひめっこ」とAR記念撮影ができます
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link href="/spots" className={SPOT_BTN}>
              <Icon name="location-on-outline" width={20} height={20} />
              スポット一覧を見る
            </Link>

            <a
              href="#camera-section"
              className={buttonClassName(
                "outline",
                "min-h-[52px] gap-2 px-6 py-3.5 leading-[1.5]",
              )}
            >
              今すぐひめっこと撮影する
            </a>
          </div>
        </section>

        {/* ─── カード1: スポットで撮影する ─── */}
        <section
          aria-labelledby="spot-card-heading"
          className="mb-8 rounded-2xl border-3 border-secondary-300 bg-white px-5 py-6 shadow-yellow"
        >
          <p className="mb-2 text-center text-sm font-bold leading-[1.5] text-arcana-orange-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/orange-slash.svg"
              alt=""
              aria-hidden="true"
              width="14"
              height="15"
              className="inline-block align-middle"
            />
            <span className="mx-4">レアひめっこが出現</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/orange-slash.svg"
              alt=""
              aria-hidden="true"
              width="14"
              height="15"
              className="inline-block align-middle"
              style={{ transform: "scaleX(-1)" }}
            />
          </p>
          <h2
            id="spot-card-heading"
            className="mb-5
						 text-center text-2xl font-bold text-arcana-green text-balance"
          >
            スポットで撮影する
          </h2>

          <div
            className="mb-5
					 flex justify-center"
          >
            <Image
              src="/assets/photo-spot.png"
              alt="スポットでの掲載イメージ"
              width={320}
              height={280}
              className="w-full max-w-xs object-contain"
            />
          </div>

          <p className="mb-5 text-base leading-[1.6] text-body-blue">
            新庄村のスポットに設置されたQRコードを読み込むと特別な限定のひめっこが現れ、一緒に撮影できます！
          </p>

          <div className="flex justify-center">
            <Link href="/spots" className={SPOT_BTN}>
              <Icon name="location-on-outline" width={20} height={20} />
              スポット一覧を見る
            </Link>
          </div>
        </section>

        {/* ─── カード2: いますぐ撮影する ─── */}
        <section
          id="camera-section"
          aria-labelledby="home-card-heading"
          className="mb-16 rounded-2xl border-3 border-secondary-300 bg-white px-5 py-6 shadow-yellow"
        >
          <p className="mb-2 text-center text-sm font-bold leading-[1.5] text-arcana-orange-secondary">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/orange-slash.svg"
              alt=""
              aria-hidden="true"
              width="14"
              height="15"
              className="inline-block align-middle"
            />
            <span className="mx-4">まずはお試し</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/orange-slash.svg"
              alt=""
              aria-hidden="true"
              width="14"
              height="15"
              className="inline-block align-middle"
              style={{ transform: "scaleX(-1)" }}
            />
          </p>
          <h2
            id="home-card-heading"
            className="mb-4 text-center text-2xl font-bold text-arcana-green text-balance"
          >
            いますぐ撮影する
          </h2>

          <div className="mb-5 aspect-[4/3] overflow-hidden rounded-xl">
            <ModelViewer
              src={model.url}
              alt={
                model.label ? `${model.label}の3Dモデル` : "ひめっこの3Dモデル"
              }
            />
          </div>

          <p className="mb-5 text-base leading-[1.6] text-body-blue">
            いつでもどこでも通常のひめっこと撮影ができます
          </p>

          <div className="mb-7">
            <FloorRecognitionToggle
              enabled={floorRecognitionEnabled}
              onChange={setFloorRecognitionEnabled}
            />
          </div>

          <button
            type="button"
            onClick={handleArClick}
            className={buttonClassName(
              "standard",
              "min-h-[52px] w-full cursor-pointer gap-2 px-6 py-3.5 leading-[1.5] shadow-[var(--shadow-md)]",
            )}
          >
            <Icon name="photo-camera-outline" width={20} height={20} />
            AR で撮影する
          </button>

          <p className="mt-3 text-center text-sm leading-[1.5] text-neutral-500">
            ※ AR 表示にはカメラへのアクセス許可が必要です
          </p>

          {/* 常時表示の申告リンク: Scene Viewer起動結果を検知するイベントには依存せず、
              Android/iOS・canActivateARの値に関わらず一律で表示する（設計レビューで確定）。
              タップすると代替AR撮影体験(HomeArFallbackExperience)に切り替える(4.2)。 */}
          <button
            type="button"
            onClick={() => setView("fallback")}
            aria-label="うまく表示されなかった場合はこちらから別の撮影方法に切り替えられます"
            className="mt-2 flex min-h-[48px] w-full cursor-pointer items-center justify-center px-3 py-3 text-base leading-[1.5] text-neutral-500 underline decoration-neutral-500 underline-offset-2 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary-500"
          >
            うまく表示されなかった方はこちら
          </button>
          <p className="mt-3 text-center text-sm leading-[1.5] text-neutral-500">
            ※ 端末によっては正しく表示されない場合があります。ご了承ください。
          </p>
        </section>

        {/* ─── 使い方セクション ─── */}
        <section aria-labelledby="howto-heading">
          <h2
            id="howto-heading"
            className="mb-6 text-center text-2xl font-bold text-arcana-green text-balance"
          >
            使い方
          </h2>
          <StepList steps={STEPS} ariaLabel="ひめっこと撮影する手順" />
        </section>
      </div>

      {showArModal && (
        <ArModal
          src={model.url}
          alt={model.label ?? "ひめっこ"}
          onClose={() => setShowArModal(false)}
        />
      )}
    </>
  );
}
