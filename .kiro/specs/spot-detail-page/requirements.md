# Requirements Document

## Introduction
スポット詳細ページのリデザインおよびSpotモデルのスキーマ拡張。
確定したデザインに基づき、スポット詳細ページをアクティビティ詳細ページと類似した
カード型レイアウトに更新する。説明フィールドを「スポットの説明」と「QRコードの場所」
の2セクションに分離し、住所フィールドを追加する。

## Boundary Context
- **In scope**: Spotモデルへのフィールド追加、管理画面フォームの更新、スポット詳細ページUI
- **Out of scope**: スポット一覧ページのデザイン変更、AR撮影ページの変更、住所をマップリンクとして使う機能
- **Adjacent expectations**: 既存の`description`フィールドは維持（データ損失なし）。新フィールド`address`・`qrCodeLocation`はどちらも必須フィールド（`String`）として追加する。管理画面UIはPrismaスキーマから自動生成されるため、日本語ラベル・表示順・ヘルパーテキストの設定を`options.tsx`に追加するだけでよい。

## Requirements

### Requirement 1: Spotモデルのスキーマ拡張

**Objective:** 管理者として、スポットに住所とQRコード設置場所を登録できるようにしたい。そうすることで、訪問者が現地でQRコードを見つけやすくなる。

#### Acceptance Criteria
1. The スポット詳細ページ shall スポットの `address` フィールドを参照して住所を表示する
2. The スポット詳細ページ shall スポットの `qrCodeLocation` フィールドを参照してQRコード設置場所の説明を表示する
3. The スポット詳細ページ shall `address` フィールドの値を住所として常に表示する
4. The スポット詳細ページ shall `qrCodeLocation` フィールドの値を「QRコードの場所」セクションとして常に表示する
5. The スポット詳細ページ shall `description` フィールドの値を「スポットの説明」セクションとして常に表示する

### Requirement 2: 管理画面フォームへの新フィールド追加

**Objective:** 管理者として、スポット編集フォームから住所とQRコード設置場所を入力・編集できるようにしたい。

#### Acceptance Criteria
1. When 管理者がスポット編集画面を開いた場合、the 管理画面 shall `address`（住所）の入力フィールドを表示する
2. When 管理者がスポット編集画面を開いた場合、the 管理画面 shall `qrCodeLocation`（QRコードの場所）の入力フィールドを表示する
3. The 管理画面 shall `address` と `qrCodeLocation` をいずれも必須入力として扱う
4. When 管理者がフォームを保存した場合、the 管理画面 shall 入力された `address` と `qrCodeLocation` の値をデータベースに保存する

### Requirement 3: スポット詳細ページのUIリデザイン

**Objective:** 訪問者として、スポットの情報を見やすいカード型レイアウトで確認したい。そうすることで、スポットの説明とQRコードの設置場所を直感的に把握できる。

#### Acceptance Criteria
1. The スポット詳細ページ shall ページ上部に「スポット」カテゴリバッジ（位置情報アイコン付き）を表示する
2. The スポット詳細ページ shall スポット名を大きなタイトルとして表示する
3. The スポット詳細ページ shall 地図アイコンと共にオレンジ色で住所（`address`）を表示する
4. The スポット詳細ページ shall スポットのメイン画像をカード内に表示する
5. The スポット詳細ページ shall 「スポットの説明」見出し（位置情報アイコン付き）と`description`の内容をセクションとして表示する
6. The スポット詳細ページ shall 「QRコードの場所」見出し（カメラアイコン付き）と`qrCodeLocation`の内容をセクションとして表示する
7. ~~The スポット詳細ページ shall 「ヒメッコと記念撮影」ボタンおよび「体験をさがす」ボタンを表示する~~ **削除済み** — `spots/[slug]/camera` は現地QRコード経由でのみアクセスする限定ページのため、`spots/[slug]` からの遷移導線は不要
8. The スポット詳細ページ shall アクティビティ詳細ページと類似した角丸カード・`shadow-yellow` レイアウト（枠線なし）を採用する（グリーン系テーマ）
9. The スポット詳細ページ shall スポット一覧へ戻るパンくずナビゲーションを表示する
10. The スポット詳細ページ shall WCAG AA 基準（コントラスト比 4.5:1 以上、最小フォントサイズ 14px）に準拠する
