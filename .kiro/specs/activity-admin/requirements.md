# Requirements Document

## はじめに

本ドキュメントは、Arcana アプリケーションにおける「アクティビティ管理（Activity Admin）」機能の要件を定義する。本機能は、管理者がアクティビティ（イベント・活動）の作成・閲覧・編集・削除を行うための管理画面を提供する。Next.js 15 App Router + Prisma 7 + PostgreSQL の技術スタックに基づき、CRUD 操作を中心とした管理インターフェースを構築する。

## Requirements

### Requirement 1: アクティビティ一覧表示

**Objective:** 管理者として、登録されているアクティビティの一覧を確認したい。これにより、現在のアクティビティ全体の状況を把握できる。

#### Acceptance Criteria
1. When 管理者がアクティビティ管理画面にアクセスする, the Activity Admin shall アクティビティの一覧をテーブル形式で表示する
2. The Activity Admin shall 各アクティビティのタイトル・ステータス・開始日・終了日を一覧に表示する
3. When 登録済みアクティビティが存在しない場合, the Activity Admin shall 「アクティビティはありません」と空状態メッセージを表示する
4. The Activity Admin shall 一覧を作成日の降順（新しい順）でデフォルト表示する

### Requirement 2: アクティビティ新規作成

**Objective:** 管理者として、新しいアクティビティを作成したい。これにより、新規の活動やイベントをシステムに登録できる。

#### Acceptance Criteria
1. When 管理者が「新規作成」ボタンをクリックする, the Activity Admin shall アクティビティ作成フォームを表示する
2. The Activity Admin shall タイトル（必須）・説明（必須）・開始日（必須）・終了日（任意）の入力フィールドを提供する
3. When 管理者がフォームを送信する, the Activity Admin shall 入力データをバリデーションし、データベースに新規アクティビティを保存する
4. If 必須フィールドが未入力の場合, the Activity Admin shall 該当フィールドにエラーメッセージを表示し、送信を阻止する
5. If 終了日が開始日より前の日付で入力された場合, the Activity Admin shall バリデーションエラーを表示する
6. When アクティビティの保存が成功した場合, the Activity Admin shall 一覧画面に遷移し、成功メッセージを表示する

### Requirement 3: アクティビティ詳細表示

**Objective:** 管理者として、個別のアクティビティの詳細情報を確認したい。これにより、特定のアクティビティの全情報を把握できる。

#### Acceptance Criteria
1. When 管理者が一覧からアクティビティを選択する, the Activity Admin shall 該当アクティビティの詳細画面を表示する
2. The Activity Admin shall タイトル・説明・ステータス・開始日・終了日・作成日・更新日を詳細画面に表示する
3. If 指定されたアクティビティが存在しない場合, the Activity Admin shall 404 エラーページを表示する

### Requirement 4: アクティビティ編集

**Objective:** 管理者として、既存のアクティビティの情報を更新したい。これにより、誤りの修正や情報の追加ができる。

#### Acceptance Criteria
1. When 管理者が詳細画面で「編集」ボタンをクリックする, the Activity Admin shall 既存データが入力済みの編集フォームを表示する
2. When 管理者が編集フォームを送信する, the Activity Admin shall 変更内容をバリデーションし、データベースを更新する
3. If バリデーションエラーが発生した場合, the Activity Admin shall エラーメッセージを表示し、入力内容を保持する
4. When アクティビティの更新が成功した場合, the Activity Admin shall 詳細画面に遷移し、成功メッセージを表示する

### Requirement 5: アクティビティ削除

**Objective:** 管理者として、不要なアクティビティを削除したい。これにより、不要なデータを整理できる。

#### Acceptance Criteria
1. When 管理者が「削除」ボタンをクリックする, the Activity Admin shall 削除確認ダイアログを表示する
2. When 管理者が削除を確認する, the Activity Admin shall 該当アクティビティをデータベースから削除する
3. When 削除が成功した場合, the Activity Admin shall 一覧画面に遷移し、削除成功メッセージを表示する
4. If 削除処理中にエラーが発生した場合, the Activity Admin shall エラーメッセージを表示し、データを保持する

### Requirement 7: 検索・フィルタリング

**Objective:** 管理者として、アクティビティをキーワードやステータスで絞り込みたい。これにより、大量のアクティビティの中から目的のものを素早く見つけられる。

#### Acceptance Criteria
1. The Activity Admin shall 一覧画面にキーワード検索フィールドを提供する
2. When 管理者がキーワードを入力する, the Activity Admin shall タイトルに対する部分一致検索を実行し、結果を表示する
3. The Activity Admin shall ステータスによるフィルタリング機能を提供する（全件・下書き・公開中・終了）
4. When 管理者がステータスフィルタを選択する, the Activity Admin shall 選択されたステータスに一致するアクティビティのみを表示する
5. When 検索・フィルタの結果が0件の場合, the Activity Admin shall 「条件に一致するアクティビティはありません」とメッセージを表示する
6. The Activity Admin shall 検索キーワードとフィルタ条件を URL クエリパラメータとして保持する

### Requirement 8: ページネーション

**Objective:** 管理者として、一覧表示をページ単位で閲覧したい。これにより、大量のデータでもパフォーマンスを維持しながら閲覧できる。

#### Acceptance Criteria
1. The Activity Admin shall 一覧表示を1ページあたり20件で区切る
2. When アクティビティが20件を超える場合, the Activity Admin shall ページナビゲーション（前へ・次へ）を表示する
3. The Activity Admin shall 現在のページ番号と総ページ数を表示する
4. The Activity Admin shall 現在のページ番号を URL クエリパラメータとして保持する
5. While 検索・フィルタが適用されている状態で, When ページを切り替える, the Activity Admin shall 検索・フィルタ条件を維持したままページネーションを実行する

### Requirement 6: アクティビティステータス管理

**Objective:** 管理者として、アクティビティのステータスを管理したい。これにより、各アクティビティの進行状況を追跡できる。

#### Acceptance Criteria
1. The Activity Admin shall アクティビティに「下書き」「公開中」「終了」のステータスを持たせる
2. When アクティビティが新規作成される場合, the Activity Admin shall デフォルトステータスを「下書き」に設定する
3. When 管理者がステータスを変更する, the Activity Admin shall ステータスを更新し、更新日時を記録する

### Requirement 9: 詳細情報フィールド

**Objective:** 管理者として、集合場所・定員・対象・持ち物などの構造化された詳細情報を登録したい。これにより、訪問者が参加判断に必要な具体的情報を確認できる。

#### Acceptance Criteria
1. The Activity Admin shall アクティビティ作成・編集フォームに「詳細情報」（detail）テキストエリアを提供する
2. The Activity Admin shall 詳細情報フィールドは任意（省略可）とする
3. The Activity Admin shall 詳細情報フィールドに以下の推奨テンプレートをヘルパーテキストとして表示する：集合日時・集合場所・定員・対象・持ち物
4. The Activity Admin shall 複数行の自由テキストを入力できるテキストエリアとして詳細情報フィールドを提供する
