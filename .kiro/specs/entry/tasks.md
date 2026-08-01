# Implementation Plan

- [x] 1. データ層セットアップ
- [x] 1.1 Prisma スキーマ変更（Entry モデル追加・Activity 論理削除対応）
  - Entry モデルを作成する: name（必須）、message（任意）、status（EntryStatus enum: NEW/IN_PROGRESS/DONE、デフォルト NEW）、activityId（Activity へのリレーション）、deletedAt（任意）、createdAt、updatedAt
  - EntryStatus enum を定義する（NEW, IN_PROGRESS, DONE）
  - Activity モデルに deletedAt フィールド（任意の DateTime）を追加する
  - Activity モデルに entries リレーション（Entry の配列）を追加する
  - Entry の deletedAt および activityId にインデックスを付与する
  - Activity の deletedAt にインデックスを付与する
  - テーブルマッピングを `entries` に設定する
  - `prisma db push` でスキーマを DB に反映し、`prisma generate` でクライアントを再生成する
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.4, 5.5_

- [x] 1.2 Prisma Client に論理削除 Extension を適用する
  - `src/lib/prisma.ts` の PrismaClient インスタンスに `$extends()` を追加する
  - 論理削除対象モデル（Activity, Entry）の `delete` 操作を `update({ deletedAt: new Date() })` に変換する
  - `findMany`、`findFirst`、`findUnique`、`count` に `deletedAt: null` フィルタを自動付与する
  - 対象モデルを限定し、deletedAt フィールドを持たないモデルには影響を与えない
  - 既存の Activity 一覧・詳細ページで論理削除済みレコードが除外されることを確認する
  - _Requirements: 4.4, 4.5, 5.2, 5.3_

- [x] 2. (P) createEntry Server Action を実装する
  - `"use server"` ディレクティブで Server Action を定義する
  - activityId を `bind` で第 1 引数として受け取り、`useActionState` 互換のシグネチャにする
  - FormData から name と message を抽出する
  - name の必須バリデーションを行う（空文字・空白のみを拒否）。失敗時はエラー状態を返却する
  - activityId で Activity を取得し、PUBLISHED かつ未削除であることを検証する。不在の場合はエラーを返却する
  - バリデーション成功時に Entry を status: NEW で DB に保存する
  - 保存成功後、完了ページへリダイレクトする
  - DB エラー発生時はサーバーエラーメッセージを返却し、入力内容を保持できるようにする
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1_

- [x] 3. (P) next-admin に Entry モデルの管理設定を追加する
  - `src/app/admin/options.ts` の sidebar.groups に「申込管理」グループを追加し、Entry モデルを登録する
  - Entry モデルの設定を追加する: toString（申込者名を表示）、title（「申込」）、aliases（id, name, message, status, activityId, deletedAt, createdAt, updatedAt の日本語ラベル）
  - 一覧表示の設定: id, name, activity（リレーション）, status, createdAt を表示し、createdAt の降順でデフォルトソートする
  - ステータスの formatter を定義する（NEW → 「🆕 新規」、IN_PROGRESS → 「🔄 対応中」、DONE → 「✅ 対応済み」）
  - 日時フィールドの formatter を既存の formatDate 関数で統一する
  - ステータスフィルタを設定する（すべて / 新規 / 対応中 / 対応済み）
  - 管理画面で申込の一覧表示・詳細表示・ステータス変更ができることを確認する
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4_

- [x] 4. 訪問者向け UI
- [x] 4.1 申込フォームページを実装する
  - 既存のプレースホルダー `/activities/[id]/apply/page.tsx` を Server Component として差し替える
  - Activity を取得し、PUBLISHED かつ未削除であることを確認する。条件を満たさない場合は申込不可メッセージを表示する
  - アクティビティのタイトルと開始日をフォーム上部に表示する
  - フォーム部分を Client Component として分離し、`useActionState` でバリデーションエラーを表示する
  - `useFormStatus` で送信中のボタン無効化を実装し、二重送信を防止する
  - お名前（必須）とメッセージ（任意）の入力フィールドを提供する
  - フォームラベルの `htmlFor` 関連付け、エラー時の `aria-describedby`、`aria-live="polite"` リージョンを設定する
  - アクティビティ詳細ページへの戻る導線を提供する
  - 最小フォントサイズ 14px、行間 1.5、コントラスト比 4.5:1 以上を適用する
  - スマートフォン表示に最適化したレスポンシブレイアウトを適用する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 4.2 (P) 申込完了ページを実装する
  - `/entries/[cancelToken]/complete/page.tsx` を Server Component として作成する
  - cancelToken で Entry を取得し、紐づく Activity 情報（タイトル・ID・実施日時）と予約者名を表示する
  - 申込完了メッセージを表示する
  - キャンセル用URLを表示する
  - 交流コンテンツ一覧ページへのリンクを提供する
  - アクティビティ詳細ページへのリンクを提供する
  - 既存レイアウト・デザイントークン・アクセシビリティ基準を踏襲する
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.1, 8.2, 8.6_

- [x] 5. キャンセルフロー実装
- [x] 5.1 キャンセル確認ページ（`/entries/[cancelToken]/cancel/page.tsx`）のデザイン更新
  - タイトルを「交流のキャンセル」（破線アンダーライン付き）に変更する
  - アクティビティ名・アクティビティID・実施日時・予約者名をカード内に表示する
  - キャンセルボタン（緑・角丸）と「ボタンを押すとキャンセルが確定します」キャプションをカード内下部に配置する
  - `magao_cats.png` をページ下部に表示する
  - 既存のアクセシビリティ基準を踏襲する
  - _Requirements: 9.1, 9.2, 9.3, 8.1, 8.2, 8.6_

- [x] 5.2 cancelEntry Action を status ベースに変更する
  - キャンセル前に `findFirst`（`status: { not: "CANCELLED" }`）で activityId・name・activity.title を取得する
  - `updateMany` の `data` を `deletedAt: new Date()` から `status: "CANCELLED"` に変更する
  - `where` 条件を `deletedAt: null` から `status: { not: "CANCELLED" }` に変更する
  - キャンセル成功後のリダイレクト先を `/entries/${cancelToken}/cancel/complete?activityId=...&name=...` に変更する
  - _Requirements: 9.4, 9.5_

- [x] 5.3 キャンセル完了ページ（`/entries/[cancelToken]/cancel/complete/page.tsx`）を新規作成する
  - `searchParams` から `activityId` と `name` を受け取る
  - Activity（非削除）を `prisma.activity.findFirst` で取得してタイトル・実施日時を表示
  - `ozigi_cats.png` をページ上部に表示する
  - 「交流の予約がキャンセルされました」メッセージを表示する
  - キャンセル済み申込内容（アクティビティ名・実施日時・予約者名）をカードで表示する
  - アクティビティ一覧（`/activities`）への「‹ 一覧に戻る」リンクを提供する
  - _Requirements: 9.5, 9.6, 9.7, 9.8, 8.1, 8.2, 8.6_

- [x] 5.4 `entries` ルートのレイアウト（`/entries/layout.tsx`）を新規作成する
  - `activities/layout.tsx` と同等のヘッダー・コンテナ・フッターを提供する
  - _Requirements: 8.6_

- [x] 5.5 申込完了ページのキャンセルURL表示を修正する
  - キャンセル用URLをプレーンテキストから `<a href={cancelUrl}>` のクリック可能なリンクに変更する
  - `env.BETTER_AUTH_URL` をリクエストヘッダー（`x-forwarded-proto` / `x-forwarded-host`）から動的に取得したオリジンに置き換える
  - _Requirements: 9.9, 9.10_

- [x] 6. キャンセル時の管理者通知とステータス管理
- [x] 6.1 EntryStatus に CANCELLED を追加する
  - `prisma/schema.prisma` の `EntryStatus` enum に `CANCELLED` を追加する
  - `prisma db push` でスキーマを DB に反映し、`prisma generate` でクライアントを再生成する
  - _Requirements: 10.1_

- [x] 6.2 キャンセル通知メールを実装する
  - `src/lib/email/templates/cancel-notification.tsx` にキャンセル通知メールテンプレートを作成する（既存の `entry-notification.tsx` パターンに準拠）
  - `src/lib/email/notify-cancel.ts` に `notifyCancelEntry` 関数を作成する（既存の `notify-entry.ts` パターンに準拠）
  - 件名: `【よっとこ！新庄村】キャンセル通知: ${activityTitle}`
  - メール本文: アクティビティ名・申込者名・キャンセル日時を含める
  - _Requirements: 10.3, 10.4, 10.5_

- [x] 6.3 cancelEntry Action に通知呼び出しを追加する
  - `notifyCancelEntry` を `cancelEntry` action から呼び出す
  - _Requirements: 10.3_

- [x] 6.4 admin options.tsx に CANCELLED ステータスを追加する
  - リスト画面の `status` フォーマッターに `CANCELLED: "❌ キャンセル"` を追加する
  - ステータスフィルターに「❌ キャンセル」を追加する
  - 編集画面の `EnumSelectInput` に `CANCELLED` オプションを追加する
  - _Requirements: 10.1, 10.2_
