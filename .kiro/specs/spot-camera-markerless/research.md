# Research & Design Decisions

## Summary
- **Feature**: `spot-camera-markerless`
- **Discovery Scope**: Extension（既存システムの方式置換）
- **Key Findings**:
  - 自宅撮影（`/camera`）は既に model-viewer のネイティブAR（`ar-modes="scene-viewer quick-look"`）で稼働中。Spotはこれを再利用できる（`HiddenArViewer` / `ModelViewer` / `ArModal`）。
  - `three` と `mind-ar` は実質 Spot の `ArScene.tsx` と MindAR 型定義・shim からしか参照されておらず、Spotのマーカーレス化で依存ごと撤去可能。
  - `20260522000000_drop_home_camera_marker_fields` が同型の先例。`HomeCameraConfig` から同名フィールドを削除済みで、Spot側も同じパターンで migration を書ける。

## Research Log

### 既存の自宅撮影（床検知）実装の再利用性
- **Context**: Spotを自宅撮影と「完全統一」する方針のため、既存コンポーネントの流用可否を確認。
- **Sources Consulted**:
  - `src/app/camera/_components/HomeArExperience.tsx`（AR起動導線・非対応フォールバック）
  - `src/app/camera/_components/HiddenArViewer.tsx`（`model-viewer ar ar-modes="scene-viewer quick-look"`, `activateAR()`）
  - `src/app/camera/_components/ModelViewer.tsx` / `ArModal.tsx`
- **Findings**:
  - 非表示の `<model-viewer>` を保持し、`canActivateAR` が真なら `activateAR()` でネイティブARを起動、偽なら `ArModal`（3Dビューア）にフォールバックする確立されたパターンが存在。
  - `ArLanding.tsx` は既に `ModelViewer` でGLBプレビューを表示しており、ランディングUIはそのまま活かせる。
- **Implications**: SpotArExperience を HomeArExperience と同型に書き換え、ランディング表示は既存 `ArLanding` を継続利用する。新規コンポーネントは不要。

### マーカー方式コードの依存グラフ
- **Context**: マーカー完全廃止に伴う撤去範囲の確定。
- **Sources Consulted**: `grep -rn` によるシンボル追跡（`mindFileUrl` / `markerImageUrl` / `mind-ar` / `three` / `TargetConfig` / `CaptureResult` / `lib/ar/state`）。
- **Findings**:
  - `three` の import 元は `ArScene.tsx`・`three-shim.ts`・`mind-ar.d.ts` のみ。
  - `lib/ar/state.ts`（`checkBrowserCompatibility` 他）の利用元は `SpotArExperience.tsx` のみ。
  - `PhotoPreview.tsx` は `SpotArExperience.tsx` に加え `src/app/dev/preview/_components/DevPreviewClient.tsx`（開発用プレビュー）からも参照。
  - `ModelConfig`（`lib/ar/types.ts`）は自宅撮影も使用するため残す。`TargetConfig` / `CaptureResult` / `ArSceneState` / `PageView` は Spot専用で撤去可能。
- **Implications**: マーカー・自作キャプチャ専用のファイル群を削除し、`DevPreviewClient` の `PhotoPreview` 参照も除去する。`ModelConfig` のみ型として残す。

### DBスキーマ変更の先例
- **Context**: `mindFileUrl` / `markerImageUrl` の安全な削除方法。
- **Sources Consulted**: `prisma/migrations/20260522000000_drop_home_camera_marker_fields/migration.sql`。
- **Findings**: `ALTER TABLE ... DROP COLUMN` の単純パターンで先例あり（HomeCameraConfig）。Spotも `spots` テーブルに対し同型で適用可能。
- **Implications**: 新規 migration を追加し、`prisma generate` で生成物（`src/generated/prisma`）を更新する。

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| A. model-viewer ネイティブAR（採用） | 自宅撮影と同じく OS標準ARビューアに委譲 | 実装統一・保守容易・マーカー運用負荷ゼロ | 撮影UIをOSに委ねる（自作枠/シェア文は消える） | ユーザー承認済みの方針 |
| B. WebXR hit-test 自前実装 | 床検知を自前で行い自作キャプチャ維持 | ブランド枠・シェア文を維持可能 | 実装量大・iOS Safari制約大 | 不採用 |

## Design Decisions

### Decision: 既存自宅撮影コンポーネントの再利用
- **Context**: Spotを自宅撮影と統一する。
- **Alternatives Considered**:
  1. Spot専用に新規AR起動コンポーネントを作る
  2. `@/app/camera/_components` の `HiddenArViewer` / `ArModal` / `ModelViewer` を直接再利用
- **Selected Approach**: 2。`SpotArExperience` を HomeArExperience 同型の起動ロジックに書き換え、表示は既存 `ArLanding` を継続。
- **Rationale**: 重複実装を避け、両撮影の挙動を一本化する。`ArLanding` は既に `ModelViewer` を利用しており親和性が高い。
- **Trade-offs**: 自作プレビュー/シェアUIは廃止（方針として承認済み）。
- **Follow-up**: 実機（Android Scene Viewer / iOS Quick Look）でのAR起動を検証。

### Decision: マーカー専用コード・依存の削除
- **Context**: マーカー完全廃止。
- **Selected Approach**: `ArScene.tsx` / `PhotoPreview.tsx` / `mind-ar.d.ts` / `three-shim.ts` / `lib/ar/state.ts` / `upload-mind` route / `mind-file-upload-input.tsx` を削除し、`mind-ar` / `three` / `@types/three` を依存から除去。`lib/ar/types.ts` は `ModelConfig` のみ残す。
- **Rationale**: 未使用コードと重量級依存（three）を残すと保守負債になる。
- **Trade-offs**: `three` を将来再利用する場合は再導入が必要（現状利用箇所なし）。
- **Follow-up**: `dev/preview` の `PhotoPreview` 参照を除去。`demo.mind` 等マーカーアセットの残置有無を確認。

## Risks & Mitigations
- **iOS Quick Look は GLB 非対応**（USDZ が必要な場合がある） — model-viewer が glb→usdz 変換パス（`ios-src` 未指定時の自動変換/CDN）に依存。自宅撮影で既に同構成が稼働しているため同等挙動を前提とし、実機で確認する。
- **`three` 依存削除に伴うビルド影響** — 削除前に `three` / `mind-ar` の全参照が撤去済みであることを型チェック（`tsc`）とビルドで担保。
- **既存スポットデータに登録済みの `.mind`/マーカー画像URL** — カラム削除で参照不能になるが、マーカーレス方式では不要のため実害なし。migration はデータ損失前提（マーカー資産は今後使用しない）。

## References
- [model-viewer AR modes](https://modelviewer.dev/docs/index.html#augmentedreality-attributes) — `ar-modes` の挙動
- [google/model-viewer#1589](https://github.com/google/model-viewer/issues/1589) — WebXR に撮影UIが無い件（scene-viewer 優先の根拠、既存コードに記載）
