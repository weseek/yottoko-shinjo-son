# Implementation Plan

- [ ] 1. Foundation: 開発ポータルを `/dev` に移管し、ランディングページの基本構造を用意する
- [x] 1.1 現行開発ポータルを `src/app/dev/page.tsx` に移動する
  - `src/app/dev/` ディレクトリを作成する
  - 現行 `src/app/page.tsx` のコード全体を `src/app/dev/page.tsx` にコピーする
  - `dev/page.tsx` から `env.APP_ENV === "production"` による `/activities` リダイレクト処理を削除する
  - `/dev` にアクセスすると開発ポータル（体験フロー・ページ一覧）が表示され、本番環境でもリダイレクトされないことを確認する
  - _Requirements: 1.3_

- [x] 1.2 新しい `src/app/page.tsx` のスケルトンを作成する
  - 現行 `src/app/page.tsx` の内容をすべて削除し、空の Server Component として作成する
  - `<main>` ラッパーと `overflow-x-hidden` を設定する
  - `/` にアクセスすると空のページが返り、いかなる環境でもリダイレクトが発生しないことを確認する
  - _Requirements: 1.1, 1.2_

- [ ] 2. Core: ヒーローセクションを実装する
- [x] 2.1 HeroSection コンポーネントをレスポンシブで実装する
  - `src/app/_components/landing/hero-section.tsx` を新規作成する
  - 「岡山県 真庭郡 新庄村」テキストとキャッチコピー「よっとこ！村の暮らしへ。」（h1）を含める
  - サービス説明文・プライマリ CTA ボタン（`/activities` へ）・セカンダリリンク（`/spots` へ）を実装する
  - `next/image` で `hyottoko.png`, `hyottoko_2.png` を配置し、スマホモックアップ画像エリアを用意する（画像未用意の場合は背景色プレースホルダー div で代替）
  - PC（`lg:` 以上）: テキスト左・ビジュアル右の2カラム Grid レイアウト
  - スマホ（`lg:` 未満）: ビジュアルを上、テキストを下に並べる（flex-col-reverse）
  - 背景色に `--color-secondary-50` を使用する
  - ヒーローセクションがブラウザで表示され、PC/スマホで正しいレイアウトになることを確認する
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 8.1, 8.2, 8.3, 9.2, 9.3, 9.4, 9.5_

- [ ] 3. Core: ABOUT・機能・背景・フッターセクションを実装する
- [x] 3.1 (P) AboutSection コンポーネントを実装する
  - `src/app/_components/landing/about-section.tsx` を新規作成する
  - 「ABOUT」ラベル・「よっとこ！新庄村 とは？」（h2）見出し・サービス概要説明文を実装する
  - 「登録不要。スマートフォンのブラウザからすぐ使えます。」バナーを強調スタイル（`--color-warning-bg` / `--color-warning` 相当）で実装する
  - PC（`lg:` 以上）: 見出し左・説明文右の2カラムレイアウト
  - 白背景（`--color-neutral-0`）を設定する
  - ABOUT セクションがブラウザで表示され、登録不要バナーが強調されていることを確認する
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.1, 8.2, 8.3, 9.2, 9.5_
  - _Boundary: AboutSection_

- [x] 3.2 (P) FeatureActivitySection コンポーネントを実装する
  - `src/app/_components/landing/feature-activity-section.tsx` を新規作成する
  - 「機能 その１」ラベル・「体験・手伝いに参加する」（h2）見出し・説明文・「参加者にはちょっとした記念品を贈呈🎁」注記を実装する
  - `href="/activities"` へ遷移する CTA ボタン「体験・手伝いを見てみる」を実装する
  - 右エリア（PC）または下エリア（スマホ）にカードモックアップ画像エリアを用意する（画像未用意の場合は `--color-secondary-50` 背景のプレースホルダー）
  - PC（`lg:` 以上）: テキスト左・カードビジュアル右の2カラムレイアウト
  - 機能その1セクションがブラウザで表示され、CTA リンクが正しく `/activities` を指していることを確認する
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 8.1, 8.2, 8.3, 9.2, 9.4, 9.5_
  - _Boundary: FeatureActivitySection_

- [x] 3.3 (P) FeatureArSection コンポーネントを実装する
  - `src/app/_components/landing/feature-ar-section.tsx` を新規作成する
  - 「ひめっ子が出現」ラベル・「機能 その２」サブラベル・「AR フォトを撮る」（h2）見出し・説明文を実装する
  - `href="/spots"` へ遷移する CTA ボタン「スポット一覧を見る」と `href="/camera"` へ遷移するボタン「ひめっ子と写真を撮ってみる」を実装する
  - AR モックアップ画像エリアを用意する（画像未用意の場合はプレースホルダー div で代替）
  - PC（`lg:` 以上）: モックアップ左・テキスト右の2カラム（機能1と左右反転）
  - 左エリア背景に淡いピーチ色（`#fff3ec`）を設定する
  - 機能その2セクションがブラウザで表示され、`/spots` と `/camera` への CTA が確認できることを確認する
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 8.1, 8.2, 8.3, 9.2, 9.4, 9.5_
  - _Boundary: FeatureArSection_

- [x] 3.4 (P) BackgroundSection コンポーネントを実装する
  - `src/app/_components/landing/background-section.tsx` を新規作成する
  - 「BACKGROUND」ラベル・「このサービスについて」（h2）見出し・背景説明テキストを実装する
  - チーム写真エリアを用意する（`team-photo.jpg` 未用意の場合は `--color-secondary-400` 背景のプレースホルダー div で代替）
  - 背景色に `--color-secondary-500`（ダークグリーン）・テキスト色に `--color-neutral-0`（白）を設定する
  - PC（`lg:` 以上）: テキスト左・チーム写真右の2カラムレイアウト
  - BACKGROUND セクションがダークグリーン背景で表示されることを確認する
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 8.1, 8.2, 8.3, 9.2, 9.3, 9.5_
  - _Boundary: BackgroundSection_

- [x] 3.5 (P) LandingFooter コンポーネントを実装する
  - `src/app/_components/landing/landing-footer.tsx` を新規作成する
  - `next/image` で `logo.png` を表示する（alt テキスト「よっとこ！新庄村」）
  - 「提供：岡山県真庭郡新庄村 × 株式会社WESEEK」テキストを表示する
  - 「お問い合わせ: contact@example.com」を `<a href="mailto:contact@example.com">` リンクとして実装する
  - 背景色に `--color-secondary-500`（BACKGROUND セクションと同色）を設定する
  - フッターがダークグリーン背景でロゴ・連絡先とともに表示されることを確認する
  - _Requirements: 7.1, 7.2, 7.3, 9.3, 9.4_
  - _Boundary: LandingFooter_

- [ ] 4. Integration: 画像アセット配置と全セクションの統合
- [x] 4.1 必要な画像アセットをプレースホルダーとして配置する
  - `public/assets/phone-mockup.png` — スマホモックアップ画像（未用意の場合は 1×1 px 透明 PNG またはプレースホルダー SVG を配置）
  - `public/assets/feature-activity-mockup.png` — アクティビティカードのモックアップ画像（同上）
  - `public/assets/team-photo.jpg` — チーム写真（同上）
  - `next/image` が画像を正常に参照できるファイルが `public/assets/` に存在することを確認する
  - _Requirements: 2.6, 4.4, 5.5, 6.3_

- [x] 4.2 全セクションコンポーネントをページ Root に統合する
  - `src/app/page.tsx` に HeroSection・AboutSection・FeatureActivitySection・FeatureArSection・BackgroundSection・LandingFooter を順番にインポートして配置する
  - ページ全体の `<main>` タグに `overflow-x-hidden` を設定し横スクロールを防止する
  - `/` にアクセスすると6セクション + フッターが順番に表示される完成したランディングページになることを確認する
  - _Requirements: 1.1, 1.2, 8.4_
  - _Depends: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Validation: アクセシビリティとレスポンシブの検証
- [x] 5.1 アクセシビリティ要件を検証する
  - ページ全体で `h1` が HeroSection の1箇所のみ（「よっとこ！村の暮らしへ。」）であることを確認する
  - 各セクション見出しが `h2` で適切にマークアップされていることを確認する
  - 全画像（ロゴ・キャラクター・モックアップ・チーム写真）に意味のある `alt` テキストが設定されていることを確認する
  - CTA ボタン・メールリンクが `Tab` キーで順番にフォーカスできることを確認する
  - テキスト色とコントラスト比：白背景上のテキストが `--color-neutral-700` 以上、ダークグリーン背景上のテキストが `--color-neutral-0`（白）であることを確認する
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 5.2 PC/スマホレイアウトを確認する
  - スマートフォン幅（375px）でブラウザを開いたとき横スクロールが発生しないことを確認する
  - PC 幅（1440px）で全セクションが2カラムレイアウトで表示されることを確認する
  - タブレット幅（768px）でレイアウト崩れがないことを確認する
  - _Requirements: 8.1, 8.2, 8.3, 8.4_
