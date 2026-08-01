"use client";

import type { ModelConfig } from "@/lib/ar/types";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import ArLanding from "./ArLanding";

// 自宅撮影と同一のネイティブ AR コンポーネントを再利用する。
const HiddenArViewer = dynamic(
  () => import("@/app/camera/_components/HiddenArViewer"),
  { ssr: false },
);
const ArModal = dynamic(() => import("@/app/camera/_components/ArModal"), {
  ssr: false,
});
const HomeArFallbackExperience = dynamic(
  () => import("@/app/camera/_components/HomeArFallbackExperience"),
  { ssr: false },
);

export interface SpotArExperienceProps {
  spot: {
    slug: string;
    name: string;
    description: string;
    himekkoDescription: string | null;
    arAssetUrl: string | null;
  };
  model: ModelConfig;
  /** ランディング画面のフッター。ArLanding にそのまま渡す（ArLandingProps.footer 参照） */
  footer: React.ReactNode;
}

export default function SpotArExperience({
  spot,
  model,
  footer,
}: SpotArExperienceProps) {
  const arElRef = useRef<HTMLElement | null>(null);
  const [showArModal, setShowArModal] = useState(false);
  // 代替AR撮影体験(HomeArFallbackExperience)への切替表示ステート(4.2)。
  // showArModalとは独立しており、この状態のみが「landing」の通常画面と
  // 「fallback」の代替体験のどちらを表示するかを切り替える。
  const [view, setView] = useState<"landing" | "fallback">("landing");
  // 床認識トグルの状態(初期値オン)。オフのときはhandleStartがネイティブAR/ArModal分岐に
  // 進まず、代替AR撮影体験(fallback)に切り替える(design.md参照)。
  const [floorRecognitionEnabled, setFloorRecognitionEnabled] = useState(true);

  const handleArReady = useCallback((el: HTMLElement) => {
    arElRef.current = el;
  }, []);

  // AR 起動可否は model-viewer の canActivateAR に委譲する。
  // 対応端末では OS 標準 AR ビューア（Scene Viewer / Quick Look）を起動し、
  // 非対応端末では 3D ビューア（ArModal）にフォールバックする。
  // 床認識トグルがオフの場合は、この分岐に進む前に代替AR撮影体験へ切り替える(4.2)。
  const handleStart = useCallback(() => {
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

  // 床認識オフで代替AR撮影体験に画面を切り替える(4.2)。ネイティブAR/ArModalの起動経路を
  // 含む通常のlanding画面は表示しない。model はpage.tsxから渡された同じ安定した参照を
  // そのまま渡す(HomeArFallbackScene の useEffect 依存配列に含まれるため、新しいオブジェクトを
  // 生成すると不要なカメラ再取得・シーン再構築が発生する)。
  if (view === "fallback") {
    return (
      <HomeArFallbackExperience
        model={model}
        onBack={() => setView("landing")}
      />
    );
  }

  return (
    <>
      <HiddenArViewer
        src={model.url}
        scale={model.scale ?? 1}
        onReady={handleArReady}
      />

      <ArLanding
        spot={{
          name: spot.name,
          himekkoDescription: spot.himekkoDescription,
          arAssetUrl: spot.arAssetUrl,
        }}
        onStart={handleStart}
        floorRecognitionEnabled={floorRecognitionEnabled}
        onToggleFloorRecognition={setFloorRecognitionEnabled}
        footer={footer}
      />

      {showArModal && (
        <ArModal
          src={model.url}
          alt={model.label ?? spot.name}
          onClose={() => setShowArModal(false)}
        />
      )}
    </>
  );
}
