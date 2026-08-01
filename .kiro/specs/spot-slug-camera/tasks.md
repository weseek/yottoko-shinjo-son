# タスク一覧 — spot-slug-camera

## Task 1: Prisma スキーマ拡張とマイグレーション

- `Spot` モデルに `himekkoDescription String?` を追加
- `npx prisma migrate dev --name add-himekko-description` でマイグレーション実行
- Prisma Client を再生成

## Task 2: 管理画面フォーム拡張

- `src/app/admin/options.tsx` の Spot.aliases に `himekkoDescription` エイリアスを追加
- Spot.edit.display に「スポット限定ひめっこ説明文」セクションと `himekkoDescription` フィールドを追加（ARマーカーセクションの下）
- Spot.edit.fields に `himekkoDescription` の設定（TextareaInput、helperText）を追加

## Task 3: ArLanding コンポーネントのリニューアル

- 既存の簡易ランディング UI を新デザインに全面差し替え
- ヘッダー（ロゴ）、戻るリンク、タイトルセクション、カード、フッターを実装
- ModelViewer で GLB ファイルをプレビュー表示
- himekkoDescription が設定されている場合のみ説明文エリアを表示
- WCAG AA アクセシビリティ基準を満たす

## Task 4: SpotArExperience・page.tsx の props 拡張

- `SpotArExperienceProps.spot` に `himekkoDescription` と `arAssetUrl` を追加
- `ArLandingProps.spot` に同フィールドを追加
- `spots/[slug]/camera/page.tsx` で DB から取得した値を渡す
