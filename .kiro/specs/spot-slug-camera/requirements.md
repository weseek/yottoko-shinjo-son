# 要件定義書 — spot-slug-camera

## Introduction
スポット限定「ひめっこと撮影」ページの実装。訪問者がスポットの QR コードを読んでスポット詳細ページに到達した後、`/spots/[slug]/camera` に遷移することで、そのスポット固有のひめっこと AR 撮影を開始できる体験を提供する。

あわせて、スポットごとに異なるひめっこ説明文を管理者が登録・管理できるよう、データモデルと管理画面を拡張する。

## Boundary Context
- **In scope**: `Spot` モデルへの `himekkoDescription` フィールド追加、admin スポット編集フォームへの登録欄追加、`/spots/[slug]/camera` ランディング画面（AR 開始前）のデザイン実装
- **Out of scope**: AR 撮影ロジック自体の変更、撮影後プレビュー画面の変更、ホームカメラページ（`/camera`）の変更、スポット詳細ページ（`/spots/[slug]`）の変更
- **Adjacent expectations**: スポットの `PUBLISHED` ステータスフィルターはカメラページでも維持されること（未公開スポットはカメラページでも 404）。`arAssetUrl`・`mindFileUrl` 等の既存フィールドはそのまま使用すること。

## Requirements

### Requirement 1: スポット専用ひめっこ説明文フィールドの追加

**Objective:** As a 管理者, I want スポットごとに異なるひめっこの説明文を登録できる, so that 訪問者がカメラページでそのスポット固有の情報を確認できる

#### Acceptance Criteria
1. The スポット管理システム shall `himekkoDescription` フィールドをオプション（任意入力）として Spot データモデルに保持する
2. When 管理者がスポット編集フォームを開く, the 管理画面 shall `himekkoDescription` の入力欄（テキストエリア）を表示する
3. When 管理者が `himekkoDescription` に文字列を入力して保存する, the 管理画面 shall その値をスポットに紐付けて永続化する
4. When 管理者が `himekkoDescription` を空のまま保存する, the 管理画面 shall エラーなく保存を完了する（任意入力のため）
5. The 管理画面 shall `himekkoDescription` の入力欄にヘルパーテキスト「スポット限定ひめっこの説明文（カメラページに表示）」を表示する

### Requirement 2: スポット限定カメラランディングページの表示

**Objective:** As a 訪問者, I want スポット固有のひめっこと撮影情報を確認してから AR を開始できる, so that どのひめっこと撮影するか分かった上で体験を開始できる

#### Acceptance Criteria
1. When 訪問者が `/spots/[slug]/camera` にアクセスする, the カメラページ shall ランディング画面（AR 開始前）を表示する
2. The カメラページ shall ランディング画面の上部に「スポット限定」ラベルと「ひめっこと撮影！」の見出しを表示する
3. The カメラページ shall スポット名を「スポット設置」バッジと共に表示する
4. Where スポットに `arAssetUrl` が設定されている, the カメラページ shall そのひめっこ画像を表示する
5. Where スポットに `himekkoDescription` が設定されている, the カメラページ shall その説明文をランディング画面に表示する
6. Where スポットに `himekkoDescription` が設定されていない, the カメラページ shall 説明文エリアを非表示にする（レイアウト崩れなし）
7. The カメラページ shall 「ARで撮影する」ボタンを表示し、タップすると AR 体験を開始する
8. The カメラページ shall 「※ AR 表示にはカメラへのアクセス許可が必要です」の注意書きを「ARで撮影する」ボタン直下に表示する
9. The カメラページ shall 「撮影についての詳細はこちら」リンクを表示する
10. If 該当 slug のスポットが存在しない、または `PUBLISHED` 状態でない, the カメラページ shall 404 を返す

### Requirement 3: アクセシビリティと UI 基準

**Objective:** As a 訪問者（高齢者含む）, I want カメラページが読みやすく操作しやすい, so that 年齢を問わず快適に利用できる

#### Acceptance Criteria
1. The カメラページ shall ランディング画面のすべてのインタラクティブ要素に最小タップ領域 48px × 48px を確保する
2. The カメラページ shall テキスト要素のフォントサイズを最小 14px、行間を 1.5 以上とする
3. The カメラページ shall テキストと背景のコントラスト比を 4.5:1 以上とする（WCAG AA 準拠）
4. The カメラページ shall 画像要素に適切な `alt` テキストを付与する
