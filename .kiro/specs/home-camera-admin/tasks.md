# Implementation Plan

- [x] 1. HomeCameraConfig モデルを Prisma スキーマに定義し DB に反映する
  - `id`, `label?`, `scale?`, `arAssetUrl?`, `mindFileUrl?`, `markerImageUrl?`, `createdAt`, `updatedAt` を設計書のフィールド定義に従って追加する（全 AR フィールドは Nullable）
  - `@@map("home_camera_configs")` を付与する
  - `pnpm prisma db push` を実行してエラーなく完了すること
  - PostgreSQL に `home_camera_configs` テーブルが作成され、Prisma Client が `prisma.homeCameraConfig` でアクセスできること
  - _Requirements: 1.3, 1.4, 1.5, 2.1, 3.1, 3.2_

- [x] 2. 管理画面への HomeCameraConfig エントリ追加
- [x] 2.1 options.tsx にサイドバー登録とフィールド定義を追加する
  - sidebar.groups の「コンテンツ管理」配列に `"HomeCameraConfig"` を追加する
  - `model.HomeCameraConfig` に `toString`（固定文字列 "自宅でひめっこ撮影設定"）・`title`・`icon`・`aliases`（日本語ラベル）を Spot と同一パターンで設定する
  - `edit.display` でセクション構成（基本情報: label / scale、ARモデル: arAssetUrl、ARマーカー .mind: mindFileUrl、ARマーカー 元画像: markerImageUrl）を定義する
  - `edit.fields` に `mindFileUrl`（MindFileUploadInput）・`markerImageUrl`（ImageUploadInput）・`arAssetUrl`（テキスト、helperText付き）の設定を追加する
  - admin サイドバーの「コンテンツ管理」に「自宅でひめっこ撮影」が表示され、編集画面の全フィールドが正しく描画されること
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 2.1, 3.1, 3.2, 4.1, 4.2_

- [x] 2.2 options.tsx に beforeDb フック（1件制限・スケール検証・空文字正規化）を追加する
  - `mode === "create"` 時に `prisma.homeCameraConfig.findFirst()` で既存レコードを確認し、存在する場合は `HookError(400)` でエラーメッセージを返す
  - `scale` が 0 以下または 10 超の場合は `HookError(400)` でエラーメッセージを返す
  - 文字列フィールド（`arAssetUrl` / `mindFileUrl` / `markerImageUrl` / `label`）の空文字 `""` を `null` に正規化して返す
  - 1件作成後に2件目の作成を試みると next-admin のフォームに「すでに登録されています」エラーが表示されること
  - _Requirements: 1.3_

- [x] 3. (P) 自宅撮影ページをDB参照＋フォールバックに切り替える
  - `CameraPage` 関数を `async` に変更し、`prisma.homeCameraConfig.findFirst({ orderBy: { updatedAt: "desc" } })` でレコードを取得する
  - 文字列フィールドは `||`、`scale` は `??` でデフォルト定数にフォールバックして `ModelConfig` / `TargetConfig` / `markerImageUrl` を構築する
  - `HomeArExperience` へ渡す props の形式を変更しない
  - DB に `HomeCameraConfig` レコードがない場合はデフォルト値（`/assets/himekko.glb`、`demo.mind`）、レコードがある場合は DB 値が `HomeArExperience` に渡されること
  - _Requirements: 2.2, 3.3, 5.1, 5.2, 5.3, 5.4_
  - _Boundary: camera/page.tsx（Visitor Page Layer）_
  - _Depends: 1_

- [ ] 4. admin 操作から /camera への設定反映を手動で検証しビルドを確認する
  - `HomeCameraConfig` レコードなし → `/camera` がデフォルト値で正常表示されること（要件5.3）
  - admin で全フィールドを設定・保存 → `/camera` でページリロード後に DB 値が使用されること（要件5.1, 5.2）
  - 一部フィールドが null の設定で、フィールドごとに個別フォールバックが適用されること（要件2.2, 3.3）
  - admin で空文字 `""` を入力して保存した場合に `null` として正規化されフォールバックが適用されること
  - `pnpm build` が TypeScript エラーなく完了すること
  - _Requirements: 1.1, 1.3, 2.2, 3.3, 5.1, 5.2, 5.3, 5.4_
