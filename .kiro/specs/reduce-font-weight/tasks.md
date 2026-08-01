# Implementation Plan

- [ ] 1. Foundation: 読込フォントウェイトと本文既定ウェイトの設定変更
- [x] 1.1 Zen Maru Gothic の読込ウェイトを500/700に限定し、本文既定ウェイトを500にする
  - `src/app/layout.tsx` の `Zen_Maru_Gothic({ weight: [...] })` を `["400","500","700"]` から `["500","700"]` に変更する
  - `src/app/globals.css` の `body` セレクタに `font-weight: 500;` を追加する
  - 観測可能な完了条件: 開発サーバーでウェイトクラス未指定のテキストが computed font-weight 500 で描画され、ネットワークタブで weight 400 のフォントファイルがリクエストされないことを確認できる
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Core: 未読込ウェイトの font-bold への正規化と冗長な font-medium のクリーンアップ（ディレクトリ単位）
- [x] 2.1 (P) entries配下: font-semibold の正規化と font-medium の整理
  - `entries/[cancelToken]/cancel/page.tsx:35` の `font-semibold` を `font-bold` に置換し、同ファイル43行目の `font-medium` は祖先ウェイトを確認のうえ冗長なら削除する（同一ファイルのため1タスクで原子的に実施）
  - `entries/[cancelToken]/cancel/complete/page.tsx:80`、`entries/[cancelToken]/complete/page.tsx:193` の `font-medium` を祖先ウェイト確認のうえ整理する
  - 観測可能な完了条件: `entries/**` 配下で `font-semibold` の grep 結果が0件になり、変更前後で該当画面の見た目（本文既定500化分を除く）が変化しないことを目視確認できる
  - _Requirements: 2.1, 3.1, 3.2, 3.3_
  - _Boundary: entries_

- [x] 2.2 (P) activities配下: font-semibold・font-extrabold の正規化と font-medium の整理
  - `activities/[id]/apply/page.tsx:56` の `font-semibold` を `font-bold` に置換し、同ファイル66/88/124行目の `font-medium` を祖先ウェイト確認のうえ整理する（同一ファイルのため原子的に実施）
  - `activities/[id]/apply/_components/entry-form.tsx:40,79` の `font-semibold` を `font-bold` に置換する
  - `activities/_components/how-to-participate.tsx:15` の `font-extrabold` を `font-bold` に置換し、同ファイル27行目の `font-medium` を祖先ウェイト確認のうえ整理する（同一ファイルのため原子的に実施）
  - `activities/_components/activity-card.tsx:67`、`activity-image-carousel.tsx:61`、`activities/[id]/page.tsx:52,72` の `font-medium` を祖先ウェイト確認のうえ整理する
  - 観測可能な完了条件: `activities/**` 配下で `font-semibold`・`font-extrabold` の grep 結果が0件になる
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_
  - _Boundary: activities_

- [x] 2.3 (P) dev/page.tsx: font-semibold の正規化と font-medium の整理
  - `dev/page.tsx:43,330,352` の `font-semibold` を `font-bold` に置換し、同ファイル374行目の `font-medium` を祖先ウェイト確認のうえ整理する（同一ファイルのため原子的に実施）
  - 観測可能な完了条件: `dev/page.tsx` で `font-semibold` の grep 結果が0件になる
  - _Requirements: 2.1, 3.1, 3.2, 3.3_
  - _Boundary: dev_

- [x] 2.4 (P) spots配下: font-extrabold・font-black の正規化と font-medium の整理
  - `spots/(chrome)/page.tsx:75` の `font-extrabold` を `font-bold` に置換し、同ファイル36/66/83/102行目の `font-medium` を祖先ウェイト確認のうえ整理する（同一ファイルのため原子的に実施）
  - `spots/[slug]/camera/_components/ArLanding.tsx:71,72` の `font-black` を `font-bold` に置換し、同ファイル61/117/153行目の `font-medium` を祖先ウェイト確認のうえ整理する（同一ファイルのため原子的に実施）
  - `spots/(chrome)/_components/spot-card.tsx:41`、`spots/(chrome)/[slug]/page.tsx:30,54,89,103` の `font-medium` を祖先ウェイト確認のうえ整理する
  - 観測可能な完了条件: `spots/**` 配下で `font-extrabold`・`font-black` の grep 結果が0件になる
  - _Requirements: 2.2, 2.3, 3.1, 3.2, 3.3_
  - _Boundary: spots_

- [x] 2.5 (P) camera/_components配下: font-extrabold の正規化と font-medium の整理
  - `camera/_components/HomeArExperience.tsx:182,240,298` の `font-extrabold` を `font-bold` に置換し、同ファイル104/133/200/254行目の `font-medium` を祖先ウェイト確認のうえ整理する（同一ファイルのため原子的に実施）
  - `camera/_components/FloorRecognitionToggle.tsx:63` の `font-medium` を祖先ウェイト確認のうえ整理する
  - 観測可能な完了条件: `camera/_components/HomeArExperience.tsx` で `font-extrabold` の grep 結果が0件になる
  - _Requirements: 2.2, 3.1, 3.2, 3.3_
  - _Boundary: camera(_components) — HomeArExperience/FloorRecognitionToggle_

- [x] 2.6 (P) camera/_components配下: インライン fontWeight のクラス移行
  - `camera/_components/HomeArFallbackExperience.tsx`（4箇所）、`OperationGuide.tsx`（2箇所）、`CapturedPhotoPreview.tsx`（3箇所）の `style={{ fontWeight: 700, ... }}` から `fontWeight` プロパティを削除し、`font-bold` クラスを付与する
  - 観測可能な完了条件: 上記3ファイルで `fontWeight` を含むインラインstyleのgrep結果が0件になり、太字表示が保たれていることを目視確認できる
  - _Requirements: 2.4, 3.1, 3.2, 3.3_
  - _Boundary: camera(_components) — HomeArFallbackExperience/OperationGuide/CapturedPhotoPreview_

- [x] 2.7 (P) _components配下（landing・共通）: font-medium の整理
  - `_components/StepList.tsx:20`、`landing/background-section.tsx:26`、`landing/feature-activity-section.tsx:31`、`landing/hero-section.tsx:19,36`、`landing/feature-ar-section.tsx:65`、`landing/about-section.tsx:31`、`landing/landing-header.tsx:27,33,39` の `font-medium` を祖先ウェイト確認のうえ整理する
  - 観測可能な完了条件: 整理前後でランディングページの見た目（本文既定500化分を除く）が変化しないことを目視確認できる
  - _Requirements: 3.1, 3.2, 3.3_
  - _Boundary: _components (landing/共通)_

- [ ] 3. Integration & Validation
- [x] 3.1 未読込ウェイトの残存チェックと対象外領域の非破壊確認
  - 対象範囲（`admin/**`・`terms/page.tsx`・`privacy/page.tsx`・`lib/email/templates/**` を除く）で `font-semibold`・`font-extrabold`・`font-black`・インライン `fontWeight` を grep し、結果が0件であることを確認する
  - `git diff --stat` を実行し、`src/app/admin/**`・`src/app/terms/page.tsx`・`src/app/privacy/page.tsx`・`src/lib/email/templates/**` に変更行が含まれないことを確認する（admin配下の無指定テキストの見た目変化はRequirement 4で許容済みの副作用であり、ここではファイル差分の不在のみを検証する）
  - `biome ci .` を実行し、クラス名変更に起因する構文・フォーマットエラーがないことを確認する
  - 観測可能な完了条件: 上記3種のチェック（grep・git diff・biome ci）がすべて期待通りの結果（0件／0行／エラーなし）で完了する
  - _Requirements: 2.5, 4.1, 4.2, 4.3, 4.4_
  - _Depends: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 3.2 steering文書へのウェイト方針の反映
  - `.kiro/steering/design-system.md` の「フォント」節に、読込ウェイトをmedium(500)/bold(700)の2種に限定する方針と、`font-bold` を強調に統一する運用ルールを追記する
  - 観測可能な完了条件: `design-system.md`の該当節を読むと、新しいウェイト方針（2種のみ・font-boldを強調に使う）が明記されている
  - _Depends: 1.1_

- [x] 3.3 代表画面での視覚回帰確認
  - トップ/ランディング、activities一覧・詳細・申込、spots一覧・詳細、camera（ホーム・AR起動・撮影プレビュー）、entries（申込完了・キャンセル）を実機（devサーバー+ブラウザ）で確認する（admin配下は見た目変化が許容済みのため確認対象に含めない）
  - 本文既定ウェイト変更（400→500）によりアプリ全体がやや太くなっていることを確認する
  - `font-bold` へ正規化した箇所でフェイクボールドが解消され輪郭が明瞭になっていることを確認する
  - `font-medium` を削除した箇所で削除前後の見た目が変化していないことを確認する
  - 観測可能な完了条件: 代表画面一覧のすべてで意図した見た目変化と非回帰が目視確認できる
  - _Requirements: 1.2, 3.3_
  - _Depends: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 3.4 baseline-ui / アクセシビリティチェック
  - Task 2で変更した全ファイルに対して `/baseline-ui` を実行し、新規の違反がないことを確認する
  - 同ファイル群に対して `/fixing-accessibility` を実行し、新規のアクセシビリティ回帰がないことを確認する
  - 観測可能な完了条件: 両チェックのレポートに、本specの変更に起因する新規違反が0件であることが示される
  - _Requirements: 1.2, 3.3_
  - _Depends: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

## Implementation Notes
- Task 2.5: 初回実装で Req 3.1/3.2 の祖先判定ロジックが逆転していた（「兄弟要素にfont-boldがある＝祖先ではない」を誤って「保持すべき」と判断）。正しくは「font-bold祖先が存在しない場合はfont-mediumを削除」。以降のディレクトリタスク(2.6, 2.7)でも同様の誤りに注意すること。
- Task 3.3: 視覚回帰確認中、spots詳細・entries/cancelページで `.next` の vendor-chunks（zod）欠落によるランタイムエラーに遭遇（フォントウェイト変更とは無関係、長時間稼働していた既存devサーバーのキャッシュ破損）。ユーザー許可のうえ `.next` 削除+devサーバー再起動で解消し、7画面すべてで意図通りの見た目を確認済み。
