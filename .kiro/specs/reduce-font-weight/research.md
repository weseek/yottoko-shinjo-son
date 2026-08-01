# Gap Analysis: reduce-font-weight

## 1. 現状調査（Current State Investigation）

### 主要ファイル
- `src/app/layout.tsx:7-12` — `Zen_Maru_Gothic({ weight: ["400","500","700"], ... })`。読込ウェイト定義の唯一の場所。
- `src/app/globals.css:142-151` — `body` セレクタ。`font-family` / `line-height` 等は設定済みだが `font-weight` は未設定（ブラウザ既定=400を継承）。
- `tailwind.config.mjs` — `theme.extend` に `fontWeight` のカスタム定義なし。Tailwindデフォルトのユーティリティ（`font-normal`=400〜`font-black`=900）をそのまま使用。`next-admin` の preset を読み込むのみ。

### font-weight ユーティリティクラスの使用状況（非adminスコープ、全体像）
| クラス | 総数 | 内 admin | 対象数 |
|---|---|---|---|
| `font-normal` | 0 | 0 | 0 |
| `font-medium` | 49 | 9 | 40（クリーンアップ検討対象） |
| `font-semibold` | 8 | 1 | 7（`font-bold`へ置換） |
| `font-bold` | 108 | 1 | 107（変更なし） |
| `font-extrabold` | 5 | 0 | 5（`font-bold`へ置換） |
| `font-black` | 2 | 0 | 2（`font-bold`へ置換） |

置換対象（`font-semibold`/`font-extrabold`/`font-black`）の具体ファイル:
- `font-semibold`: `entries/[cancelToken]/cancel/page.tsx:35`, `activities/[id]/apply/page.tsx:56`, `activities/[id]/apply/_components/entry-form.tsx:40,79`, `dev/page.tsx:43,330,352`
- `font-extrabold`: `camera/_components/HomeArExperience.tsx:182,240,298`, `activities/_components/how-to-participate.tsx:15`, `spots/(chrome)/page.tsx:75`
- `font-black`: `spots/[slug]/camera/_components/ArLanding.tsx:71,72`

### インライン `fontWeight` の使用状況
- 対象（camera機能、非admin）: `HomeArFallbackExperience.tsx`（4箇所, 700）, `OperationGuide.tsx`（2箇所, 700）, `CapturedPhotoPreview.tsx`（3箇所, 700）＝計9箇所
- 対象外（admin）: `admin/(protected)/emails/page.tsx`（4箇所, 700/600）
- 対象外（メールテンプレート、ユーザー確認済み）: `lib/email/templates/cancel-notification.tsx`（2箇所）, `lib/email/templates/entry-notification.tsx`（2箇所）

### 対象外領域の独立性
- `src/app/admin/globals.css` は `src/app/globals.css` と別ファイル（next-admin 用スタイルシート）だが、`src/app/admin/(protected)/layout.tsx` は独自の `<html>/<body>` を持たず `src/app/layout.tsx` の共有 `body` にネストされる。**訂正**: そのため本体の `body { font-weight: 500; }` 追加は admin 配下の無指定テキスト（明示的ウェイトクラスを持たない約7ファイル）にも継承され、完全には独立していない。この見た目への波及は design phase で検討の上、要件4に「意図した副作用」として明記済み（admin ファイル自体は編集しない）。
- `terms/page.tsx`・`privacy/page.tsx` は `font-bold` のみ使用（変更なし）。今回のクラス置換対象なし。

### コーディング規約
- `.kiro/steering/design-system.md` の「フォント」節に既存方針あり（フォントファミリ・サイズ・インライン禁止）が、ウェイトの使い分けに関する記述は未整備 → design phase で追記が必要。
- `.kiro/steering/design-system.md` 末尾に「デザイントークンを変更したら steering にも反映」という運用ルールが明記されている（今回のウェイト方針もこれに従い追記対象）。

## 2. 要件の実現可能性分析

| 要件 | 技術的手段 | ギャップ |
|---|---|---|
| Req 1（読込ウェイト削減） | `layout.tsx` の `weight` 配列編集 + `globals.css` の `body` に `font-weight: 500;` 追加 | ギャップなし。単純な設定変更。 |
| Req 2（faux描画是正） | 対象15クラス + インライン9箇所を `font-bold` へ機械的置換 | ギャップなし。既存の `buttonClassName`（`.kiro/specs/unify-button-style`由来）のような共通化は不要（単純ユーティリティクラスの置換のため）。 |
| Req 3（冗長クラス削除） | 対象40箇所の `font-medium` を1件ずつ確認し、祖先に明示的 `font-bold`（またはその他の明示ウェイト）がない場合のみ削除 | **Research Needed**: 「祖先が font-bold かどうか」の判定はDOM構造（JSXのネスト）を1ファイルずつ目視確認する必要があり、自動一括置換はできない。tasks phaseでファイル単位のタスクに分割し、レビュー観点として明示する。 |
| Req 4（対象外の非破壊） | grep差分で admin/terms/privacy/emailテンプレートに変更が及んでいないことを確認 | ギャップなし。`git diff --stat` で対象外パスに変更がないことを機械的に検証可能。 |

### 複雑度シグナル
- CRUD/アルゴリズム的分岐なし。単純なテキスト置換・設定変更・視覚回帰確認が中心。
- 唯一の実質的な判断が必要な作業はReq 3（`font-medium`のネスト確認）。

## 3. 実装アプローチ

### Option A: 既存ファイルを直接編集（推奨）
- **対象ファイル**: `layout.tsx`、`globals.css`、上記のクラス/インラインスタイル使用箇所（約20ファイル）
- **互換性**: 新規コンポーネントや抽象化は不要。`unify-button-style` specで作られた `button-variants.ts` のような共通化パターンは、フォントウェイトには過剰（Tailwindの標準ユーティリティで完結するため）。
- **トレードオフ**:
  - ✅ 最小限の変更、既存パターン踏襲
  - ✅ 新規抽象化によるオーバーヘッドなし
  - ❌ ファイル数が多く、レビュー漏れのリスク（特にReq 3のクリーンアップ）

### Option B（新規コンポーネント化）: 非推奨
- フォントウェイトはTailwindの標準ユーティリティクラスであり、`unify-button-style`のボタンのように複数プロパティを束ねる必要がないため、新規抽象化（ヘルパー関数等）を作る理由がない。

### Option C（ハイブリッド）: 不要
- 変更範囲が均質（クラス置換＋設定変更）なため、フェーズを分ける必要はない。

**推奨: Option A**

## 4. 実装複雑度とリスク

- **Effort**: S〜M（1〜4日目安）
  - 設定変更（Req 1）: 数分
  - クラス置換15箇所・インライン変換9箇所（Req 2）: 半日程度、機械的
  - `font-medium` クリーンアップ40箇所の祖先確認（Req 3）: 影響範囲が広く目視確認が必要なため最も時間がかかる
  - 全ページの視覚回帰確認（body既定500化の影響はアプリ全体に及ぶ）: 半日〜1日
- **Risk**: Low〜Medium
  - Low: Req 1/2/4は機械的で失敗しにくい
  - Medium: Req 3（祖先のweight継承を見誤ると、太さが変わってしまう/変わらないはずが変わる視覚回帰を生む）と、body既定変更によるアプリ全体の見た目変化（意図した変更だが、影響範囲が全ページに及ぶため見落としが起きやすい）

## 5. Design Phaseへの推奨事項

- **Preferred approach**: Option A（既存ファイル直接編集）
- **Key decisions carried forward**:
  - `font-medium` クリーンアップ対象40箇所をタスク分割する単位（ページ/機能単位が妥当）
  - 視覚回帰確認の範囲（全ページ既定ウェイト変更のため、代表画面を洗い出す）
  - `.kiro/steering/design-system.md`「フォント」節への追記内容（medium/boldの2ウェイト方針、font-weightユーティリティの使い分けルール）
- **Research Needed（設計時に解決）**:
  - `font-medium` 40箇所それぞれについて、祖先要素に明示的な `font-bold`（またはその他明示ウェイト）が存在するかどうかの一覧化

---

## 6. `font-medium` クリーンアップ対象の全量リスト（design phase時点で確定）

対象範囲（admin・利用規約・プライバシーポリシー・メールテンプレートを除く）で `font-medium` を使用している全39箇所。ディレクトリ単位でグルーピングし、目視での祖先ウェイト確認はtasks phaseでファイル単位に分割する。

### entries
- `src/app/entries/[cancelToken]/cancel/complete/page.tsx:80`
- `src/app/entries/[cancelToken]/cancel/page.tsx:43`
- `src/app/entries/[cancelToken]/complete/page.tsx:193`

### camera
- `src/app/camera/_components/FloorRecognitionToggle.tsx:63`
- `src/app/camera/_components/HomeArExperience.tsx:104,133,200,254`

### _components（共通）
- `src/app/_components/StepList.tsx:20`
- `src/app/_components/landing/background-section.tsx:26`
- `src/app/_components/landing/feature-activity-section.tsx:31`
- `src/app/_components/landing/hero-section.tsx:19,36`
- `src/app/_components/landing/feature-ar-section.tsx:65`
- `src/app/_components/landing/about-section.tsx:31`
- `src/app/_components/landing/landing-header.tsx:27,33,39`

### activities
- `src/app/activities/_components/activity-card.tsx:67`
- `src/app/activities/_components/activity-image-carousel.tsx:61`
- `src/app/activities/_components/how-to-participate.tsx:27`
- `src/app/activities/[id]/page.tsx:52,72`
- `src/app/activities/[id]/apply/page.tsx:66,88,124`

### dev
- `src/app/dev/page.tsx:374`

### spots
- `src/app/spots/(chrome)/page.tsx:36,66,83,102`
- `src/app/spots/(chrome)/_components/spot-card.tsx:41`
- `src/app/spots/(chrome)/[slug]/page.tsx:30,54,89,103`
- `src/app/spots/[slug]/camera/_components/ArLanding.tsx:61,117,153`

### 確認結果（目視サンプリング）
- 上記39箇所はいずれも `<p>` / `<span>` / `<Link>` によるテキストリーフ要素であり、コンポーネントツリー上で `font-bold` を持つ祖先の内側に配置されている例は目視確認の範囲では見つからなかった。
- ただし、Reactコンポーネントの合成（親コンポーネントが呼び出し側で `font-bold` を含む `className` を子に渡すケースなど）は静的grepでは検出できないため、tasks phaseでファイル単位のレビュー時に個別確認する。
