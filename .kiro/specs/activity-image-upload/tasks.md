# 実装計画

## タスク一覧

- [ ] 1. ActivityImage API エンドポイントの実装
- [x] 1.1 (P) `/api/admin/activity-images` ルートハンドラー（GET・POST）の実装
  - 指定した `activityId` に紐付く画像一覧を `order` 昇順で返す GET エンドポイントを作成する
  - `activityId` クエリパラメータのバリデーション（未指定・数値以外の場合は 400 を返す）
  - `{ activityId, url, order }` を受け取り ActivityImage レコードを新規作成する POST エンドポイントを作成する
  - POST では `activityId` に対応する Activity の存在確認を行い、存在しない場合は 404 を返す
  - POST では `url` が空文字・空白のみの場合は 400 を返す
  - _Requirements: 1.1, 1.5, 2.2_

- [x] 1.2 (P) `/api/admin/activity-images/[id]` ルートハンドラー（DELETE・PATCH）の実装
  - パスパラメータ `id` で指定した ActivityImage レコードを削除する DELETE エンドポイントを作成する
  - 存在しない `id` に対して DELETE を行った場合は 404 を返す
  - `{ order }` を受け取り ActivityImage の並び順を更新する PATCH エンドポイントを作成する
  - 存在しない `id` に対して PATCH を行った場合は 404 を返す
  - ファイルシステム上の画像ファイル（`public/uploads/`）は削除しない（既存 Spot 画像と同方針）
  - _Requirements: 2.1, 2.3_

- [x] 2. ActivityImagesInput コンポーネントの実装
- [x] 2.1 コンポーネントの基本構造と初期表示
  - `"use client"` なクライアントコンポーネントとして作成し、`CustomInputProps` を受け取る
  - ブラウザの URL パス（`/Activity/(\d+)` パターン）から activityId を抽出するロジックを実装する
  - activityId が取得できない（新規作成画面）の場合は「アクティビティを保存後に画像を追加できます」メッセージを表示し、アップロードUIを非活性化する
  - マウント時に `GET /api/admin/activity-images?activityId=X` を呼び、既存画像を `order` 昇順でリスト表示する
  - 画像リスト・アップロード中フラグ・エラーメッセージのローカル state を管理する
  - _Requirements: 1.5, 2.2_

- [x] 2.2 画像アップロード機能
  - ファイル選択 input（JPEG・PNG・WebP・GIF 対応）とアップロードボタンを実装する
  - ファイル選択後、まず既存の `POST /api/admin/upload` にファイルを送信して URL を取得する
  - 取得した URL と現在のリスト末尾 `order` 値を用いて `POST /api/admin/activity-images` を呼び、レコードを作成する
  - アップロード中はボタンを非活性化し、ローディング表示を行う
  - API エラー（ファイル形式・サイズ違反を含む）が発生した場合は `error` state にメッセージをセットし、コンポーネント内に表示する
  - アップロード成功後は画像リストを更新してプレビューとして表示する
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2.3 画像削除機能
  - 各画像プレビューに「削除」ボタンを設ける
  - ボタンクリック時に `DELETE /api/admin/activity-images/[id]` を呼び、成功後にローカル state からも該当画像を除去する
  - API エラー時は `error` state にメッセージをセットし、リストは変更しない（楽観的更新なし）
  - _Requirements: 2.1_

- [x] 2.4 画像並び替え機能
  - 各画像に「↑（上へ）」「↓（下へ）」ボタンを配置する（先頭は↑無効、末尾は↓無効）
  - ボタンクリック時に隣接画像と `order` 値を入れ替える `PATCH /api/admin/activity-images/[id]` を2回呼ぶ
  - 両方の PATCH が成功した後にローカル state の並び順を更新する
  - _Requirements: 2.3_

- [x] 3. Admin 設定への ActivityImagesInput 組み込み
  - `option.tsx` の Activity `aliases` に `images: "画像"` を追加する
  - Activity `edit.display` に画像セクション見出しと `"images"` フィールドを追加する
  - Activity `edit.fields` に `images: { input: <ActivityImagesInput /> }` を設定する
  - _Requirements: 1.1, 1.5, 2.1, 2.2, 2.3_

- [ ] 4. 動作確認と統合検証
- [ ] 4.1 管理者フローの動作確認
  - 既存アクティビティの編集画面で画像アップロード・削除・並び替えが正常に動作することを確認する
  - 新規アクティビティ作成画面で非活性メッセージが表示されることを確認する
  - ファイル形式違反（例: .txt）・サイズ超過（5MB超）時にエラーメッセージが表示されることを確認する
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3_

- [ ] 4.2 ユーザー向けページの表示確認
  - アクティビティ一覧ページで、画像を登録したアクティビティのカードにサムネイルが表示されることを確認する
  - アクティビティ一覧ページで、画像未登録のアクティビティカードにプレースホルダーが表示されることを確認する
  - アクティビティ詳細ページで、登録した複数画像が `order` 昇順で表示されることを確認する
  - アクティビティ詳細ページで、各画像の alt 属性が設定されていることを確認する
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 4.3_
