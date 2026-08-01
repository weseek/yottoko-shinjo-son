# Requirements Document

## Project Description (Input)
unify-button-style: アプリ全体のボタンスタイルを3種類に統一する。

### 背景
現状、各ページでボタンの配色がバラバラ（共有コンポーネント JoinButton は secondary-500/600 という別系統の緑を使用、他にも arcana-green / arcana-primary-green / spot-action など類似だが異なるトークンが混在）。これを整理し、コンポーネント化とスタイル継承（globals.css / tailwind.config.mjs のトークン + steering への明文化）によって一貫したデザインにする。目指す状態はFigma通りの正しいスタイル（現状 /entries/[cancelToken]/complete が最も近いが、色は以下が正）。

### 統一する3種類のボタンスタイル
1. 緑・濃いボーダー（プライマリCTA）: 参加してみる、自分にメールで共有、キャンセルする、申し込む
   - 背景: arcana/primary-green (#089400)
   - ボーダー: arcana/green (#397754)
   - 文字: #FFFFFF
2. 緑（ボーダーなし）: AR で撮影する、スポット一覧を見る、体験・手伝いを見てみる 等
   - 背景: arcana/primary-green (#089400)
   - 文字: #FFFFFF
3. 白（アウトライン）: 詳しく見る 等
   - 背景: #FFFFFF
   - ボーダー: arcana/primary-green (#089400)
   - 文字: arcana/primary-green (#089400)

### 対応範囲（ユーザーとの確認済み）

**含める:**
- `src/app/activities/_components/activity-card.tsx`: 「詳しく見る」(③白)、「参加してみる」(①緑・濃いボーダー)
- `src/app/activities/[id]/page.tsx`: 「参加してみる」(①)
- `src/app/entries/[cancelToken]/cancel/cancel-button.tsx`: 「キャンセルする」(①)
- `src/app/entries/[cancelToken]/complete/page.tsx`: 「自分にメールで共有」(①)、「交流詳細に戻る」(③、既存のarcana色オーバーライドあり)
- `src/app/activities/[id]/apply/_components/entry-form.tsx`: 「申し込む」(①)
- `src/app/camera/_components/HomeArExperience.tsx`: 「スポット一覧を見る」×2(②)、「AR で撮影する」(②)、「今すぐひめっこと撮影する」(③)
- `src/app/spots/(chrome)/_components/spot-card.tsx`: 「詳しく見る」(③)
- `src/app/spots/[slug]/camera/_components/ArLanding.tsx`: 「AR で撮影する」(②)
- `src/app/_components/landing/hero-section.tsx`: 「体験・手伝いを見てみる」(②)
- `src/app/_components/landing/feature-activity-section.tsx`: 「体験・手伝いを見てみる」(③、現状arcana-green使用→arcana-primary-greenに修正)
- `src/app/_components/landing/landing-header.tsx`: 「使ってみる」(②、現状arcana-green使用→arcana-primary-greenに修正)
- `src/app/_components/landing/feature-ar-section.tsx`: 「スポット一覧を見る」「ひめっ子と写真を撮ってみる」(②、現状white/outlineから緑に変更)
- `src/app/activities/_components/activity-filter-client.tsx` の `FilterButton`（トグル）: 「すべて」→②緑、「募集中のみ」→③白（現状secondary-400系の別配色）
- `src/app/camera/_components/OperationGuide.tsx`: 「はじめる」(①、ユーザー確認済み。現状インライン`style`のprimary-600色を使用しており、Tailwindクラス+共有定義への置き換えが必要)
- `src/app/camera/_components/CapturedPhotoPreview.tsx`: 「保存」(②、ユーザー確認済み)、「シェア」(②、ユーザー確認済み、Web Share API対応時のみ表示)、「撮り直す」(③、ユーザー確認済み)。3ボタンとも現状インライン`style`（primary-600 / secondary-500 / neutral系グレー）を使用しており、Tailwindクラス+共有定義への置き換えが必要

**対象外（今回は変更しない）:**
- 管理画面 `/admin`、社内devポータル `/dev` 配下の全ボタン — 理由: 内部ツールのため対象外
- カメラ/AR撮影フロー内の残りのピンク系(primary-500/600)ボタン — `HomeArFallbackExperience.tsx`「再試行」「戻る」、`HomeArFallbackScene.tsx` のシャッター等。理由: デザイナー確認待ちのため今回も対象外（`OperationGuide.tsx`「はじめる」と`CapturedPhotoPreview.tsx`「保存」「シェア」「撮り直す」は今回のスコープ拡張で対象に追加された）
- アイコンのみのナビ操作（カルーセル前後矢印、ARモーダル閉じる、AR回転ボタン、シャッターボタンなど）— 理由: 別スタイルのまま維持
- 枠・背景を持たないテキストのみのリンク（「‹ 一覧に戻る」「詳しく見る →」等）— 理由: 今回はボタン（枠・背景を持つもの）のみ統一

### 既知の構造的課題（設計フェーズで解消方針を検討）
- 共有コンポーネント `src/app/_components/join-button.tsx` が `secondary-500`/`secondary-600` トークンを使用しており、統一後の3色（arcana-primary-green / arcana-green）に置き換える必要がある
- `spot-action` (#089400) と `arcana-primary-green` (#089400) は同一色の別トークン。整理を検討
- コンポーネント化の方針（共通Buttonコンポーネント化 or globals.css/steeringへのトークン定義の明文化）を設計フェーズで決定する

### アクセシビリティに関する検討事項
- 指定色（背景#089400 / 白文字、または白背景 / 文字#089400）のコントラスト比は約4.00:1で、CLAUDE.mdが定めるWCAG AA基準（通常文字4.5:1以上）を単体では満たさない。
- ユーザー判断: ボタンラベルの文字サイズを18px・太字に統一することで対応する（WCAGの「大きな文字」緩和基準は太字18.66px以上で3:1、今回のコントラスト比4.00:1はこれを上回るため実用上許容）。
- 注記: 18pxは上記の太字大文字判定基準（18.66px）にわずかに届かないが、ステークホルダーの判断により暫定的に許容し、将来見直しの対象とする。

## Requirements

### Requirement 1: プライマリボタン（緑・濃いボーダー）の視覚統一
**Objective:** As a 訪問者, I want 参加・送信・キャンセルなど主要な意思表示アクションのボタンが緑の濃いボーダー付きで統一されて表示されること, so that 重要な操作を他のボタンと明確に区別しながら安心して選択できる

#### Acceptance Criteria
1. Where a button represents 交流コンテンツ一覧・交流コンテンツ詳細ページの「参加してみる」、申込フォームの「申し込む」、申込完了ページの「自分にメールで共有」、申込キャンセルページの「キャンセルする」、AR撮影ガイド画面の「はじめる」のいずれかである、the button component shall display background color #089400, a 2px border of color #397754, and label text color #FFFFFF.
2. The button component shall render this variant's label text at 18px or larger in bold weight.
3. When the pointer hovers over or the button receives keyboard focus, the button component shall visually indicate the interactive state while keeping the label text contrast at or above the ratio required by Requirement 4.

### Requirement 2: 標準ボタン（緑・ボーダーなし）の視覚統一
**Objective:** As a 訪問者, I want AR撮影やスポット一覧の閲覧など気軽に進められるアクションのボタンが縁取りのないシンプルな緑で表示されること, so that プライマリボタンと区別しつつブランドの緑を一貫して感じられる

#### Acceptance Criteria
1. Where a button represents AR撮影画面の「AR で撮影する」「スポット一覧を見る」、スポット一覧の「AR で撮影する」、トップページの「体験・手伝いを見てみる」「使ってみる」「スポット一覧を見る」「ひめっ子と写真を撮ってみる」、撮影後プレビュー画面の「保存」「シェア」のいずれかである、the button component shall display background color #089400, no contrasting border, and label text color #FFFFFF.
2. The button component shall render this variant's label text at 18px or larger in bold weight.
3. The button component shall present this variant without the dark border used by Requirement 1's variant, so the two remain visually distinguishable.

### Requirement 3: アウトラインボタン（白）の視覚統一
**Objective:** As a 訪問者, I want 「詳しく見る」など補助的な操作のボタンが白背景・緑の縁取りで表示されること, so that プライマリな操作と比べて控えめな選択肢だと直感的にわかる

#### Acceptance Criteria
1. Where a button represents 交流コンテンツ一覧の「詳しく見る」、申込完了ページの「交流詳細に戻る」、スポット一覧の「詳しく見る」、AR撮影画面の「今すぐひめっこと撮影する」、トップページの「体験・手伝いを見てみる」（feature-activity-section）、撮影後プレビュー画面の「撮り直す」のいずれかである、the button component shall display background color #FFFFFF, a 2px border of color #089400, and label text color #089400.
2. The button component shall render this variant's label text at 18px or larger in bold weight.

### Requirement 4: ボタンラベルのアクセシビリティ（コントラスト・文字サイズ）
**Objective:** As a 高齢者を含む訪問者, I want ボタンの文字が十分な大きさとコントラストで表示されること, so that 視力に配慮が必要な利用者でも操作対象を認識できる

#### Acceptance Criteria
1. The button component shall render the label text of Requirement 1, 2, and 3's variants at 18px or larger in bold weight.
2. While a button's label text is rendered at 18px or larger in bold weight, the button component shall maintain a contrast ratio of at least 3:1 between the label text color and the button's background color.
3. If a button's label text is rendered smaller than 18px in bold weight, then the button component shall maintain a contrast ratio of at least 4.5:1 between the label text color and the button's background color.

### Requirement 5: 交流コンテンツ一覧の絞り込みボタンの配色統一
**Objective:** As a 訪問者, I want 交流コンテンツ一覧の絞り込みボタン（すべて／募集中のみ）が他のボタンと同じ配色ルールで表示されること, so that 一覧ページのUIも他の画面と一貫した印象になる

#### Acceptance Criteria
1. Where a button represents 交流コンテンツ一覧の絞り込みの「すべて」である、the button component shall display it using Requirement 2's variant styling (background #089400, no contrasting border, label text #FFFFFF).
2. Where a button represents 交流コンテンツ一覧の絞り込みの「募集中のみ」である、the button component shall display it using Requirement 3's variant styling (background #FFFFFF, 2px border #089400, label text #089400).

### Requirement 6: 対象外要素の非破壊
**Objective:** As a 開発者・運用者, I want 今回対象外とした画面・要素の見た目が本フィーチャーの実装によって変化しないこと, so that 未確定のAR/カメラ配色や管理画面など他の意思決定・作業に影響を与えない

#### Acceptance Criteria
1. The system shall not change the visual style of buttons within the 管理画面（/admin） and 社内devポータル（/dev） as part of this feature.
2. The system shall not change the visual style of the AR撮影フロー内の残りのピンク系ボタン（再試行、戻る、シャッター等） as part of this feature.
3. The system shall not change the visual style of icon-only navigation controls（カルーセル前後矢印、ARモーダルの閉じる・回転・シャッター操作） as part of this feature.
4. The system shall not change the visual style of unboxed text-only links（例:「‹ 一覧に戻る」「詳しく見る →」） as part of this feature.

## Boundary Context
- **In scope**: Requirement 1〜5に列挙した画面・ボタンの配色統一（背景・ボーダー・文字色・文字サイズ）。AR撮影ガイドの「はじめる」、撮影後プレビューの「保存」「シェア」「撮り直す」を含む（ユーザーが追加確認済み）。
- **Out of scope**: 管理画面／devポータル、AR撮影フロー内の残りのピンク系ボタン（`HomeArFallbackExperience.tsx`「再試行」「戻る」、`HomeArFallbackScene.tsx`のシャッター等、デザイナー確認待ち）、アイコンのみのナビ操作、枠を持たないテキストリンク
- **Adjacent expectations**: 絞り込みトグルの「現在選択中の状態」を色以外の手段（下線・アイコン等）で示すかどうかは本要件では規定せず、必要であれば別途検討する。既存の共有ボタン部品が別カラートークンを使用している場合の置き換え方法は設計フェーズで決定する。「はじめる」「保存」「シェア」「撮り直す」は現状インライン`style`で実装されており、Tailwindクラス（`buttonClassName`経由）への置き換えを伴う。
