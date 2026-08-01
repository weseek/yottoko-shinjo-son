# Research Log: landing-page

## Discovery Scope

**Classification**: Simple Addition（既存 Next.js アプリへの静的ページ追加）  
**Discovery Process**: Light Discovery  
**Date**: 2026-06-01

## Key Findings

### 1. 既存アセット確認

| アセット | パス | 利用先 |
|---------|------|--------|
| ロゴ | `/public/assets/logo.png` | LandingFooter, HeroSection |
| 白猫キャラクター | `/public/assets/hyottoko.png` | HeroSection |
| 黒猫キャラクター | `/public/assets/hyottoko_2.png` | HeroSection |

**要追加アセット**:
- `/public/assets/phone-mockup.png` — スマホアプリ画面モックアップ
- `/public/assets/team-photo.jpg` — チーム集合写真（開発チーム）
- `/public/assets/feature-activity-mockup.png` — アクティビティカードのモックアップ（既存の `/activities` ページスクリーンショット）

### 2. 色トークン分析

デザイン画像から特定した色と、既存トークンのマッピング:

| セクション | デザイン色 | 使用トークン | 備考 |
|-----------|-----------|-------------|------|
| ヒーロー背景 | 薄い若葉グリーン | `--color-secondary-50` (#f0f9f1) | ほぼ一致 |
| 機能1 右エリア | 薄い若葉グリーン | `--color-secondary-50` | ヒーローと同系 |
| 機能2 左エリア | 淡いピーチ | インライン `#fff3ec` | 既存トークンなし |
| Background セクション | ダークグリーン | `--color-secondary-500` (#357a40) | 一致 |
| フッター | ダークグリーン | `--color-secondary-500` | Background と連続 |

### 3. レスポンシブブレークポイント

TailwindCSS v3 デフォルトブレークポイント:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px（PC レイアウト切替点として使用）
- `xl`: 1280px
- `2xl`: 1536px

デザイン画像の仕様（PC: 2880px幅、スマホ: 800px幅）から、`lg:` (1024px) をブレークポイントとして採用する。

### 4. 既存パターン分析

- Server Component パターン（`async` 関数コンポーネント）が全ページで採用されている
- ランディングページは DB アクセス不要のため同期コンポーネントで実装可能
- `next/image` で `height`, `width` を必ず指定（Next.js 15 要件）
- フォント: `font-[--font-zen-maru-gothic]` クラスで Zen Maru Gothic を適用

### 5. 開発ポータル移管

現行 `src/app/page.tsx` の依存関係:
- `prisma.activity.findFirst` — PUBLISHED/CLOSED アクティビティ取得
- `prisma.spot.findFirst` — スポット取得
- `env.APP_ENV` — 環境チェック（本番時リダイレクト）

`/dev` 移管後:
- `env.APP_ENV` 本番チェックによる `/activities` へのリダイレクトは削除
- DB アクセスは維持（開発者はサンプルデータで動作確認）

## Synthesis Outcomes

- **Build（新規実装）**: 全セクションコンポーネントを新規作成。既存の類似コンポーネントなし。
- **Reuse**: `next/link`, `next/image`, CSS カスタムプロパティトークンを再利用
- **Simplification**: 静的コンテンツのみのため State 管理不要。全コンポーネントを純粋な Server Component として実装。

## Risks

| リスク | 影響 | 対策 |
|--------|------|------|
| 画像アセット未用意 | ビジュアルセクションが表示できない | プレースホルダー（背景色のみ div）で実装し、実画像追加後に差し替え |
| 機能2の淡いピーチ色がデザインと一致しない | 微細な視覚差異 | デザイン画像から近似値を使用。調整は実装後にビジュアル確認 |
| `/dev` 移管後の既存リンク切れ | 開発者が旧 `/` URLをブックマーク等で参照している場合 | 影響軽微（開発者向け内部ページ）。README 等への追記を検討 |

---

## Gap Analysis（/kiro-validate-gap — 2026-06-01）

### 調査範囲

対象: `landing-page` spec（要件9件・設計7コンポーネント）に対する既存コードベースのギャップ分析  
調査ツール: コードベース静的解析（Grep / Read / Glob）

---

### 1. 要件 → 既存資産 マップ

| 要件 | 概要 | 既存資産 | ギャップ分類 |
|------|------|---------|------------|
| 1.1–1.2 | ルート `/` ランディングページ表示 | `page.tsx` 存在（開発ポータル） | **Constraint**: 本番リダイレクト廃止が必要 |
| 1.3 | 開発ポータルを `/dev` に移管 | `src/app/page.tsx` | **Missing**: `src/app/dev/` ディレクトリ未存在 |
| 2.1–2.8 | ヒーローセクション | なし | **Missing**: 新規コンポーネント要 |
| 3.1–3.4 | ABOUT セクション | なし | **Missing**: 新規コンポーネント要 |
| 4.1–4.5 | 機能その1（体験・手伝い） | `JoinButton`（再利用候補） | **Missing**: 新規セクションコンポーネント要 |
| 5.1–5.6 | 機能その2（ARフォト） | `JoinButton`（再利用候補） | **Missing**: 新規セクションコンポーネント要 |
| 6.1–6.4 | BACKGROUND セクション | なし | **Missing**: 新規コンポーネント要 |
| 7.1–7.3 | フッター | `logo.png` 存在 | **Missing**: 新規フッターコンポーネント要 |
| 8.1–8.4 | レスポンシブレイアウト | TailwindCSS v3（lg: ブレークポイント利用可） | ギャップなし |
| 9.1–9.5 | アクセシビリティ | CSS デザイントークン（コントラスト準拠） | **Unknown**: 見出し階層・alt テキストは実装時に確認が必要 |

---

### 2. 重要な発見事項（コードベース深掘り）

#### 2.1 `layout.tsx` の `force-dynamic` 制約

```typescript
export const dynamic = "force-dynamic";
```

全ルートが動的レンダリングになる。ランディングページは静的コンテンツだが、キャッシュされない。
→ **影響**: パフォーマンス上の懸念は軽微（静的HTML生成より遅いが許容範囲）

#### 2.2 `JoinButton` コンポーネントの再利用可能性

```typescript
// src/app/_components/join-button.tsx
JoinButton({ variant: "outline" | "solid", href, children, className? })
// "solid": --color-secondary-500 背景、白テキスト
// "outline": --color-secondary-50 背景、--color-secondary-500 ボーダー
```

ランディングページのプライマリ CTA ボタン（グリーン塗り）は `JoinButton variant="solid"` を再利用できる。
→ **推奨**: 設計 design.md では `next/link` ベースの実装を指示しているが、`JoinButton` を活用するとスタイル一貫性が高まる。

#### 2.3 `--color-secondary-600` トークン未定義の問題

`join-button.tsx` が `--color-secondary-600`（hover 色）を参照しているが、`globals.css` に定義がない。
→ ランディングページとは直接無関係だが、`JoinButton` を再利用する場合に注意が必要（hover 時に色が出ない）。

#### 2.4 外部から `/` を参照している箇所

| ファイル | 用途 | 影響 |
|---------|------|------|
| `src/app/admin/(protected)/emails/page.tsx:151` | `href="/"` — 「ホームへ戻る」リンク | ランディングページになるので問題なし（むしろ改善） |
| `src/app/camera/_components/HomeArExperience.tsx:27` | `backHref = "/"` デフォルト値 | 同上 |

#### 2.5 画像アセット状況（確定）

| アセット | 状態 |
|---------|------|
| `logo.png` | ✅ 存在 |
| `hyottoko.png` | ✅ 存在 |
| `hyottoko_2.png` | ✅ 存在 |
| `phone-mockup.png` | ❌ 未存在 |
| `team-photo.jpg` | ❌ 未存在 |
| `feature-activity-mockup.png` | ❌ 未存在 |

---

### 3. 実装アプローチ評価

#### Option A: 既存コンポーネントを拡張する
- 既存ページ `page.tsx` を直接修正してランディングコンテンツを追加
- ❌ 現行は DB クエリ・開発ポータルロジックが混在しており、拡張すると責務が曖昧になる
- ❌ 推奨しない

#### Option B: 新規コンポーネントを作成する（採用済み）
- `src/app/page.tsx` を新規ランディングページに置き換え、開発ポータルを `/dev` に移管
- ✅ 責務分離明確。ランディングページは静的コンテンツのみ
- ✅ `JoinButton` を部分的に再利用できる
- ✅ design.md の設計と整合

#### Option C: ハイブリッドアプローチ
- ランディングページを新規作成しつつ、CTA ボタンは既存 `JoinButton` を再利用
- ✅ ボタンスタイルの一貫性確保
- ❌ `--color-secondary-600` 未定義問題に対処が必要（hover 色を追加するか別実装にするか）

**推奨**: **Option B**（design.md 採用済み）を基本とし、**CTA ボタンについては `JoinButton` を再利用検討**（実装時判断）

---

### 4. 実装複雑度・リスク評価

| 軸 | 評価 | 根拠 |
|----|------|------|
| 努力量 | **S（1–3日）** | 純静的 UI ページ。DB・外部 API 不要。既存 Tailwind + トークン体系を踏襲 |
| リスク | **Low** | 未知の技術なし。既存ページへの破壊的変更なし。画像アセット欠如は実装でプレースホルダー対応済み |

---

### 5. デザインフェーズへの引き継ぎ事項

| 項目 | 状態 | 推奨アクション |
|------|------|-------------|
| `JoinButton` 再利用 | Unknown | 実装担当者が `solid` variant で代替するか独自ボタン実装するか判断 |
| `--color-secondary-600` 未定義 | Constraint | `JoinButton` 再利用時は `globals.css` に `--color-secondary-600: #2a6332` 等を追加（または hover なし実装） |
| 画像アセット3点 | Missing | 実装前に実画像準備 or プレースホルダー SVG で開始 |
| ランディングページの静的生成 | Constraint | `layout.tsx` の `force-dynamic` により `generateStaticParams` は不要。現状維持で問題なし |
