/** 3D モデルの設定 */
export interface ModelConfig {
  /** GLB ファイルの URL */
  url: string;
  /** 表示名 */
  label: string;
  /** モデルのスケール（デフォルト: 1） */
  scale?: number;
  /** モデルの回転オフセット（ラジアン） */
  rotation?: { x?: number; y?: number; z?: number };
}

/** 撮影結果 */
export interface CaptureResult {
  /** 撮影画像の data URL (image/png) */
  dataUrl: string;
  /** 撮影日時 */
  capturedAt: Date;
}

/** 自宅撮影ページの代替AR撮影体験の状態(マーカー追跡は行わないため専用の型として定義) */
export type HomeArFallbackState =
  | { phase: "guide" }
  | { phase: "idle" }
  | { phase: "camera-requesting" }
  | { phase: "camera-denied" }
  | { phase: "initializing" }
  | { phase: "ready" }
  | { phase: "capturing" }
  | { phase: "error"; message: string };
