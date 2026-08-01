# Requirements Document

## Project Description (Input)
使用ウェイト(読込ウェイト)を medium(500) と bold(700) の2種のみに統一する。medium(500)を本文の既定、bold(700)を強調とする。regular(400)とsemibold/extrabold/black(600/800/900)は廃止。weightユーティリティを基本的にはfont-boldのみにする。

目的: デザインの統一(Figmaとの整合性)、パフォーマンスアップ、メンテコストの削減

現状:
- 読込ウェイト：["400","500","700"]（layout.tsx:8）
- body に font-weight 指定なし＝既定 400（globals.css の body）
- クラス使用数：font-medium(500)=49 / font-bold(700)=108 / font-semibold(600)=8 / font-extrabold(800)=5 / font-black(900)=2 / font-normal(400)=0
- インライン fontWeight：700＝camera系 多数、600＝admin/emails 2件
- 600/800/900 は読み込んでおらず、現在 faux 描画（合成）になっている

作業手順（必須）:
1. 本文既定を medium にする
   - globals.css の body に font-weight: 500; を追加（現状は既定400）
   - 注意: これまで無指定(400)だった全テキストが500になり、アプリ全体がやや太くなる。これは意図した変更。
   - layout.tsx:8 weight: ["400","500","700"] → ["500","700"]（font-normalは0件のため400削除可）
2. 未読込ウェイトを bold(700) に正規化（現状 faux 描画の是正）
   - クラス：font-semibold(8)・font-extrabold(5)・font-black(2) → すべて font-bold
   - fontWeight: 700（camera系） => font-bold

スコープ外:
- admin はそのままでよい
- 利用規約・プライバシーポリシーはフォント自体を変えない(可読性を重視)
- メールテンプレート（src/lib/email/templates/**）はそのままでよい（メールクライアントはWebフォントを読み込まずシステムフォントで表示するため、faux描画の課題が発生しないため対象外）

クリーンアップ:
- font-base font-medium クラスを削除する(以下に例外あり)
- 注意: 冗長排除で削除する場合は、font-bold の祖先内にある font-* を消すとboldを継承して太くなるため、削除は必ず祖先のweightを確認すること

## Boundary Context (Optional)
- **In scope**:
  - `src/app/layout.tsx` の Zen Maru Gothic 読込ウェイト設定
  - `src/app/globals.css` の `body` セレクタへの既定ウェイト追加
  - アプリ全体（admin・利用規約・プライバシーポリシー・メールテンプレートを除く）の `font-semibold` / `font-extrabold` / `font-black` クラスの `font-bold` への置き換え
  - camera 機能配下のインライン `fontWeight: 700` スタイルの `font-bold` クラスへの置き換え
  - `/dev` ページ（開発者向け内部ページ）内の `font-semibold`（1箇所）も対象に含める（ユーザー確認済み）
  - 新しい既定ウェイト(500)と重複する `font-medium` クラスのクリーンアップ（祖先が `font-bold` の場合は意図せぬ継承を避けるため保持）
- **Out of scope**:
  - `src/app/admin/**`（next-admin 含む）配下の font-weight 関連スタイル
  - `src/app/terms/page.tsx`（利用規約）・`src/app/privacy/page.tsx`（プライバシーポリシー）の font-weight 関連スタイル
  - `src/lib/email/templates/**`（実際にユーザーへ送信されるメールHTML）のインライン `fontWeight` スタイル（ユーザー確認済み、対象外）
  - レイアウト・配色・余白など、フォントウェイト以外のスタイル変更
- **Adjacent expectations**:
  - `admin/emails/page.tsx`（メールプレビュー、admin スコープのため対象外）と実際のメールテンプレート（同じく対象外）は、今回の変更後も現状の見た目のまま一致し続ける
  - `.kiro/steering/design-system.md` の「フォント」節は、本 spec 実装後にウェイト方針（medium/bold の2種、font-weight ユーティリティの使い分け）を反映する形で更新される想定

## Requirements

### Requirement 1: 読込フォントウェイトの削減
**Objective:** As a 開発者, I want Zen Maru Gothic の読込ウェイトを medium(500) と bold(700) の2種のみに限定する, so that フォントファイルの読み込み数が減りパフォーマンスが向上し、Figmaデザインとウェイトが一致する

#### Acceptance Criteria
1. The System shall load the Zen Maru Gothic font family with exactly the weights 500 and 700, and no other weight.
2. Where a page is outside the out-of-scope areas (admin, 利用規約, プライバシーポリシー, メールテンプレート), the System shall render default body text at font-weight 500 when no explicit font-weight utility class is applied.
3. When this requirement is implemented, the System shall no longer load font-weight 400 for Zen Maru Gothic.

### Requirement 2: 未読込ウェイト(faux描画)の是正
**Objective:** As a ユーザー, I want 以前は読み込まれていないウェイト(600/800/900)で表示されていたテキストが実際に読み込まれた太字(700)で描画される, so that ブラウザによる合成(フェイクボールド)ではなく本来の書体データで文字が表示される

#### Acceptance Criteria
1. Where a component outside the out-of-scope areas currently uses the `font-semibold` utility class, the System shall render that text using the `font-bold` utility class instead.
2. Where a component outside the out-of-scope areas currently uses the `font-extrabold` utility class, the System shall render that text using the `font-bold` utility class instead.
3. Where a component outside the out-of-scope areas currently uses the `font-black` utility class, the System shall render that text using the `font-bold` utility class instead.
4. Where a component within the camera feature currently specifies an inline `fontWeight: 700` style, the System shall render that text using the `font-bold` utility class instead of an inline style.
5. The System shall not introduce any new usage of font-weight values other than 500 and 700 (as Tailwind utility classes or inline styles) outside the out-of-scope areas.

### Requirement 3: 冗長な font-weight クラスのクリーンアップ
**Objective:** As a 開発者, I want 新しい既定ウェイト(500)と重複する `font-medium` クラスを整理する, so that マークアップが簡潔になりメンテナンスコストが下がる

#### Acceptance Criteria
1. Where a `font-medium` class is applied to an element whose nearest explicitly-weighted ancestor is not `font-bold` (or no ancestor sets an explicit weight), the System's markup shall have that redundant `font-medium` class removed, relying on the inherited default weight of 500.
2. If a `font-medium` class is applied to an element that is a descendant of an element carrying `font-bold` (directly or via inheritance), then the System shall retain the `font-medium` class (or an equivalent explicit weight override) on that element so that it does not unintentionally inherit the bold weight.
3. When the cleanup in this requirement is complete, the System shall produce no visual change in rendered font weight compared to before the cleanup (the cleanup is a markup simplification only, not a visual change).

### Requirement 4: 対象外範囲の非破壊
**Objective:** As a ステークホルダー, I want admin・利用規約・プライバシーポリシー・メールテンプレートのコード(クラス・スタイル)に手を加えない, so that 今回のフォントウェイト統一作業が対象外領域のメンテナンス範囲に影響を与えない

#### Acceptance Criteria
1. The System shall not modify any font-weight related class or style within `src/app/admin/**` (including next-admin configuration).
2. The System shall not modify any font-weight related class or style within `src/app/terms/page.tsx` or `src/app/privacy/page.tsx`.
3. The System shall not modify any font-weight related inline style within `src/lib/email/templates/**`.
4. Note: `src/app/admin/**` is nested under the single shared root `<body>` defined in `src/app/layout.tsx` and has no independent root layout/body of its own. Therefore, unweighted admin text that previously rendered at the browser default (400) will inherit the new default (500) once `body { font-weight: 500; }` is added by Requirement 1 — this is an accepted, intended side effect of Requirement 1 and not a violation of this requirement. Only explicit edits to admin/terms/privacy/email-template files or classes are prohibited; no admin-specific compensating change (e.g., re-introducing weight-400 loading for admin) is required.
