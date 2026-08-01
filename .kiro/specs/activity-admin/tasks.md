# Implementation Plan

- [x] 1. プロジェクト基盤セットアップ
- [x] 1.1 next-admin と必須依存パッケージをインストールする
  - `@premieroctet/next-admin`, `@premieroctet/next-admin-generator-prisma`, `tailwindcss@3`, `@prisma/adapter-pg`, `pg` をインストール
  - TailwindCSS の設定ファイルを作成し、next-admin の content パスと preset を含める
  - next.config に webpack alias（Prisma 7 runtime 互換）を設定
  - _Requirements: 1.1_

- [x] 1.2 Prisma スキーマに Activity モデルと next-admin ジェネレータを定義する
  - `next-admin-generator-prisma` ジェネレータを追加
  - ActivityStatus enum（DRAFT, PUBLISHED, CLOSED）を定義する
  - Activity モデルを定義する（id は autoincrement の Integer、title, description は必須 String、status は DRAFT デフォルト、startDate は必須、endDate は nullable、createdAt/updatedAt は自動管理）
  - `prisma db push` でスキーマを DB に反映し、Prisma Client と next-admin スキーマを再生成
  - _Requirements: 6.1, 6.2_

- [x] 1.3 (P) Prisma Client のシングルトンインスタンスを作成する
  - 開発時のホットリロードで複数インスタンスが生成されないよう、global オブジェクトにアタッチする
  - `src/lib/prisma.ts` として定義する（@prisma/adapter-pg 使用）
  - _Requirements: 1.1_

- [x] 2. next-admin API Route Handler を実装する
  - `createHandler` で API ルートハンドラーを作成する（v8 では Server Actions ラッパーではなく API Route）
  - Prisma Client インスタンスとオプションを注入
  - Next.js 15 の Promise params 型との互換ラッパーを実装
  - _Requirements: 2.3, 2.6, 4.2, 4.4, 5.2, 5.3, 6.3_

- [x] 3. NextAdminOptions で Activity モデルの管理画面設定を定義する
- [x] 3.1 一覧表示の設定を定義する
  - 表示カラムとして ID・タイトル・ステータス・開始日・終了日を指定する
  - タイトルによるキーワード検索を有効にする
  - 作成日降順のデフォルトソートを設定する
  - 1ページあたり 20 件のページサイズを設定する
  - ステータス別フィルタ（すべて・下書き・公開中・終了）を Prisma where 句で定義する
  - フィールドの日本語エイリアスを設定する
  - _Requirements: 1.1, 1.2, 1.4, 7.1, 7.2, 7.3, 7.4, 8.1_

- [x] 3.2 編集フォームの設定を定義する
  - 編集フォームに表示するフィールド（タイトル・説明・ステータス・開始日・終了日）を指定する
  - タイトル・説明・開始日を必須フィールドとして設定する
  - `edit.hooks.beforeDb` で終了日が開始日以降であることを検証し、違反時は `HookError` をスローする
  - _Requirements: 2.2, 2.4, 2.5_

- [x] 4. next-admin キャッチオールルートページを作成する
  - `src/app/admin/[[...nextadmin]]/page.tsx` に Server Component としてページを作成する
  - `getNextAdminProps` に Prisma Client、オプションを渡して props を生成する
  - `<NextAdmin>` コンポーネントに props を展開して描画する
  - API Route Handler (`src/app/api/admin/[[...nextadmin]]/route.ts`) と連携
  - これにより一覧表示・新規作成・詳細表示・編集・削除の全 CRUD 画面が自動生成される
  - 空状態メッセージ、成功時リダイレクト、404 エラー、削除確認ダイアログ、URLクエリパラメータ保持、ページネーションは next-admin の組み込み機能として提供される
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 5. 動作確認と統合検証
  - `/admin` にアクセスしてダッシュボードが表示されることを確認する
  - アクティビティの新規作成 → 一覧確認 → 詳細表示 → 編集 → 削除の一連のフローを検証する
  - 必須フィールド（タイトル・説明・開始日）未入力時にバリデーションエラーが表示されることを確認する
  - 終了日 < 開始日の入力で日付バリデーションエラーが発生することを確認する
  - キーワード検索でタイトルの部分一致検索が動作することを確認する
  - ステータスフィルタで一覧が正しく絞り込まれることを確認する
  - ページネーションが 20 件単位で動作し、フィルタ条件が維持されることを確認する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5_
