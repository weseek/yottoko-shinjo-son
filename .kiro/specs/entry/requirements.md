# Requirements Document

## はじめに

本ドキュメントは、Arcana アプリケーションにおける「参加エントリー（Entry）」機能の要件を定義する。本機能は、訪問者が交流コンテンツ（体験メニュー）への参加意思を軽量なフォームで伝える仕組みと、管理者が受け取った申込を一覧・対応管理する画面を提供する。訪問者のアカウント登録は不要（α版スコープ）で、最小限の情報のみで意思表示できることを重視する。

## Requirements

### Requirement 1: 申込フォーム表示

**Objective:** 訪問者として、交流コンテンツへの参加意思を簡単に伝えたい。これにより、村の人との交流のきっかけを作れる。

#### Acceptance Criteria
1. When 訪問者がアクティビティ詳細ページから申込ページに遷移する, the Entry System shall 対象アクティビティのタイトルを表示した申込フォームを表示する
2. The Entry System shall 以下の入力フィールドを提供する: お名前（必須）・メッセージ（任意）
3. The Entry System shall 対象アクティビティの情報（タイトル・開始日）をフォーム上部に表示し、訪問者がどの体験に申し込んでいるかを明確にする
4. If 対象アクティビティが存在しない・論理削除済み・または公開中（PUBLISHED）でない場合, the Entry System shall 申込フォームを表示せず、申込できない旨のメッセージを表示する
5. The Entry System shall アクティビティ詳細ページへの戻る導線を提供する

### Requirement 2: 申込バリデーションと送信

**Objective:** 訪問者として、入力ミスを事前に検知し、正しい情報で申込を完了したい。これにより、確実に意思表示できる。

#### Acceptance Criteria
1. When 訪問者がフォームを送信する, the Entry System shall 必須フィールド（お名前）の入力を検証する
2. If 必須フィールドが未入力の場合, the Entry System shall 該当フィールドにエラーメッセージを表示し、送信を阻止する
3. When バリデーションが成功した場合, the Entry System shall 申込データをデータベースに保存する
4. If 申込の保存中にサーバーエラーが発生した場合, the Entry System shall エラーメッセージを表示し、入力内容を保持する

### Requirement 3: 申込完了画面

**Objective:** 訪問者として、申込が正常に完了したことを確認したい。これにより、安心して次の行動に移れる。

#### Acceptance Criteria
1. When 申込の保存が成功した場合, the Entry System shall 申込完了画面に遷移する
2. The Entry System shall 申込完了メッセージと対象アクティビティのタイトルを表示する
3. The Entry System shall 交流コンテンツ一覧ページへの導線を提供する
4. The Entry System shall アクティビティ詳細ページへの導線を提供する

### Requirement 4: 申込データモデル

**Objective:** システムとして、申込情報を構造化して永続化したい。これにより、管理者が申込を一覧・管理できる。

#### Acceptance Criteria
1. The Entry System shall 申込データに以下のフィールドを持たせる: ID・お名前・メッセージ（任意）・対象アクティビティへの関連・ステータス・削除日時（論理削除用）・作成日時・更新日時
2. The Entry System shall 申込ステータスとして「新規」「対応中」「対応済み」を管理する
3. When 申込が新規作成される場合, the Entry System shall デフォルトステータスを「新規」に設定する
4. The Entry System shall 申込の削除を論理削除（deletedAt フィールドへのタイムスタンプ設定）で行い、データを物理的に削除しない
5. The Entry System shall 訪問者向け画面・管理画面の通常表示では論理削除済みの申込を除外する

### Requirement 5: Activity 論理削除対応（横断的変更）

**Objective:** システムとして、アクティビティも論理削除で管理したい。これにより、削除後も関連する申込データとの整合性を保ち、管理者が過去の対応履歴を追跡できる。

#### Acceptance Criteria
1. The Entry System shall Activity モデルに deletedAt フィールドを追加し、論理削除に対応する
2. The Entry System shall 訪問者向け画面では論理削除済みのアクティビティを表示しない
3. The Entry System shall 管理画面の通常表示では論理削除済みのアクティビティを除外する
4. While アクティビティが論理削除された状態で, the Entry System shall 関連する申込データへの参照を維持する（外部キーは保持）
5. The Entry System shall deletedAt カラムにインデックスを付与し、未削除レコードの検索を効率化する

### Requirement 6: 管理者向け申込一覧

**Objective:** 管理者として、訪問者からの申込を一覧で確認したい。これにより、申込状況の全体像を把握し、対応漏れを防げる。

#### Acceptance Criteria
1. When 管理者が申込管理画面にアクセスする, the Entry Admin shall 申込の一覧をテーブル形式で表示する
2. The Entry Admin shall 各申込のお名前・対象アクティビティ名・ステータス・申込日時を一覧に表示する
3. When 申込が存在しない場合, the Entry Admin shall 「申込はありません」と空状態メッセージを表示する
4. The Entry Admin shall 一覧を申込日時の降順（新しい順）でデフォルト表示する

### Requirement 7: 管理者向け申込ステータス管理

**Objective:** 管理者として、各申込の対応状況を更新・管理したい。これにより、対応の進捗を追跡できる。

#### Acceptance Criteria
1. When 管理者が申込の詳細画面を開く, the Entry Admin shall 申込の全情報（お名前・メッセージ・対象アクティビティ・ステータス・申込日時）を表示する
2. When 管理者がステータスを変更する, the Entry Admin shall ステータスを更新し、更新日時を記録する
3. The Entry Admin shall ステータスによるフィルタリング機能を提供する（全件・新規・対応中・対応済み）
4. When 管理者がステータスフィルタを選択する, the Entry Admin shall 選択されたステータスに一致する申込のみを表示する

### Requirement 9: キャンセルフロー（確認・完了）

**Objective:** 訪問者として、都合が悪くなった場合に申込をキャンセルしたい。これにより、申込をキャンセルした旨が明確に伝わり、安心できる。

#### Acceptance Criteria
1. When 訪問者がキャンセル用URLにアクセスする, the Entry System shall 申込内容（アクティビティ名・アクティビティID・実施日時・予約者名）を表示したキャンセル確認ページを表示する
2. The Entry System shall キャンセル確認ページに `magao_cats.png` のイラストを表示する
3. When 申込が存在しない・または既にキャンセル済み（status が CANCELLED）の場合, the Entry System shall キャンセル不可メッセージを表示する
4. When 訪問者がキャンセルを確定する, the Entry System shall 申込の status を CANCELLED に変更する
5. When キャンセルが成功した場合, the Entry System shall `/entries/[cancelToken]/cancel/complete` に遷移する
6. The Entry System shall キャンセル完了ページに `ozigi_cats.png` のイラストと「交流の予約がキャンセルされました」メッセージを表示する
7. The Entry System shall キャンセル完了ページにキャンセル済み申込内容（アクティビティ名・実施日時・予約者名）を表示する
8. The Entry System shall キャンセル完了ページにアクティビティ一覧（`/activities`）への導線を提供する
9. The Entry System shall 申込完了ページのキャンセル用URLをクリック可能なリンクとして表示する
10. The Entry System shall キャンセル用URLをリクエストのオリジン（`x-forwarded-proto` / `x-forwarded-host` ヘッダー）から動的に生成し、Cloudflare トンネル等の外部アクセスでも正しいURLを提供する

### Requirement 10: キャンセル時の管理者通知とステータス管理

**Objective:** 管理者として、訪問者がキャンセルした際に即座に把握し、管理画面で状況を確認したい。これにより、対応漏れを防げる。

#### Acceptance Criteria
1. The Entry Admin shall CANCELLED ステータスを申込一覧に「❌ キャンセル」として表示する
2. The Entry Admin shall CANCELLED ステータスによる申込絞り込みフィルタを提供する
3. When キャンセルが成立した場合, the Entry System shall DB に登録されている有効な通知先（`NotificationRecipient.isActive = true`）全員にキャンセル通知メールを送信する
4. The Entry System shall キャンセル通知メールにアクティビティ名・申込者名・キャンセル日時を含める
5. The Entry System shall 通知メールの送信失敗をキャンセル処理の完了に影響させない（エラーログ出力のみ）

### Requirement 8: アクセシビリティ・ユーザビリティ

**Objective:** 訪問者として、年齢や障害の有無に関わらず快適に申込フォームを利用したい。これにより、幅広い訪問者が参加エントリーできる。

#### Acceptance Criteria
1. The Entry System shall WCAG AA 準拠のカラーコントラスト比（4.5:1 以上）を確保する
2. The Entry System shall 最小フォントサイズ 14px・行間 1.5 以上を適用する
3. The Entry System shall すべてのフォームフィールドに適切なラベルを関連付ける
4. The Entry System shall バリデーションエラーをスクリーンリーダーで認識可能にする（aria-live 等）
5. The Entry System shall フォーム送信後の画面遷移時にフォーカス管理を適切に行う
6. The Entry System shall スマートフォン表示に最適化したレスポンシブレイアウトを提供する
