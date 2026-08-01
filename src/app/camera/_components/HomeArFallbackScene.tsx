"use client";

import { Icon } from "@/app/_components/Icon";
import { compositeCapture } from "@/lib/ar/capture";
import type { CaptureResult, ModelConfig } from "@/lib/ar/types";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Group, PerspectiveCamera, Scene, WebGLRenderer } from "three";

export interface HomeArFallbackSceneProps {
  /** 表示するヒメッコの GLB モデル設定 */
  model: ModelConfig;
  /** 撮影ボタン押下時に、合成済みの撮影結果とともに呼ばれる */
  onCapture: (result: CaptureResult) => void;
  /** カメラ許可拒否・カメラ未検出など、getUserMedia が reject した場合に呼ばれる */
  onCameraDenied: () => void;
  /** getUserMedia 以外の初期化失敗（video 要素の準備・再生失敗など）で呼ばれる */
  onError: (message: string) => void;
}

// 回転ボタン1タップあたりの回転量(30度)
const ROTATE_STEP = Math.PI / 6;
// ドラッグでの可動範囲: モデル中心が可視半幅・半高のこの割合以内に収まるようクランプする
// (暫定デフォルト。design.md参照。実装時の視覚確認で微調整可)
const DRAG_CLAMP_RATIO = 0.6;
// ピンチでの拡大縮小範囲: 基準スケール(モデル設定値)のこの倍率の範囲内にクランプする
// (暫定デフォルト。design.md参照。実装時の視覚確認で微調整可)
const SCALE_MIN_RATIO = 0.5;
const SCALE_MAX_RATIO = 2.5;
// ピンチ開始距離の下限(px)。2本指がほぼ同一座標で検出された場合の
// ゼロ除算(NaN/Infinityスケール)を防ぐためのフォールバック。
const MIN_PINCH_DISTANCE = 1;

/**
 * 代替AR撮影体験のシーン。
 *
 * - カメラ映像の取得と `<video>` への表示、許可拒否/初期化失敗の親への伝播(2.1)
 * - ヒメッコのThree.jsによるスクリーン空間固定表示レンダリング(2.2)
 * - 撮影ボタンの表示と`compositeCapture`統合、アンマウント時のリソース解放(2.3)
 * - ドラッグによる位置操作・回転ボタンによる向き操作(5.1-5.6)。自動回転は行わず、
 *   ユーザー操作時のみ再描画するon-demand方式(5.2)
 * - 2本指ピンチによる拡大縮小(6.1-6.6)。ピンチ中は1本指ドラッグを併発させない(6.5)
 */
export default function HomeArFallbackScene({
  model,
  onCapture,
  onCameraDenied,
  onError,
}: HomeArFallbackSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // カメラ映像とヒメッコモデルの両方の準備が整うまで撮影ボタンを無効化するための
  // 最小限のReactステート(2.3)。ref のみでは disabled 状態を再レンダリングに
  // 反映できないため、UIに反映する必要があるこの1点のみ useState を導入する。
  const [cameraReady, setCameraReady] = useState(false);
  const [modelReady, setModelReady] = useState(false);

  // Three.js のシーン/カメラ/モデル/レンダラーへの参照。ドラッグ・回転ボタンの
  // ハンドラ(useEffect の外)から直接操作できるよう、ローカル変数ではなくrefで保持する。
  const sceneRef = useRef<Scene | null>(null);
  const perspectiveCameraRef = useRef<PerspectiveCamera | null>(null);
  const modelGroupRef = useRef<Group | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  // ドラッグ中の状態(開始時のポインター座標とモデル位置)。ドラッグ中でない間は null。
  const dragStateRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startModelX: number;
    startModelY: number;
  } | null>(null);
  // 現在押下中のポインター(pointerId -> スクリーン座標)。ピンチ検出に使う。
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(
    new Map(),
  );
  // ピンチ中の状態(開始時の2点間距離と開始時のモデルスケール)。ピンチ中でない間は null。
  const pinchStateRef = useRef<{
    startDistance: number;
    startScale: number;
  } | null>(null);
  // モデルロード時の基準スケール(model.scale ?? 1)。ピンチのクランプ範囲の基準になる。
  const baseScaleRef = useRef(1);

  // on-demandレンダリング(5.2): 継続的なアニメーションループではなく、
  // ユーザー操作(ドラッグ・回転ボタン)やリサイズの都度この関数を呼んで再描画する。
  const render = useCallback(() => {
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = perspectiveCameraRef.current;
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
  }, []);

  // カメラ映像の取得（2.1）とヒメッコのThree.jsレンダリング（2.2）の
  // セットアップ（マウント時に一度だけ実行）。
  // 撮影ボタンの統合とリソース解放の総仕上げは後続タスク(2.3)で追加される。
  //
  // カメラ取得(startCamera)とモデル読み込み(loadScene)は、互いを await せず
  // 並行に開始する。カメラ許可ダイアログの応答待ちでモデル読み込みがブロック
  // されないようにするため（逆方向も同様）。
  useEffect(() => {
    let cancelled = false;
    let renderer: WebGLRenderer | null = null;
    let handleResize: (() => void) | null = null;

    // 依存配列の値が変わって再実行される場合に備え、前回の準備完了状態を
    // 引き継がないようリセットする（撮影ボタンは常にセットアップ完了後のみ有効化する）。
    setCameraReady(false);
    setModelReady(false);

    // ── カメラ映像の取得とセットアップ（タスク2.1） ──
    async function startCamera() {
      // ── Phase 1: カメラ映像取得（ここで許可ダイアログが表示される） ──
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
      } catch {
        // 許可拒否・カメラ未検出などは同一に「カメラ拒否」として親に伝播する
        if (!cancelled) onCameraDenied();
        return;
      }

      if (cancelled) {
        for (const track of stream.getTracks()) track.stop();
        return;
      }

      // ── Phase 2: <video> にストリームを流す ──
      try {
        const video = videoRef.current;
        if (!video) {
          throw new Error("カメラ映像の表示要素が見つかりません");
        }

        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();

        if (!cancelled) setCameraReady(true);
      } catch (err) {
        if (!cancelled) {
          for (const track of stream.getTracks()) track.stop();
          streamRef.current = null;
          onError(
            err instanceof Error ? err.message : "カメラの初期化に失敗しました",
          );
        }
      }
    }

    // ── ヒメッコのスクリーン空間固定表示レンダリング（タスク2.2） ──
    async function loadScene() {
      try {
        const THREE = await import("three");
        const { GLTFLoader } = await import(
          "three/addons/loaders/GLTFLoader.js"
        );

        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error("モデル表示用の描画領域が見つかりません");
        }

        const newRenderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
        });
        newRenderer.setPixelRatio(window.devicePixelRatio);
        renderer = newRenderer;
        rendererRef.current = newRenderer;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // ライトを追加（PBR マテリアルはライト無しだと真っ黒になる。ArScene.tsx と同一設定）
        const ambient = new THREE.AmbientLight(0xffffff, 1.2);
        scene.add(ambient);
        const directional = new THREE.DirectionalLight(0xffffff, 1.5);
        directional.position.set(0.5, 1, 1);
        scene.add(directional);

        // 起動時に一度だけ固定視点を設定する（スクリーン空間固定表示）。
        // device orientation・平面検出とは一切連動させない。
        const camera = new THREE.PerspectiveCamera(
          50,
          canvas.clientWidth / Math.max(canvas.clientHeight, 1),
          0.1,
          100,
        );
        camera.position.set(0, 0, 3);
        camera.lookAt(0, 0, 0);
        perspectiveCameraRef.current = camera;

        const resize = () => {
          const width = canvas.clientWidth;
          const height = canvas.clientHeight;
          if (width === 0 || height === 0) return;
          newRenderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          render();
        };
        resize();
        window.addEventListener("resize", resize);
        handleResize = resize;

        // ── GLTF モデルをロード（ArScene.tsx の loadModel と同様の手法） ──
        const loader = new GLTFLoader();
        const modelGroup = await new Promise<Group>((resolve, reject) => {
          loader.load(
            model.url,
            (gltf) => resolve(gltf.scene),
            undefined,
            reject,
          );
        });

        if (cancelled) return;

        const s = model.scale ?? 1;
        modelGroup.scale.set(s, s, s);
        baseScaleRef.current = s;
        if (model.rotation) {
          modelGroup.rotation.set(
            model.rotation.x ?? 0,
            model.rotation.y ?? 0,
            model.rotation.z ?? 0,
          );
        }
        modelGroup.position.set(0, 0, 0);
        scene.add(modelGroup);
        modelGroupRef.current = modelGroup;

        // 自動回転は行わず、初期姿勢のまま静止させる。以後はユーザー操作
        // (ドラッグ・回転ボタン)によってのみ位置・向きが変化し、その都度
        // render() が呼ばれてon-demandで再描画される(5.1, 5.2)。
        render();

        if (!cancelled) setModelReady(true);
      } catch (err) {
        if (!cancelled) {
          onError(
            err instanceof Error
              ? err.message
              : "ヒメッコモデルの読み込みに失敗しました",
          );
        }
      }
    }

    startCamera();
    loadScene();

    return () => {
      cancelled = true;

      // カメラ映像のクリーンアップ（タスク2.1）
      const stream = streamRef.current;
      if (stream) {
        for (const track of stream.getTracks()) track.stop();
      }
      streamRef.current = null;
      const video = videoRef.current;
      if (video) {
        video.srcObject = null;
      }

      // Three.js リソースのクリーンアップ（タスク2.2）。on-demandレンダリングに
      // 変更したためsetAnimationLoopは使用しておらず、disposeのみで解放できる。
      if (handleResize) {
        window.removeEventListener("resize", handleResize);
      }
      if (renderer) {
        renderer.dispose();
      }
      sceneRef.current = null;
      perspectiveCameraRef.current = null;
      modelGroupRef.current = null;
      rendererRef.current = null;
      dragStateRef.current = null;
      activePointersRef.current.clear();
      pinchStateRef.current = null;
    };
  }, [model, onCameraDenied, onError, render]);

  // カメラ映像とヒメッコモデルの両方が準備できている場合のみ撮影可能（2.3）。
  const isReady = cameraReady && modelReady;

  // ── ドラッグによるヒメッコの移動（5.3, 5.4） / 2本指ピンチによる拡大縮小（6.1-6.5） ──
  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const modelGroup = modelGroupRef.current;
      if (!modelGroup) return;

      // 3本目以降のポインターは無視する(design.md参照)。既にピンチ中の2点は
      // そのまま追跡を続ける。
      if (
        activePointersRef.current.size >= 2 &&
        !activePointersRef.current.has(event.pointerId)
      ) {
        return;
      }

      event.currentTarget.setPointerCapture(event.pointerId);
      activePointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      if (activePointersRef.current.size === 2) {
        // 2本指ピンチ開始(6.1-6.3)。指を離して再度2本指にするたび毎回、
        // その時点の距離・スケールで開始値を記録し直す(設計レビュー対応)。
        // 進行中の1本指ドラッグは併発させないため破棄する(6.5)。
        dragStateRef.current = null;
        const [a, b] = Array.from(activePointersRef.current.values());
        pinchStateRef.current = {
          // 2本指がほぼ同一座標で検出された場合のゼロ除算(NaN/Infinityスケール)
          // を防ぐため、下限を設ける(レビュー指摘対応)。
          startDistance: Math.max(
            Math.hypot(a.x - b.x, a.y - b.y),
            MIN_PINCH_DISTANCE,
          ),
          startScale: modelGroup.scale.x,
        };
        return;
      }

      // 1本指ドラッグ開始(5.3, 5.4)
      dragStateRef.current = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startModelX: modelGroup.position.x,
        startModelY: modelGroup.position.y,
      };
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      const modelGroup = modelGroupRef.current;
      const camera = perspectiveCameraRef.current;
      const canvas = canvasRef.current;
      if (!modelGroup || !camera || !canvas) return;

      if (activePointersRef.current.has(event.pointerId)) {
        activePointersRef.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        });
      }

      // ── 2本指ピンチによる拡大縮小(6.1-6.4) ──
      const pinch = pinchStateRef.current;
      if (pinch && activePointersRef.current.size === 2) {
        const [a, b] = Array.from(activePointersRef.current.values());
        const currentDistance = Math.hypot(a.x - b.x, a.y - b.y);
        const ratio = currentDistance / pinch.startDistance;
        const baseScale = baseScaleRef.current;
        const rawScale = pinch.startScale * ratio;
        const clampedScale = Math.min(
          baseScale * SCALE_MAX_RATIO,
          Math.max(baseScale * SCALE_MIN_RATIO, rawScale),
        );
        modelGroup.scale.set(clampedScale, clampedScale, clampedScale);
        render();
        // ピンチ中は1本指ドラッグの移動を併発させない(6.5)。
        return;
      }

      // ── 1本指ドラッグによる移動(5.3, 5.4) ──
      const drag = dragStateRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      // 固定カメラのfov・距離(z=0平面まで)から、画面ピクセル差分をワールド座標の
      // 差分に変換するスケールを算出する(design.md参照)。
      const distance = camera.position.z - modelGroup.position.z;
      const visibleHeight =
        2 * distance * Math.tan((camera.fov * Math.PI) / 360);
      const visibleWidth = visibleHeight * camera.aspect;
      const worldPerPixel = visibleHeight / canvas.clientHeight;

      const dx = event.clientX - drag.startClientX;
      const dy = event.clientY - drag.startClientY;

      // 可動範囲を可視領域の一定割合にクランプし、画面端や下部の撮影ボタン領域に
      // 完全に隠れないようにする(5.4)。
      const maxX = (visibleWidth / 2) * DRAG_CLAMP_RATIO;
      const maxY = (visibleHeight / 2) * DRAG_CLAMP_RATIO;

      modelGroup.position.x = Math.min(
        maxX,
        Math.max(-maxX, drag.startModelX + dx * worldPerPixel),
      );
      // スクリーン座標のy(下方向が正)とThree.jsのワールドy(上方向が正)は
      // 符号が逆になるため反転する。
      modelGroup.position.y = Math.min(
        maxY,
        Math.max(-maxY, drag.startModelY - dy * worldPerPixel),
      );

      render();
    },
    [render],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      activePointersRef.current.delete(event.pointerId);
      if (activePointersRef.current.size < 2) {
        // ピンチは2点揃っている間のみ有効。1点以下に戻ったら終了し、
        // 残った1本指で自動的にドラッグを再開はしない(design.md参照)。
        pinchStateRef.current = null;
      }

      const drag = dragStateRef.current;
      if (drag && drag.pointerId === event.pointerId) {
        dragStateRef.current = null;
      }
    },
    [],
  );

  // ── 回転ボタンによる向き変更（5.5, 5.6） ──
  const handleRotate = useCallback(
    (direction: 1 | -1) => {
      const modelGroup = modelGroupRef.current;
      if (!modelGroup) return;
      modelGroup.rotation.y += ROTATE_STEP * direction;
      render();
    },
    [render],
  );

  // ── 撮影ボタン押下時の処理（タスク2.3） ──
  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    try {
      const dataUrl = compositeCapture(video, canvas);
      onCapture({ dataUrl, capturedAt: new Date() });
    } catch (err) {
      onError(err instanceof Error ? err.message : "撮影に失敗しました");
    }
  }, [onCapture, onError]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "var(--color-neutral-900)",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          // ドラッグでヒメッコの位置を操作できるようにする(5.3)。撮影ボタン・
          // 回転ボタンはzIndexで上に重なるため、タップは各ボタンへ優先して渡る。
          pointerEvents: "auto",
          touchAction: "none",
        }}
      />

      {/* 回転ボタン(左右, 5.5, 5.6) + 撮影ボタン(タスク2.3)。
          ArScene.tsx の撮影ボタンと同じ視覚パターンに揃える。 */}
      <div
        style={{
          position: "absolute",
          bottom: "calc(32px + env(safe-area-inset-bottom))",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <button
          type="button"
          onClick={() => handleRotate(1)}
          disabled={!modelReady}
          aria-label="ヒメッコを左に回転"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            // 明るい背景(空・雪・白壁など)がカメラ映像に写り込んだ場合でも
            // アイコンとのコントラスト比4.5:1以上を確保できるよう、既存の
            // 戻るボタン(rgba(30,28,25,0.6))より不透明度を上げている(4.5)。
            backgroundColor: "rgba(30, 28, 25, 0.75)",
            border: "none",
            cursor: modelReady ? "pointer" : "not-allowed",
            opacity: modelReady ? 1 : 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-neutral-0)",
            padding: 0,
          }}
        >
          <Icon name="rotate-left" width={28} height={28} />
        </button>

        <button
          type="button"
          onClick={handleCapture}
          disabled={!isReady}
          aria-label="撮影"
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "var(--color-neutral-0)",
            border: "4px solid var(--color-primary-400)",
            boxShadow: "var(--shadow-lg)",
            cursor: isReady ? "pointer" : "not-allowed",
            opacity: isReady ? 1 : 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              backgroundColor: "var(--color-primary-400)",
            }}
          />
        </button>

        <button
          type="button"
          onClick={() => handleRotate(-1)}
          disabled={!modelReady}
          aria-label="ヒメッコを右に回転"
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            // 明るい背景(空・雪・白壁など)がカメラ映像に写り込んだ場合でも
            // アイコンとのコントラスト比4.5:1以上を確保できるよう、既存の
            // 戻るボタン(rgba(30,28,25,0.6))より不透明度を上げている(4.5)。
            backgroundColor: "rgba(30, 28, 25, 0.75)",
            border: "none",
            cursor: modelReady ? "pointer" : "not-allowed",
            opacity: modelReady ? 1 : 0.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-neutral-0)",
            padding: 0,
          }}
        >
          <Icon name="rotate-right" width={28} height={28} />
        </button>
      </div>
    </div>
  );
}
