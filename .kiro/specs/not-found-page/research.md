# Gap Analysis: not-found-page

## 1. 現状調査（Current State）

### 既存アセット
- **`src/app/not-found.tsx` は未作成**。ルートに `error.tsx` / `global-error.tsx` も存在しない。現状は Next.js 標準の無地404が表示される。
- **`src/app/layout.tsx`（ルートレイアウト）**: `<html><body>` とフォント・Umamiスクリプトのみ。`AppHeader`/`AppFooter` は含まれない。
- **共通ヘッダー**: `src/app/_components/AppHeader.tsx` — ロゴ（`/assets/logo.svg`）とホームリンクのみのシンプルな構成。`homeHref`/`maxWidth` の props を持つ。
- **共通フッター**: `src/app/_components/AppFooter.tsx` — お問い合わせ・利用規約・プライバシーポリシー・著作権表示。リンク色は `text-arcana-orange-secondary`（デザインシステムのオレンジ例外運用に準拠済み）。
- **キャラクター表示**: `src/app/_components/CharacterContainer.tsx` — `leftSrc`/`rightSrc` に画像パスを渡すだけで白猫・黒猫を並べて表示。alt文言もファイル名から自動生成（`ojigi` → 「お辞儀する」）。
- **対象イラスト**: `public/assets/character/siro-ojigi.png`、`public/assets/character/kuro-ojigi.png` — 既に `entries/[cancelToken]/cancel/complete/page.tsx` で `CharacterContainer` 経由で使用中。**そのまま再利用可能、新規アセット不要**。
- **参考実装（同種のメッセージ完了画面）**: `entries/[cancelToken]/cancel/complete/page.tsx` が「イラスト＋見出しメッセージ＋一覧へ戻るリンク」という、今回の404ページとほぼ同一の構成を既に持つ。スタイル（`text-[28px] font-bold leading-[1.4] text-arcana-primary-green` の見出し、`‹ 一覧に戻る` リンク）をそのまま流用できる。
- **セクション別レイアウト**: `activities/layout.tsx` など各セクションの `layout.tsx` が `AppHeader`+`AppFooter` を個別にラップしている。ルートレイアウトには含まれていないため、**ルート直下の `not-found.tsx` は自前で `AppHeader`/`AppFooter` を呼び出す必要がある**（セクションレイアウトの外側で描画されるため）。
- **`notFound()` 呼び出し箇所**（既存7箇所）: `entries/[cancelToken]/complete/page.tsx`、`admin/(protected)/emails/page.tsx`、`activities/[id]/page.tsx`（×2）、`activities/[id]/apply/page.tsx`、`spots/(chrome)/[slug]/page.tsx`、`spots/[slug]/camera/page.tsx`。いずれもネストした `not-found.tsx` を持たないため、**ルート直下の `not-found.tsx` 1つですべてバブルアップして受け止められる**。
- **`middleware.ts`**: `/admin` 系のみを matcher 対象としており、訪問者向けページの404には影響しない（管理画面は本specのスコープ外と整合）。
- **デザイントークン**: `tailwind.config.mjs` に `arcana-primary-green`、`arcana-green`、`arcana-orange-secondary`、`body-blue`、`neutral-0/50/500` 等が定義済み。`globals.css` の `body` が `font-weight: 500` / `line-height: 1.6` をデフォルト適用しており、404ページでも新規トークン追加は不要と見込まれる。

### 規約・制約
- コンポーネント命名: kebab-case ファイル名、PascalCase コンポーネント（`structure.md`）。
- フォント: Tailwind スケールのみ、`text-sm` 未満禁止、太字は `font-bold` のみ（`design-system.md`）。
- 色: 新規ハードコード値禁止、既存トークン参照（`design-system.md`）。

## 2. 要件実現性分析（Requirements Feasibility）

| 要件 | 必要な技術要素 | 既存アセットで充足可否 |
|---|---|---|
| R1: 404表示（存在しないURL／個別コンテンツ不在） | Next.js `not-found.tsx` 規約 | ✅ Next.js標準機構をそのまま利用可能。ファイル新規作成のみ |
| R1.4: HTTPステータス404 | Next.js `not-found.tsx` は自動的に404を返す | ✅ フレームワーク機能で自動的に満たされる |
| R2: ヘッダー・フッター | `AppHeader` / `AppFooter` | ✅ そのまま呼び出し可能（ルートレイアウトに無いため404ページ内で明示的に呼ぶ） |
| R2.3: お辞儀猫イラスト | `CharacterContainer` + 既存2画像 | ✅ 新規アセット不要 |
| R3: 一覧へ戻る導線 | `Link`（next/link） | ✅ 既存の `cancel/complete/page.tsx` と同パターンで実装可能 |
| R4: デザイン・アクセシビリティ基準 | 既存 Tailwind トークン | ✅ 既存トークンで4.5:1コントラスト等を満たせる見込み（実装時に個別検証要） |

### Gap / Research Needed（ユーザー確認により解消済み）
- **「一覧ページ」の遷移先** → 解消。単純な固定リンクではなく、**404が発生した経路に応じて戻り先を出し分ける**方針に決定:
  - `/activities` 配下（例: `activities/[id]/page.tsx`、`activities/[id]/apply/page.tsx` の `notFound()`）で発生 → 交流コンテンツ一覧（`/activities`）へ
  - `/spots` 配下（例: `spots/(chrome)/[slug]/page.tsx`、`spots/[slug]/camera/page.tsx` の `notFound()`）で発生 → スポット一覧（`/spots`）へ
  - どちらにも該当しない（存在しないURL直打ちなど）→ トップページ（`/`）へ
  - **実装上の論点**: ルート直下の単一 `not-found.tsx`（Server Component）はどの経路から呼ばれたかの情報を props で受け取らない。実際にアクセスされたURLは変わらないままレンダリングされるため、`next/navigation` の `usePathname()` を使うクライアントコンポーネント部分を切り出し、パス先頭（`/activities` / `/spots`）で戻り先リンクを出し分ける実装が必要（design.md で確定）。
- **フッター構成** → 解消。モックアップ通り、お問い合わせ導線＋著作権表示のみの簡略フッターとする（利用規約・プライバシーポリシーへのリンクは含めない）。共通 `AppFooter` はそのまま使わず、404ページ専用の簡略マークアップとして実装する。
- **`arcana-orange-secondary` の日付/住所以外への流用可否**: 簡略フッターの「お問い合わせ」リンクは既存 `AppFooter` と同じ `text-arcana-orange-secondary` を踏襲する想定。装飾的なリンクであり、下線＋アイコン的な文脈で色以外の手がかりもあるため、デザインシステムのオレンジ例外運用の範囲内で問題ない見込み（design.md で明記）。

## 3. 実装アプローチ選択肢

### Option A: 既存コンポーネントの組み合わせ＋戻り先出し分け用の小さなクライアントコンポーネントで新規ページを作成（推奨）
- **対象ファイル**: `src/app/not-found.tsx`（Server Component）を新規作成し、`AppHeader`・`CharacterContainer`・簡略フッターマークアップ・見出しを配置。戻り先リンクのみ `usePathname()` でパスを判定する小さなクライアントコンポーネント（例: `NotFoundBackLink`）に切り出す。
- **互換性**: 既存コンポーネントの props はそのまま利用でき、既存ページへの影響はゼロ（新規ファイル追加のみ）。`AppFooter` は今回流用しない（簡略版を404ページ内に直接記述）。
- **複雑度**: 低〜中。戻り先出し分けのための最小限のクライアントコンポーネント分割が追加要素。

### Option B: 404専用の新規レイアウト/コンポーネントを作成
- 例えば `NotFoundIllustration` のような専用コンポーネントを切り出す。
- **検討理由**: 404ページ以外でも同じ構成（イラスト＋メッセージ＋戻るリンク）を再利用する予定がある場合に有効。現時点ではそのような要件はなく、過剰設計になるリスクがある。

### Option C: Hybrid（見送り）
- 本機能は単一ページの追加であり、段階的移行やフィーチャーフラグは不要なため対象外。

**推奨**: Option A。既存コンポーネント（`AppHeader`/`CharacterContainer`）と、戻り先出し分け用の小さなクライアントコンポーネントを組み合わせるだけで全要件を満たせ、新規ファイルは `src/app/not-found.tsx` と戻り先リンク用コンポーネントの2つ程度で完結する。

## 4. 実装規模・リスク

- **Effort**: **S（1〜3日）** — 新規ファイルは2つ程度、既存コンポーネントの組み合わせが中心。`usePathname()` によるパス判定ロジックのみが新規ロジック。
- **Risk**: **Low** — 確立された既存パターンを踏襲、外部依存・新規統合なし。戻り先の遷移先とフッター構成はユーザー確認により解消済み。

## 5. 設計フェーズへの申し送り事項

- **決定事項**:
  - `src/app/not-found.tsx` を新規作成し、`AppHeader` + `CharacterContainer`(siro-ojigi/kuro-ojigi) + 見出し + 簡略フッター（お問い合わせ＋著作権のみ）の構成とする（Option A）
  - 戻り先リンクは発生経路に応じて出し分ける: `/activities` 配下→`/activities`、`/spots` 配下→`/spots`、それ以外→トップページ（`/`）
- **設計フェーズで確定すべき実装詳細**:
  1. 戻り先出し分け用クライアントコンポーネントの名称・配置・`usePathname()` によるパス判定ロジックの具体的な分岐条件
  2. 各戻り先パターンごとのリンク文言（例: 「交流コンテンツ一覧に戻る」「スポット一覧に戻る」「トップページに戻る」）
