/**
 * カメラ映像とWebGL描画結果を合成し、静止画のdata URLを生成する
 *
 * `ArScene.tsx` の `handleCapture` で実証済みの合成手順
 * (オフスクリーンcanvas生成 → video描画 → 描画済みcanvas描画 → toDataURL)
 * をそのまま関数として抽出したもの。
 *
 * Preconditions:
 *  - `video` は再生中でフレームを持つこと
 *  - `renderCanvas` はレンダリング直後であること
 * Postconditions:
 *  - 戻り値は `image/png` 形式のdata URL文字列
 * Invariants:
 *  - 入力の `video` / `renderCanvas` を変更しない（副作用なし）
 */
export function compositeCapture(
  video: HTMLVideoElement,
  renderCanvas: HTMLCanvasElement,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = renderCanvas.clientWidth;
  canvas.height = renderCanvas.clientHeight;

  const ctx2d = canvas.getContext("2d");
  if (!ctx2d) throw new Error("Canvas 2D context の取得に失敗しました");

  // 1. カメラ映像を描画
  ctx2d.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 2. WebGL レンダリング結果を重ねて描画
  ctx2d.drawImage(renderCanvas, 0, 0, canvas.width, canvas.height);

  return canvas.toDataURL("image/png");
}
