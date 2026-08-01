# Gap Analysis: unify-button-style

## 1. 現状調査（Current State Investigation）

### 主要ファイル・実装パターン
現在、対象ボタンは3つの異なる実装パターンに分かれている。

| パターン | 実装 | 使用箇所 |
|---|---|---|
| 共有コンポーネント（`<Link>`） | `src/app/_components/join-button.tsx`（`variant: "outline" \| "solid"`） | `activity-card.tsx`（詳しく見る/参加してみる）、`[id]/page.tsx`（参加してみる）、`entries/.../complete/page.tsx`（交流詳細に戻る）、`feature-ar-section.tsx`（スポット一覧を見る/ひめっ子と写真を撮ってみる）×2 |
| 個別実装（native `<button>`） | ハードコードのTailwindクラス | `cancel-button.tsx`（キャンセルする、`useFormStatus`でpending制御）、`entry-form.tsx` の `SubmitButton`（申し込む、同様にpending制御） |
| 個別実装（`<a>`/`<Link>`、inline style併用） | ハードコード or `style={{ backgroundColor: ... }}` | `entries/.../complete/page.tsx`（自分にメールで共有）、`HomeArExperience.tsx`、`spot-card.tsx`、`ArLanding.tsx`、`hero-section.tsx`、`landing-header.tsx`、`feature-activity-section.tsx` |

### トークン定義（Single Source of Truth: `globals.css` → `tailwind.config.mjs`）
- `--color-arcana-primary-green: #089400` → Tailwind `arcana.primary-green`（**既に定義済み**、要件のバリアント①②背景・③ボーダー/文字と一致）
- `--color-arcana-green: #397754` → Tailwind `arcana.green`（**既に定義済み**、要件のバリアント①ボーダーと一致）
- `--color-arcana-green-dark: #067300` → **`tailwind.config.mjs` に未登録**（`globals.css` のCSS変数のみ。任意値 `border-[var(--color-arcana-green-dark)]` で3箇所が参照中）
- `--color-spot-action: #089400` → Tailwind `spot.action`。`arcana-primary-green` と**同一色の別トークン**（重複）
- `--color-secondary-500/600`（#357a40/#2a6332）→ `JoinButton` の `solid`/`outline` バリアントが依存。要件の緑（arcana系）とは異なる色

### 具体的な不一致（ファイル調査で確認済み）
1. **ボーダー色の食い違い**: `cancel-button.tsx:13`、`entry-form.tsx:18`、`entries/.../complete/page.tsx:163` の3箇所は既に `bg-arcana-primary-green` を使っているが、ボーダーは要件が指定する `arcana-green`（#397754）ではなく `arcana-green-dark`（#067300）。**「既に正しく見える」箇所も含め、ボーダー色トークンの決定が必要**。
2. **文字サイズの不統一**: `cancel-button.tsx`・`entries/complete` の自分にメールで共有ボタンは `text-[18px]`（任意値）、`entry-form.tsx` の申し込むボタンと `JoinButton` は `text-base`（16px）。要件4（18px以上）を満たすには大半の箇所で変更が必要。design-system.md は「任意値`text-[18px]`より Tailwind スケール優先」と規定しており、`text-[18px]` は `text-lg`（Tailwindのビルトイン、18px）へ置き換えるのが望ましい。
3. **`JoinButton` 自体が誤トークン**: `outline`/`solid` とも `secondary-500/600` 依存。これに乗っている4箇所（詳しく見る、参加してみる×2、交流詳細に戻る、スポット一覧を見る、ひめっ子と写真を撮ってみる）は全てコンポーネント側の修正で一括対応可能。
4. **`feature-ar-section.tsx` の変種ミスマッチ**: 「スポット一覧を見る」「ひめっ子と写真を撮ってみる」が `JoinButton variant="outline"`（白＋secondary-500）で実装されており、要件2（緑・ボーダーなし）と矛盾。同じ文言のボタンが `HomeArExperience.tsx` では正しく緑で実装済み。
5. **`landing-header.tsx:46`／`feature-activity-section.tsx:56`**: `arcana-green`（#397754）を使用しているが、要件は `arcana-primary-green`（#089400）または白＋`arcana-primary-green`を指定。色相自体は近いが別トークン。
6. **`activity-filter-client.tsx` の `FilterButton`**: `active` 真偽値でクラスを丸ごと切り替える実装（アクティブ=塗り、非アクティブ=白抜き、共に `secondary-400` 系）。要件5は「すべて＝常に緑」「募集中のみ＝常に白」という**ラベル固定色**であり、`active` に応じた色反転ロジックは撤去が必要（`active` state自体はフィルタリング処理として存続）。

## 2. 要件充足性分析（Requirement-to-Asset Map）

| 要件 | 資産の状態 | 分類 |
|---|---|---|
| 要件1: プライマリ（緑・濃ボーダー） | `JoinButton solid`／`cancel-button.tsx`／`entry-form.tsx`／メール共有ボタン は概ね形があるが、ボーダー色（#067300 vs #397754）と文字サイズが不一致 | **Constraint**（トークン統一が必要） |
| 要件2: 標準（緑・ボーダーなし） | `HomeArExperience.tsx`／`ArLanding.tsx` は正しい色。`hero-section.tsx` も正しい色だが16px。`landing-header.tsx` は別トークン（arcana-green）。`feature-ar-section.tsx` は白/アウトラインで変種自体が誤り | **Constraint** |
| 要件3: アウトライン（白） | `spot-card.tsx` は正しい（`spot-action`＝同色異トークン）。`JoinButton outline` は誤トークン。`feature-activity-section.tsx` は`arcana-green`使用 | **Constraint** |
| 要件4: アクセシビリティ（18px＋コントラスト） | 統一的な仕組みが存在しない（コンポーネントごとにバラバラ） | **Missing**（新規に方針を決めて全箇所へ適用） |
| 要件5: 絞り込みトグル配色 | `FilterButton` は存在するが `active` に応じた色反転ロジックのため、要件の「ラベル固定色」への変更が必要 | **Constraint**（ロジック変更を伴う） |
| 要件6: 対象外の非破壊 | 対象外ファイルに触れなければ自動的に満たされる | リスク低（実装時のdiffレビューで担保） |

### 複雑度シグナル
CRUDやAPI変更は無く、純粋なUI（Tailwindクラス・コンポーネント構造）の変更。新規外部依存なし。DB/スキーマ変更なし。

## 3. 実装アプローチの選択肢

### Option A: `JoinButton` のみ拡張し、native `<button>` 側は個別に色修正
- **対象**: `JoinButton` の2バリアントの色・文字サイズを修正し、Link系の呼び出し元（activity-card, [id]/page, entries/complete, feature-ar-section, HomeArExperience, spot-card, ArLanding, landing系）はそのまま恩恵を受ける。`cancel-button.tsx`／`entry-form.tsx` の native `<button>` は個別にクラス文字列だけ修正（コンポーネント化しない）。
- **トレードオフ**:
  - ✅ 変更範囲が小さく、`<Link>` と `<button>` の意味的な違い（type=submit, disabled, pending表示）に触れずに済む
  - ✅ 既存の呼び出し側APIを変えないため回帰リスクが低い
  - ❌ 色・サイズの定義が「JoinButtonのクラス文字列」と「2つの個別ボタンのクラス文字列」に分散したまま残り、ユーザーが目指す「スタイルの継承」を部分的にしか満たさない
  - ❌ 将来また色がズレる余地が残る

### Option B: 3variantの共通スタイル定義を新設し、`JoinButton` と native `<button>` 双方から参照
- **対象**: 3variant（primary/standard/outline）の base class文字列（または `cva` 的なvariant関数）を1箇所に定義し、`JoinButton`（Link用）と `cancel-button.tsx`／`entry-form.tsx`（button用）の両方がそこから同じクラスを取得する。ランディング系の一部 `<a>`/`<Link>` 一枚岩実装も、可能な範囲でこの共通定義 or `JoinButton` 自体に寄せる。
- **トレードオフ**:
  - ✅ 色・サイズの単一情報源ができ、ユーザーの「なんらかの形でスタイルが継承されている」という目標に最も合致
  - ✅ 将来ボタンを追加する際も同じ定義を参照するだけで済む
  - ❌ 一度に触るファイル数が多くなる（共通定義の設計＋全呼び出し元の移行）
  - ❌ Link用とbutton用で必要なprops（type, disabled, aria属性等）が異なるため、共通化の粒度（クラス文字列のみ共通化 or コンポーネント自体を共通化）を設計フェーズで決める必要がある

### Option C: 段階的移行（Hybrid）
- **Phase 1（本spec）**: 共通クラス定義を新設し、まず `JoinButton` 経由の箇所（Link系の大半）をそこに接続。native `<button>` の2箇所（cancel-button, entry-form）は当面ハードコードのまま色・サイズだけ揃える。
- **Phase 2（別task/spec）**: native `<button>` 側も共通定義に接続する。
- **トレードオフ**:
  - ✅ 早期に大半の画面へ視覚的な統一を届けられる
  - ✅ 1回のタスクの範囲が小さく、レビューしやすい
  - ❌ 一時的に「共通定義を使う箇所」と「使わない箇所」が併存し、Phase 2を追跡しないと中途半端な状態が残る
  - ❌ ユーザーの「コンポーネント化したい」という目的の完全な達成が先送りになる

**所感（情報提供、決定はしない）**: ユーザーが要求している「スタイル継承」「コンポーネント化」という目的自体を踏まえると Option B が最も整合するが、一度に触るファイル数はA/Cより多い。設計フェーズでどのAPI形状（クラス文字列共通化 vs コンポーネント自体の共通化）にするか具体化することを推奨。

## 4. Research Needed（設計フェーズへの持ち越し事項）

1. **要件1のボーダー色トークン確定**: 要件は `arcana-green`（#397754, Tailwind登録済み）を指定しているが、既存の3箇所（キャンセルする／申し込む／自分にメールで共有）は `arcana-green-dark`（#067300, Tailwind未登録）を使用中。どちらを正とするか、デザイナー/Figma側の確認を推奨（見た目上は近似色のため気付きにくい差異）。
2. **コンポーネント境界の具体化**: Option A/B/Cのどれを採るか、共通化する場合はクラス文字列のユーティリティ関数にするか、コンポーネント自体（Button/ButtonLinkのようなpolymorphicな共通コンポーネント）にするか。
3. **ホバー・フォーカス時の配色**: ユーザー指定は各バリアントの基本状態（背景・ボーダー・文字）のみで、hover/focus時の挙動は未指定。既存 `JoinButton` は hover で背景を暗くする実装（secondary-600）を持つが、新配色でのhover色は要決定（例: variant1/2は `arcana-green` へ暗転、variant3は `arcana-green-light`(#e8efe5, 定義済み) へ淡く反転、など）。
4. **`spot-action`/`arcana-primary-green` の重複整理**: 見た目には影響しないが、トークンの一本化をこのspecで行うか、別途整理タスクにするか。
5. **絞り込みトグルの選択状態表現**: 色でアクティブ/非アクティブを示さなくなるため、他の手段（太字、下線、aria-pressedなど）で選択状態を示す必要があるか。requirements.mdでは対象外として明記済みだが、実装時にUXレビューで指摘される可能性あり。

## 5. 実装複雑度とリスク

- **Effort: S〜M**（1〜4日想定）
  - 既存パターン（Tailwindユーティリティクラス、既存トークン）の範囲内で完結し、新規外部依存なし
  - 対象ファイル数は約13〜15（`join-button.tsx`、`cancel-button.tsx`、`entry-form.tsx`、`entries/.../complete/page.tsx`、`activity-card.tsx`、`[id]/page.tsx`、`activity-filter-client.tsx`、`HomeArExperience.tsx`、`spot-card.tsx`、`ArLanding.tsx`、`hero-section.tsx`、`landing-header.tsx`、`feature-activity-section.tsx`、`feature-ar-section.tsx`）＋ steering (`design-system.md`) 更新
  - Option B/Cを採る場合は共通定義の新規作成が加わるが、規模は小さい（クラス文字列 or 小さなユーティリティ関数）
- **Risk: Low**
  - DB/API/外部依存の変更なし。ロジック変更は `FilterButton` の色分岐撤去のみで、影響範囲が明確
  - 主なリスクは「対象漏れによる見た目の統一漏れ」（要件6の対象外リストとの線引きミス）と「コントラスト・文字サイズの適用漏れ」。CLAUDE.mdが実装後に義務付けている `/baseline-ui` と `/fixing-accessibility` の実行で検出可能

## 6. 設計フェーズへの推奨事項

- **優先して決めるべきこと**: (1) ボーダー色トークン（#397754 vs #067300）の確定、(2) コンポーネント化の方式（Option A/B/C）
- 文字サイズは `text-lg`（Tailwind標準18px）への統一を推奨（design-system.mdの既存方針と整合）
- 対象外（要件6）のファイルは設計・実装のどちらのフェーズでも変更対象に含めないことをタスク分割時に明示する

---

## 7. 設計シンセシス（Design Synthesis）— `/kiro-spec-design` 実行時に確定した決定事項

### 一般化（Generalization）
- 「Link用のJoinButton」「native button用の個別実装」「ランディング/AR/スポットページの単発Link・a実装」は、いずれも根本的には「3バリアントのうちどれかの色・文字サイズを描画する」という同じ問題の特殊ケースである。この共通部分を `src/app/_components/button-variants.ts` の `buttonClassName(variant, className?)` という1つのインターフェースに一般化した。パディングや要素種別（button/a/Link）といった呼び出し元固有の差異は一般化の対象に含めない（過剰な共通化を避けるため）。

### Build vs Adopt
- 3variantの静的なスタイル定義に `class-variance-authority`（cva）等の外部ライブラリを採用するかを検討したが、tech.mdに記載の依存に含まれず、既に `join-button.tsx` がオブジェクトリテラルで同種のパターン（`variantClass` レコード）を実現していたため、既存パターンを踏襲した軽量な自前実装（Build）を選択した。新規npm依存は追加しない。

### 簡素化（Simplification）
- 「Link用」「button用」を1つのポリモーフィックな `<Button as="link"|"button">` コンポーネントに統合する案も検討したが、`useFormStatus` によるpending制御や `min-height` 等のレイアウト差異が呼び出し元ごとに異なり、無理に1コンポーネントへ統合すると分岐が増えて可読性が下がると判断し不採用。代わりに「色・文字サイズ（スタイル）」と「要素種別・状態管理（構造）」を分離し、前者のみを `button-variants.ts` に一般化する設計とした。
- `activity-filter-client.tsx` の `FilterButton` は、色分岐が撤去されると `active: boolean` プロパティがスタイル用途では不要になるため、`variant: "standard" | "outline"` を直接受け取る形に簡素化する（未使用propを残さない）。

### Hover/Focus挙動の決定（Open Questionの解消）
- Research時点でオープンだった「hover時の配色」は、既存の `cancel-button.tsx`／`entry-form.tsx` が既に採用している `hover:opacity-90` パターンを3バリアント共通で採用することで解消した（新しい色トークンを追加せずに済むため）。
- focus-visible時のリング色は `arcana-primary-green` に統一する。

### ボーダー色トークンの決定
- 要件が指定する `arcana-green`（#397754, Tailwind登録済み）を正とし、既存3箇所（`cancel-button.tsx`／`entry-form.tsx`／メール共有ボタン）が使用している `arcana-green-dark`（#067300, Tailwind未登録）から置き換える。理由: 要件文書がユーザーの明示的な指定として#397754を記載しており、`arcana-green` は既にTailwindトークンとして公開済みで新規登録が不要なため。
