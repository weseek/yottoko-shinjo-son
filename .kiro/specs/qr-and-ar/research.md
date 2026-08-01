# Research & Design Decisions

## Summary
- **Feature**: `qr-and-ar`
- **Discovery Scope**: New Feature（グリーンフィールド）
- **Key Findings**:
  - MindAR v1.2.5（MIT）は画像トラッキング + three.js で GLB 表示が可能。iOS Safari / Android Chrome 対応
  - QRコード単体は MindAR のマーカーとして不安定（反復パターンで特徴点が曖昧になる）。QRを装飾画像で囲む複合マーカーが実用的な回避策
  - 既存コードベースに Spot モデル（`arAssetUrl` フィールド付き）と `/spots/[slug]/camera` プレースホルダーが存在

## Research Log

### MindAR.js の技術調査
- **Context**: マーカーベースAR のライブラリ選定
- **Sources**: GitHub (hiukim/mind-ar-js), npm registry, MindAR Documentation
- **Findings**:
  - v1.2.5, MIT ライセンス。TensorFlow.js ベースの GPU 加速コンピュータビジョン
  - 4つのバンドル: image-tracking + three.js / A-Frame, face-tracking + three.js / A-Frame
  - `mind-ar/dist/mindar-image-three.prod.js` で three.js 統合
  - GLB/glTF モデルの読み込みは three.js の `GLTFLoader` 経由
  - ターゲット画像は `.mind` ファイルにコンパイルが必要（オンラインツールまたはプログラマティック API）
  - 写真撮影機能は未組込。`<video>` + WebGL canvas を手動合成して `toDataURL()` でエクスポート
  - `preserveDrawingBuffer: true` が WebGL レンダラーに必要
- **Implications**:
  - Next.js App Router では Client Component (`"use client"`) + `next/dynamic` (`ssr: false`) が必須
  - three.js がピア依存。バンドルサイズ増加（MindAR + three.js + TensorFlow.js）
  - `.mind` ファイルの事前コンパイルが必要。ビルドパイプラインまたは手動生成のワークフローが必要

### QRコードの MindAR マーカー適性
- **Context**: QRコード自体をARマーカーとして使用できるか
- **Sources**: MindAR documentation, "Choosing Good Target Images" ガイド
- **Findings**:
  - MindAR は NFT（Natural Feature Tracking）方式。特徴点の分布と一意性が認識精度に直結
  - QRコードは規則的な幾何パターンのため、特徴点が曖昧になり安定したトラッキングが困難
  - **回避策**: QRコードを視覚的にリッチな装飾画像で囲んだ複合マーカーを作成。周囲の画像が十分な特徴点を提供し、QR部分はスキャン可能なまま保持
- **Implications**:
  - 「QRコードをマーカーにする」要件は、複合マーカー方式で実現する
  - マーカー画像の生成・管理フローが設計に必要

### QRコード生成ライブラリ
- **Context**: 検証ページでのQRコード生成
- **Sources**: npm registry, 各ライブラリのGitHub
- **Findings**:
  - `qr-code-styling` (v1.9.2): Canvas/SVG/画像出力、ダウンロード機能組込、TypeScript 型付き、カスタマイズ可能
  - `qrcode.react` (v4.2.0): React コンポーネント、軽量（14kB）、Canvas/SVG 出力
  - `qrcode` (v1.5.4): Node.js / ブラウザ両対応、Canvas/PNG/SVG出力
- **Implications**:
  - 検証ページでは `qrcode.react` が軽量かつ React 統合が容易
  - 将来の管理画面での QR ダウンロード機能には `qr-code-styling` が適切

### 既存コードベースの分析
- **Context**: 既存のパターンとの統合方針
- **Sources**: コードベース直接分析
- **Findings**:
  - Spot モデルが Prisma に存在（slug, name, description, imageUrl, arAssetUrl）
  - `/spots/[slug]/camera` プレースホルダーページが存在
  - Server Component でデータ取得、Client Component でインタラクション、のパターン
  - インラインスタイル + CSS変数（`var(--color-primary-400)` 等）によるスタイリング
  - `public/assets/` に GLB ファイルを配置済み（.gitignore 未設定）
- **Implications**:
  - 検証ページは既存ルート構造とは独立した `/ar/demo` に配置（ダミーデータ使用のため）
  - AR コンポーネントは将来的に `/spots/[slug]/camera` から利用可能な設計にする
  - GLB ファイルの .gitignore 設定が必要

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| MindAR + three.js | 画像トラッキング + three.js 3Dレンダリング | GLB対応、React統合例あり、MIT | 開発停滞気味（最終更新2年前）、バンドルサイズ大 | 推奨。React例が公式に存在 |
| MindAR + A-Frame | 画像トラッキング + A-Frame | 宣言的API | React統合が困難、カスタマイズ性低 | 不採用 |
| AR.js | パターンマーカー方式 | 枯れた技術、安定 | 画像トラッキング品質が MindAR に劣る、メンテ停滞 | 不採用 |
| 8th Wall | 商用WebAR SDK | 平面検出対応、iOS/Android統一 | 有料（月額課金）、ベンダーロックイン | α版スコープ外 |

## Design Decisions

### Decision: AR ライブラリに MindAR + three.js を採用
- **Context**: ブラウザ完結のマーカーベースARで GLB 3Dモデルを表示する必要がある
- **Alternatives**:
  1. MindAR + A-Frame — 宣言的だが React 統合が困難
  2. AR.js — 画像トラッキング品質が MindAR に劣る
  3. 8th Wall — 有料、α版スコープ外
- **Selected**: MindAR + three.js
- **Rationale**: GLB 対応、iOS Safari / Android Chrome 対応、MIT ライセンス、公式 React 例あり
- **Trade-offs**: バンドルサイズ増（TensorFlow.js 含む）、開発活発ではない
- **Follow-up**: パフォーマンス（特に低スペック端末）の検証が必要

### Decision: QRコードマーカーは複合マーカー方式で実現
- **Context**: QRコード自体をARマーカーとして使いたいが、MindAR の特徴点検出と相性が悪い
- **Alternatives**:
  1. QRコード単体をマーカーにする — 認識不安定
  2. QRとARマーカーを完全に分離する — ユーザー体験が分断
  3. QRを装飾画像で囲んだ複合マーカー — QRスキャン可能＋AR認識可能
- **Selected**: 複合マーカー方式
- **Rationale**: QRの機能性（URLエンコード）とARの機能性（画像認識）を1枚の画像で両立
- **Trade-offs**: マーカーデザインの制約（周囲に十分な特徴点が必要）
- **Follow-up**: 実機での認識精度テストが必要

### Decision: 検証ページは `/ar/demo` に独立配置
- **Context**: 既存の `/spots/[slug]/camera` はスポットデータに依存。検証ページはダミーデータで動作する必要がある
- **Alternatives**:
  1. `/spots/demo/camera` — 既存ルートに乗せる。Spot データが必要
  2. `/ar/demo` — 独立した検証用ルート
- **Selected**: `/ar/demo`
- **Rationale**: スポットデータ未整備でも動作、将来の統合に影響しない
- **Trade-offs**: 検証用の一時的なルートが残る
- **Follow-up**: スポット管理完成後に `/spots/[slug]/camera` への統合を検討

## Risks & Mitigations
- **MindAR の開発停滞**: 最終更新が約2年前。代替として AR.js や独自実装を検討する準備を持つ
- **バンドルサイズ**: MindAR + three.js + TensorFlow.js で数MBになる。dynamic import + code splitting で初回ロードへの影響を軽減
- **GLB ファイルサイズ**: himekko.glb が 33MB。検証時は許容するが、本番では Draco 圧縮 or glb-optimizer を適用
- **iOS Safari の制約**: getUserMedia の権限ダイアログがブラウザ依存。ミニ導線画面でユーザーに事前説明する設計で対応
- **`.mind` ファイル管理**: ターゲット画像変更のたびに再コンパイルが必要。将来的にCI/管理画面での自動生成を検討

## References
- [MindAR GitHub](https://github.com/hiukim/mind-ar-js) — コアライブラリ
- [MindAR React Example](https://github.com/hiukim/mind-ar-js-react) — React 統合パターン
- [MindAR Image Targets Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/) — .mind ファイル生成
- [MindAR Documentation](https://hiukim.github.io/mind-ar-js-doc/) — 公式ドキュメント
- [qrcode.react](https://github.com/zpao/qrcode.react) — React QRコード生成
- [qr-code-styling](https://www.npmjs.com/package/qr-code-styling) — カスタマイズ可能QR生成
- [Web Share API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) — シェア機能
