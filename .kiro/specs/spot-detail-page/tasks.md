# Implementation Tasks — spot-detail-page

- [x] 1. Spotスキーマを拡張してDBと型を更新する
  - `prisma/schema.prisma` の Spot モデルの `description` フィールド直後に `address String` を追加する
  - `address String` の直後に `qrCodeLocation String` を追加する
  - `prisma db push` を実行してDBスキーマを更新する（既存データがある場合は事前に `SELECT COUNT(*) FROM spots;` で件数を確認すること）
  - `pnpm prisma generate` を実行して TypeScript 型を再生成する
  - ✅ `pnpm tsc --noEmit` がエラーなく通過し、`spot.address` と `spot.qrCodeLocation` が型として認識される
  - _Requirements: 1.1, 1.2, 2.3, 2.4_

- [x] 2. 管理画面の Spot フォームに住所と QRコードの場所フィールドを追加する (P)
  - `src/app/admin/options.tsx` の Spot `aliases` に `address: "住所"` と `qrCodeLocation: "QRコードの場所"` を追加する
  - Spot の `edit.display` の `"description"` 直後に `"address"` と `"qrCodeLocation"` を挿入する
  - `edit.fields` に `address: { required: true, helperText: "スポットの住所（例: 岡山県真庭郡新庄村2190-1）" }` を追加する
  - `edit.fields` に `qrCodeLocation: { required: true, input: <TextareaInput />, helperText: "QRコードが貼ってある場所の説明" }` を追加する
  - ✅ 管理画面のスポット編集フォームに「住所」「QRコードの場所」入力欄が表示され、空のまま保存するとバリデーションエラーが出る
  - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - _Boundary: AdminOptions_
  - _Depends: 1_

- [x] 3. スポット詳細ページをグリーン系カードUIにリデザインする (P)
  - _Boundary: SpotDetailPage_
  - _Depends: 1_

  - [x] 3.1. パンくず・カードラッパー・バッジ・タイトル・住所ブロックを実装する
    - 既存のパンくずナビゲーション（`← スポット一覧に戻る`）を `<nav aria-label="パンくず">` で `<article>` 先頭に維持する
    - `<article>` 内にカードラッパー（`relative`）を設け、上部中央に「スポット」バッジ（`bg-[var(--color-secondary-400)]` の緑ピル、ピンアイコン `aria-hidden="true"` + "スポット" テキスト）を絶対配置する
    - カード本体（`rounded-3xl bg-white shadow-yellow`・枠線なし）内の上部領域（`px-6 pt-10 text-center`）に `<h1>` スポット名（`text-[var(--color-secondary-500)]`）を配置する
    - `<h1>` 直下に地図アイコン（`aria-hidden="true"`）+ `spot.address`（`text-arcana-orange-secondary`）を配置する
    - ✅ ページを開くとカード・バッジ・スポット名（`<h1>`）・住所（arcana-orange-secondary）が期待通りに描画される
    - _Requirements: 3.1, 3.2, 3.3, 3.8, 3.9_

  - [x] 3.2. メイン画像・説明・QRコードの場所セクションを実装する
    - `imageUrl` がある場合は `<img>` を `px-4 mt-5 rounded-2xl object-cover` で表示し、ない場合は `aspect-video` のアイコンプレースホルダー（`aria-hidden="true"`）を表示する
    - 「スポットの説明」`<section aria-labelledby="spot-desc-heading">` を実装する：ピンアイコン（`aria-hidden`）+ `<h2 id="spot-desc-heading">`（`text-[var(--color-secondary-500)]`）+ `spot.description`（`whitespace-pre-wrap leading-[1.8] text-[var(--color-neutral-600)]`）
    - 「QRコードの場所」`<section aria-labelledby="spot-qr-heading">` を実装する：カメラアイコン（`aria-hidden`）+ `<h2 id="spot-qr-heading">`（`text-[var(--color-secondary-500)]`）+ `spot.qrCodeLocation`（`whitespace-pre-wrap leading-[1.8] text-[var(--color-neutral-600)]`）
    - ✅ 画像（またはプレースホルダー）と2つのセクション見出し・本文が正しく描画され、`imageUrl=null` でもレイアウト崩れがない
    - _Requirements: 1.3, 1.4, 1.5, 3.4, 3.5, 3.6, 3.10_

  - ~~[x] 3.3. アクションボタン2つを実装する~~ **削除済み**
    - `spots/[slug]/camera` は現地QRコード経由でのみアクセスする限定ページのため、`spots/[slug]` からの遷移ボタン（「ヒメッコと記念撮影」「体験をさがす」）を削除
    - _Requirements: 3.7（削除）_

  - [x] 3.4. 本文テキスト色を `arcana/body-blue` に統一する
    - 「スポットの説明」「QRコードの場所」の本文を `text-[var(--color-neutral-600)]` から `text-body-blue` に変更する
    - _Requirements: 3.10_
