# Technical Design Document: reduce-font-weight

## Overview

**Purpose**: 本機能は、アプリ全体で読み込む Zen Maru Gothic のフォントウェイトを medium(500) と bold(700) の2種のみに削減し、未読込ウェイト(600/800/900)によるフェイクボールド描画を解消する。

**Users**: アプリを利用する全てのエンドユーザー（admin・利用規約・プライバシーポリシー・メールを除く全画面の閲覧者）が対象。開発者はフォントウェイトのユーティリティ選択がシンプルになる恩恵を受ける。

**Impact**: 現状 `["400","500","700"]` を読み込み、`font-semibold`(600)・`font-extrabold`(800)・`font-black`(900) を15箇所、インライン `fontWeight: 700` をcamera機能内9箇所で使用している状態から、読込ウェイトを `["500","700"]` に削減し、上記全箇所を `font-bold` に正規化する。本文既定は暗黙の400から明示的な500へ変更する。

### Goals
- Zen Maru Gothic の読込ウェイトを500/700の2種のみにする
- 未読込ウェイト（600/800/900）によるフェイクボールドを解消し、実際に読み込まれた `font-bold`(700) で描画する
- 新しい既定ウェイト(500)と重複する `font-medium` クラスを、意図しない太字継承を起こさない範囲で削除する
- admin・利用規約・プライバシーポリシー・メールテンプレートの見た目を変更しない

### Non-Goals
- フォントファミリの変更（Zen Maru Gothic を継続使用）
- フォントサイズ・行間・配色など、ウェイト以外のスタイル変更
- admin 画面のフォントウェイト方針変更
- メールテンプレート（`src/lib/email/templates/**`）のフォントウェイト変更
- `unify-button-style` spec で確立したボタンスタイル（`button-variants.ts`）自体の変更（本specはそのボタン内のテキストウェイトには触れるが、ボタンの色・枠線・形状には触れない）

## Boundary Commitments

### This Spec Owns
- `src/app/layout.tsx` の `Zen_Maru_Gothic` 読込ウェイト設定
- `src/app/globals.css` の `body` セレクタへの既定 `font-weight` 追加
- admin・利用規約・プライバシーポリシー・メールテンプレートを除く全範囲の `font-semibold` / `font-extrabold` / `font-black` クラスの `font-bold` への置き換え
- camera 機能配下のインライン `fontWeight: 700` スタイルの `font-bold` クラスへの置き換え
- 上記範囲内で、新しい既定ウェイト(500)と重複する `font-medium` クラスの削除（祖先が明示的に非500ウェイトを持つ場合を除く）
- `.kiro/steering/design-system.md`「フォント」節へのウェイト方針の追記

### Out of Boundary
- `src/app/admin/**`（next-admin 含む）配下の font-weight 関連スタイル
- `src/app/terms/page.tsx`（利用規約）・`src/app/privacy/page.tsx`（プライバシーポリシー）
- `src/lib/email/templates/**`（実際に送信されるメールHTML）のインライン `fontWeight`
- `unify-button-style` spec が定義したボタンの色・枠線・形状（`button-variants.ts` のバリアント定義自体）
- フォントウェイト以外の視覚的変更（色・余白・角丸・影など）

### Allowed Dependencies
- `next/font/google` の `Zen_Maru_Gothic` ローダー（既存依存、バージョン変更なし）
- TailwindCSS v3 標準の `fontWeight` ユーティリティスケール（カスタム `theme.extend.fontWeight` は定義しない）
- 既存の `src/app/globals.css` の `body` セレクタ（フォントファミリ等は変更しない、`font-weight` のみ追加）

### Revalidation Triggers
- Figma側でウェイト方針（500/700以外の値、または3種以上）が変更された場合
- 新規ページ・コンポーネントが `font-semibold` / `font-extrabold` / `font-black` またはインライン `fontWeight` を新たに導入しようとする場合（本specの方針に反するため要再確認）
- admin と本体アプリの `globals.css` が将来統合される場合（現在は別ファイルのため独立）
- メールテンプレートが将来Webフォントを読み込む方式に変更される場合（faux描画問題が新たに発生しうる）

## Architecture

### Existing Architecture Analysis
- フォントは `src/app/layout.tsx` の `RootLayout` で一箇所のみ読み込まれ、CSS変数 `--font-zen-maru-gothic` として `globals.css` の `body` に適用される、単純な単一読込構成。
- `tailwind.config.mjs` に `fontWeight` のカスタム定義はなく、Tailwindデフォルトのユーティリティクラス（`font-normal`〜`font-black`）がそのまま使われている。
- admin 画面は `src/app/admin/globals.css` という別スタイルシートを追加読込するが、`src/app/admin/(protected)/layout.tsx` は独自の `<html>/<body>` を持たないネストされたレイアウトであり、`src/app/layout.tsx` が定義する単一の共有 `body` 配下に存在する。そのため `body` への `font-weight: 500;` 追加は admin 配下の無指定テキスト（明示的なウェイトクラスを持たない約7ファイル）にも継承される。これは Requirement 4 で「意図した副作用」として明記済みであり、admin のファイル・クラスそのものへの編集は行わない（統合リスクは admin ファイルへの誤編集のみ、見た目の波及は許容範囲）。
- 本specは新しいアーキテクチャ要素（コンポーネント・サービス・API）を導入しない。既存ファイルの設定値とクラス名を変更するのみ。

### Architecture Integration
- **選定パターン**: 既存ファイル直接編集（gap analysis Option A）。新規抽象化は導入しない。
- **ドメイン境界**: フォント読込設定（layout.tsx）→ 既定ウェイト（globals.css）→ 個別クラス正規化（各UIファイル）という一方向の依存関係を維持する。
- **既存パターンの維持**: Tailwindユーティリティクラスによるスタイリング方針（`unify-button-style` spec の `design-system.md` 記載方針）をそのまま踏襲する。
- **新規要素の根拠**: なし（既存ファイルの値変更のみ）。
- **Steering遵守**: `design-system.md` の「インライン `style={{ ... }}` ではなくTailwindユーティリティで記述する」という既存方針に沿って、camera機能のインライン `fontWeight` もクラスへ移行する。

### Technology Stack

| Layer | Choice / Version | Role in Feature | Notes |
|-------|------------------|-----------------|-------|
| Frontend | Next.js 15 (`next/font/google`), TailwindCSS v3 | 読込フォントウェイト設定・ユーティリティクラス正規化 | 既存スタックのまま、新規依存の追加なし |

## File Structure Plan

### Directory Structure（変更パターン）
```
src/
├── app/
│   ├── layout.tsx                    # 読込ウェイト設定を ["400","500","700"] → ["500","700"] に変更
│   ├── globals.css                   # body に font-weight: 500; を追加
│   ├── entries/**                    # font-semibold → font-bold（1箇所）／font-medium整理
│   ├── activities/**                 # font-semibold → font-bold（3箇所）／font-medium整理
│   ├── dev/page.tsx                  # font-semibold → font-bold（3箇所）／font-medium整理（1箇所）
│   ├── spots/**                      # font-extrabold・font-black → font-bold／font-medium整理
│   ├── camera/_components/**         # font-extrabold → font-bold／インラインfontWeight:700 → font-bold
│   └── _components/**                # font-medium整理（landing系共通コンポーネント）
└── .kiro/steering/design-system.md   # フォント節にウェイト方針を追記
```
> 対象外（変更しない）: `src/app/admin/**`、`src/app/terms/page.tsx`、`src/app/privacy/page.tsx`、`src/lib/email/templates/**`

### Modified Files

**設定変更（2ファイル）**
- `src/app/layout.tsx:8` — `weight: ["400","500","700"]` → `weight: ["500","700"]`
- `src/app/globals.css:142-151` — `body` セレクタに `font-weight: 500;` を追加

**未読込ウェイトの正規化（15クラス箇所 + 9インライン箇所、研究ログ参照）**
- `font-semibold` → `font-bold`: `entries/[cancelToken]/cancel/page.tsx:35`、`activities/[id]/apply/page.tsx:56`、`activities/[id]/apply/_components/entry-form.tsx:40,79`、`dev/page.tsx:43,330,352`
- `font-extrabold` → `font-bold`: `camera/_components/HomeArExperience.tsx:182,240,298`、`activities/_components/how-to-participate.tsx:15`、`spots/(chrome)/page.tsx:75`
- `font-black` → `font-bold`: `spots/[slug]/camera/_components/ArLanding.tsx:71,72`
- インライン `fontWeight: 700` → `font-bold` クラス（`style` オブジェクトから該当プロパティを削除）: `camera/_components/HomeArFallbackExperience.tsx`（4箇所）、`camera/_components/OperationGuide.tsx`（2箇所）、`camera/_components/CapturedPhotoPreview.tsx`（3箇所）

**冗長クラスのクリーンアップ（39箇所、`research.md` セクション6に全量記載）**
- `entries/**`、`camera/_components/**`、`_components/**`（landing系共通コンポーネント）、`activities/**`、`dev/page.tsx`、`spots/**` にまたがる `font-medium` 使用箇所を1件ずつ確認し、祖先要素が明示的な非500ウェイトを持たない場合に限り削除する。
- 各ファイルの具体的な行番号一覧は `research.md`（セクション6）を参照。tasks phase ではディレクトリ単位でタスクを分割する。

**ドキュメント更新（1ファイル）**
- `.kiro/steering/design-system.md` — 「フォント」節に、読込ウェイトを500/700の2種に限定する方針と、`font-bold` を強調に統一する運用ルールを追記

## Components and Interfaces

本specはUIロジック・サービス・データ層を持たないため、以下は「コンポーネント」ではなく変更対象の**責務グループ**として扱う。いずれも新規コンポーネント化やインターフェース定義を伴わない、既存ファイルの値変更のみで完結する。

| 責務グループ | ドメイン/レイヤー | Intent | Req Coverage | 主な依存 |
|---|---|---|---|---|
| FontLoaderConfig | Config | 読込ウェイトを500/700に限定する | 1.1, 1.3 | `next/font/google`（P0） |
| GlobalBaseStyle | Style | 本文既定ウェイトを500にする | 1.2 | `globals.css` body セレクタ（P0） |
| WeightClassNormalization | UI（複数ファイル） | 未読込クラスをfont-boldに正規化する | 2.1, 2.2, 2.3 | 対象15箇所のJSXファイル（P1） |
| InlineStyleMigration | UI（camera機能） | インラインfontWeightをTailwindクラスに移行する | 2.4 | camera機能3ファイル（P1） |
| RedundantWeightCleanup | UI（複数ファイル） | 冗長なfont-mediumを安全に削除する | 3.1, 3.2, 3.3 | 対象39箇所のJSXファイル（P1）、祖先ウェイトの目視確認 |
| SteeringDocUpdate | Documentation | ウェイト方針をsteeringに反映する | Adjacent Expectations | `.kiro/steering/design-system.md`（P2） |
| OutOfScopeGuard | Verification（運用判断） | 対象外領域への変更混入を防ぐ | 4.1, 4.2, 4.3, 4.4 | `git diff --stat` によるパス検証（P0、Boundary Commitments 参照） |

いずれも新規の永続状態・API・イベントを持たないため、詳細なService/API/Event/Batch/State契約ブロックは該当しない（Contracts: いずれも対象外）。

**Implementation Notes**
- Integration: 各責務グループは独立して並行実装可能（同一ファイルを複数グループが触るケースはない設計）。ただしファイル単位では「クラス正規化」と「font-medium整理」が同一ファイル内に混在する場合があるため、その場合は1タスクにまとめて原子的に実施する（`unify-button-style` specでの教訓と同様、ビルドが壊れる中間状態を避ける）。
- Validation: 各変更後に `pnpm lint`（Biome）でクラス名の構文エラーがないことを確認。視覚回帰は Testing Strategy を参照。
- Risks: `RedundantWeightCleanup` は静的grepでは検出できない「親コンポーネントから渡される `className` 経由の `font-bold` 継承」を見逃すリスクがある（research.md参照）。実装時は該当ファイルを実際にレンダリングされた文脈で確認する。

## Testing Strategy

### Static Checks
- `biome ci .` — クラス名変更後の構文・フォーマット・import順のCIゲート（PR #130で判明した local lint と CI の差異を踏まえ、ローカルでも `biome ci .` を実行して検証する）
- `git diff --stat` — 対象外パス（`src/app/admin/**`、`src/app/terms/page.tsx`、`src/app/privacy/page.tsx`、`src/lib/email/templates/**`）に差分が一切含まれないことを機械的に確認（Req 4.1-4.3）

### Visual Regression（手動 / ブラウザ確認）
- 本文既定ウェイト変更（400→500）はアプリ全体に影響するため、代表画面を実機（devサーバー + ブラウザ）で確認する: トップ/ランディング、activities一覧・詳細・申込、spots一覧・詳細、camera（ホーム・AR起動・撮影プレビュー）、entries（申込完了・キャンセル）
- `font-bold` へ正規化した15箇所＋インライン9箇所は、変更前後で「フェイクボールドの解消（輪郭が明瞭になる）」という向上を確認する
- `font-medium` 削除箇所は、削除前後で見た目が変化しないこと（Req 3.3）を確認する

### Accessibility / Baseline UI
- 本specは色・コントラスト・フォントサイズを変更しないため、WCAG コントラスト比・14px下限には影響しない
- CLAUDE.mdのUI実装ルールに従い、変更ファイルに対して `/baseline-ui` と `/fixing-accessibility` を実装後に実行する（フォントウェイト変更に伴う新規のアクセシビリティ回帰がないことを確認する目的）
