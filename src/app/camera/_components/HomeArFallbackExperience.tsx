"use client";

import { Icon } from "@/app/_components/Icon";
import type {
  CaptureResult,
  HomeArFallbackState,
  ModelConfig,
} from "@/lib/ar/types";
import { useCallback, useEffect, useRef, useState } from "react";
import CapturedPhotoPreview from "./CapturedPhotoPreview";
import HomeArFallbackScene from "./HomeArFallbackScene";
import OperationGuide from "./OperationGuide";

export interface HomeArFallbackExperienceProps {
  /** 表示するヒメッコの GLB モデル設定。呼び出し元(最終的に page.tsx)が保持する
   * 安定した参照をそのまま渡すこと。ここで新しいオブジェクトを生成しない
   * (HomeArFallbackScene の useEffect 依存配列に含まれるため、参照が変わる
   * たびにカメラ再取得・Three.js シーン再構築が発生してしまう)。 */
  model: ModelConfig;
  /** 戻る操作で親(HomeArExperience)の表示をホーム画面に戻すためのコールバック(2.5)。 */
  onBack: () => void;
}

/**
 * 代替AR撮影体験のラッパー。
 *
 * `HomeArFallbackState`(2.1)に基づき、操作方法ガイド(7.1)・`HomeArFallbackScene`
 * (カメラ映像+ヒメッコ固定表示+撮影)・カメラ拒否ガイド(2.2)・初期化失敗時のエラー+リトライ(2.6)を
 * 状態に応じて切り替える。`guide`フェーズの間は`HomeArFallbackScene`をマウントしないため、
 * カメラアクセス要求はガイドを閉じた後まで発生しない(7.4)。
 *
 * 撮影完了後は`CapturedPhotoPreview`(保存/シェア/撮り直しの導線)を表示する(3.2)。
 * 撮り直し時は操作方法ガイドを再表示してから`HomeArFallbackScene`に戻る(7.5)。
 * また、代替体験がアクティブな間は常に戻る手段を提供する(2.5)。通常時・操作方法ガイド表示中・
 * カメラ拒否ガイド表示中はフローティングの戻るボタンを、エラー画面では「再試行」と並べた
 * 専用の「戻る」ボタンを表示する。
 */
export default function HomeArFallbackExperience({
  model,
  onBack,
}: HomeArFallbackExperienceProps) {
  // 初期状態は`guide`(7.1): カメラアクセスを要求する前に操作方法ガイドを表示する。
  const [state, setState] = useState<HomeArFallbackState>({ phase: "guide" });
  // リトライ時に HomeArFallbackScene を確実に再マウントするためのキー。
  // 値を変えることで React に古いインスタンスを破棄・新規インスタンスを生成させ、
  // 内部の useEffect(カメラ取得・Three.js セットアップ)を最初からやり直させる。
  const [sceneKey, setSceneKey] = useState(0);
  // 撮影結果(3.2)。`null` の間は `HomeArFallbackScene` を表示し、値が入ったら
  // `CapturedPhotoPreview` に切り替える。`HomeArFallbackState`(idle/camera-requesting/...)
  // とは独立した状態として扱う(design.md の State Management 節に倣う: 撮影自体の
  // フェーズ管理は `HomeArFallbackScene` 内部の ref/state に閉じており、この
  // コンポーネントの `state` は camera-denied / error の分岐にのみ使われている)。
  const [captureResult, setCaptureResult] = useState<CaptureResult | null>(
    null,
  );

  // スクロール領域(オーバーレイ本体)への参照。ボディスクロールロックの補強として、
  // スクロールが端に達した状態でのドラッグをタッチイベントレベルで止めるために使う。
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // この代替体験は`position: fixed`のフルスクリーンオーバーレイだが、`/camera`ページ自体
  // (ヘッダー・キャラクターイラスト・フッターを含む)はマウント中もDOM上に存在し続けている。
  // `overflow: hidden`をbody/htmlに設定するだけでは、iOS Safari特有のゴム弾性スクロール
  // (バウンス)が、オーバーレイ内部のスクロールが端に達した後のドラッグを裏のページの
  // バウンスとして扱ってしまい、ヘッダー・フッターが見えてしまう場合がある。
  // そのため、(1) body/htmlのスクロール自体を止め、(2) オーバーレイ内部のスクロールが
  // 端(先頭/末尾)に達した状態でさらに同方向にドラッグされた場合はタッチイベントを
  // 明示的にキャンセルし、裏のページへのバウンス伝播そのものを止める。
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // ジェスチャー開始位置ではなく直前フレームの位置を保持する。開始位置固定だと、
    // 境界でブロックした後に指の向きを反転しても、開始位置を再び通過するまで
    // ブロックが続いてしまう(累積移動量ではなく、瞬間ごとの方向で判定するため)。
    let lastTouchY = 0;

    const handleTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const scrollEl = scrollContainerRef.current;
      const touchY = event.touches[0]?.clientY;
      if (!scrollEl || touchY === undefined) {
        event.preventDefault();
        return;
      }
      const deltaY = touchY - lastTouchY;
      lastTouchY = touchY;
      const atTop = scrollEl.scrollTop <= 0;
      const atBottom =
        scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight;
      // 先頭で下方向、または末尾で上方向へのドラッグは、これ以上オーバーレイ内で
      // 消費できるスクロール量が無いため、裏のページへ伝播する前にキャンセルする。
      if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
        event.preventDefault();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  const handleCameraDenied = useCallback(() => {
    setState({ phase: "camera-denied" });
  }, []);

  const handleError = useCallback((message: string) => {
    setState({ phase: "error", message });
  }, []);

  const handleCapture = useCallback((result: CaptureResult) => {
    setCaptureResult(result);
  }, []);

  const handleRetry = useCallback(() => {
    setSceneKey((key) => key + 1);
    setState({ phase: "idle" });
  }, []);

  // 撮り直し(3.5, 7.5): プレビューを閉じ、`HomeArFallbackScene` を確実に再マウントして
  // カメラ映像・Three.js シーンを最初からやり直させる。操作方法ガイドも再度表示する。
  const handleRetake = useCallback(() => {
    setCaptureResult(null);
    setSceneKey((key) => key + 1);
    setState({ phase: "guide" });
  }, []);

  // ガイドを閉じてカメラアクセス要求(HomeArFallbackSceneのマウント)へ進む(7.3, 7.4)。
  const handleDismissGuide = useCallback(() => {
    setState({ phase: "idle" });
  }, []);

  const showGuide = state.phase === "guide";
  const showCameraDeniedGuide = state.phase === "camera-denied";
  const showErrorRetry = state.phase === "error";
  const showPreview = captureResult !== null;
  // 操作方法ガイド・カメラ拒否ガイド・エラー画面は自身の全画面オーバーレイと導線を持つため、
  // その間はシーン(=カメラアクセス要求)を表示しない。撮影後はプレビューに切り替える。
  const showScene =
    !showGuide && !showCameraDeniedGuide && !showErrorRetry && !showPreview;
  // 戻るボタン(2.5): 代替体験がアクティブな間は常に戻る手段を提供する
  // (`SpotArExperience.tsx`と同じ方針)。カメラ拒否ガイドには戻る手段が無いため
  // フローティングの戻るボタンを表示する。エラー画面のみ、カード内に「再試行」と
  // 並べて専用の「戻る」ボタンを用意するため、二重表示を避けてフローティングボタンは
  // 隠す(`SpotArExperience.tsx`の`showErrorRetry`時の扱いと同一)。
  const showBackButton = !showErrorRetry;

  return (
    <div
      ref={scrollContainerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        width: "100%",
        height: "100dvh",
        overflowY: "auto",
        overflowX: "hidden",
        overscrollBehavior: "contain",
        backgroundColor: "var(--color-neutral-900)",
      }}
      aria-label="代替AR撮影画面"
    >
      {showGuide && <OperationGuide onDismiss={handleDismissGuide} />}

      {showScene && (
        <HomeArFallbackScene
          key={sceneKey}
          model={model}
          onCapture={handleCapture}
          onCameraDenied={handleCameraDenied}
          onError={handleError}
        />
      )}

      {showPreview && captureResult && (
        <CapturedPhotoPreview
          captureResult={captureResult}
          onRetake={handleRetake}
        />
      )}

      {showCameraDeniedGuide && (
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
              textAlign: "center",
            }}
          >
            <Icon
              name="no-photography-outline"
              width={48}
              height={48}
              style={{ color: "var(--color-error)", margin: "0 auto 16px" }}
            />
            <h2
              className="font-bold"
              style={{
                fontSize: 20,
                color: "var(--color-neutral-800)",
                margin: "0 0 12px 0",
                lineHeight: 1.5,
              }}
            >
              カメラの許可が必要です
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "var(--color-neutral-600)",
                lineHeight: 1.5,
                margin: "0 0 8px 0",
              }}
            >
              AR 撮影にはカメラへのアクセスが必要です。
            </p>
            <p
              style={{
                fontSize: 16,
                color: "var(--color-neutral-500)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              ブラウザのアドレスバー付近にあるカメラアイコンをタップし、許可を有効にしてからページを再読み込みしてください。
            </p>
          </div>
        </div>
      )}

      {showErrorRetry && (
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
              textAlign: "center",
            }}
          >
            <Icon
              name="no-photography-outline"
              width={48}
              height={48}
              style={{ color: "var(--color-error)", margin: "0 auto 16px" }}
            />
            <h2
              className="font-bold"
              style={{
                fontSize: 20,
                color: "var(--color-neutral-800)",
                margin: "0 0 12px 0",
                lineHeight: 1.5,
              }}
            >
              うまく起動できませんでした
            </h2>
            <p
              style={{
                fontSize: 16,
                color: "var(--color-neutral-600)",
                lineHeight: 1.5,
                margin: "0 0 24px 0",
              }}
            >
              {state.phase === "error"
                ? state.message
                : "カメラまたは表示の準備に失敗しました。"}
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                type="button"
                onClick={handleRetry}
                aria-label="もう一度試す"
                className="font-bold"
                style={{
                  minWidth: 48,
                  minHeight: 48,
                  padding: "14px 28px",
                  fontSize: 16,
                  color: "var(--color-neutral-0)",
                  backgroundColor: "var(--color-primary-600)",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  lineHeight: 1.5,
                }}
              >
                再試行
              </button>
              <button
                type="button"
                onClick={onBack}
                aria-label="戻る"
                className="font-bold"
                style={{
                  minWidth: 48,
                  minHeight: 48,
                  padding: "14px 28px",
                  fontSize: 16,
                  color: "var(--color-neutral-600)",
                  backgroundColor: "transparent",
                  border: "2px solid var(--color-neutral-300)",
                  borderRadius: 10,
                  cursor: "pointer",
                  lineHeight: 1.5,
                }}
              >
                戻る
              </button>
            </div>
          </div>
        </div>
      )}

      {showBackButton && (
        <button
          type="button"
          onClick={onBack}
          aria-label="戻る"
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 20,
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: "rgba(30, 28, 25, 0.6)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-neutral-0)",
          }}
        >
          <Icon name="chevron-left" width={24} height={24} />
        </button>
      )}
    </div>
  );
}
