# Requirements Document

## はじめに

本ドキュメントは、Arcana アプリケーションにおける「交流コンテンツ フロントエンド（Activity Front）」機能の要件を定義する。本機能は、新庄村の訪問者が交流コンテンツ（体験メニュー）を閲覧し、興味のあるコンテンツへの参加導線を提供するフロントエンド画面群を構築する。管理者が Activity Admin で登録した交流コンテンツを、訪問者向けに一覧・詳細の 2 画面で表示する。公開中だけでなく終了済みのコンテンツも表示することで、活動の活発さを訪問者に伝える。

## Requirements

### Requirement 1: 交流コンテンツ一覧表示

**Objective:** 訪問者として、交流コンテンツ（体験メニュー）を一覧で閲覧したい。これにより、新庄村の交流活動の全体像を把握し、参加可能な体験を見つけられる。

#### Acceptance Criteria
1. When 訪問者が交流コンテンツ一覧ページにアクセスする, the Activity Front shall 公開中（PUBLISHED）および終了（CLOSED）のアクティビティをカード形式で一覧表示する
2. The Activity Front shall 下書き（DRAFT）のアクティビティを一覧に表示しない
3. The Activity Front shall 各カードにサムネイル画像・タイトル・説明の冒頭（抜粋）・開始日を表示する
4. The Activity Front shall 一覧を開始日の降順（新しい体験が上）でデフォルト表示する
5. The Activity Front shall 終了済みのアクティビティを視覚的に区別できるようにする（例: ラベル表示やトーンダウン）
6. When 表示対象のアクティビティが存在しない場合, the Activity Front shall 「現在公開中の体験メニューはありません」と空状態メッセージを表示する
7. The Activity Front shall スマートフォン表示に最適化したレスポンシブレイアウトを提供する

### Requirement 2: 交流コンテンツ詳細表示

**Objective:** 訪問者として、個別の交流コンテンツの詳細情報を確認したい。これにより、参加するかどうかを判断できる。

#### Acceptance Criteria
1. When 訪問者が一覧からアクティビティカードをタップする, the Activity Front shall 該当アクティビティの詳細ページに遷移する
2. The Activity Front shall タイトル・画像・説明（全文）・開始日・終了日を詳細ページに表示する
3. While アクティビティが公開中（PUBLISHED）の状態で, the Activity Front shall 「参加してみる」ボタンを表示する
4. While アクティビティが終了（CLOSED）の状態で, the Activity Front shall 「参加してみる」ボタンを非表示にし、終了済みであることを表示する
5. When 訪問者が「参加してみる」ボタンをタップする, the Activity Front shall 申込ページへの遷移を行う
6. If 指定されたアクティビティが存在しないか下書き（DRAFT）の場合, the Activity Front shall 404 エラーページを表示する
7. The Activity Front shall 一覧ページへの戻る導線を提供する
8. The Activity Front shall 詳細ページの上部にステータスバッジ（「募集中」または「終了」）を視覚的に目立つ形で表示する
9. The Activity Front shall 開始日時・終了日時を「YYYY年M月D日 HH:mm – HH:mm」形式でプライマリーカラーで表示する
10. When アクティビティに詳細情報（detail）が設定されている場合, the Activity Front shall 説明文の後に詳細情報セクションを表示する
11. The Activity Front shall 「参加してみる」ボタンを横幅いっぱいのピルボタンとして表示する

### Requirement 3: アクティビティ画像

**Objective:** 訪問者として、アクティビティに関連する複数の画像を見たい。これにより、体験の雰囲気を事前にイメージでき、参加意欲が高まる。

#### Acceptance Criteria
1. The Activity Front shall アクティビティに複数の画像を関連付けて表示する機能を提供する
2. When アクティビティに画像が1枚以上設定されている場合, the Activity Front shall 一覧カードに先頭の画像をサムネイルとして表示する
3. When アクティビティに画像が複数設定されている場合, the Activity Front shall 詳細ページにすべての画像を表示する
4. If アクティビティに画像が設定されていない場合, the Activity Front shall デフォルトのプレースホルダー画像を表示する
5. The Activity Front shall 各画像に適切な alt テキストを設定する（アクティビティタイトルを使用）

### Requirement 4: 申込ページへの導線

**Objective:** 訪問者として、興味のある交流コンテンツへの参加意思を伝える手段にたどり着きたい。これにより、村の人との交流のきっかけを作れる。

#### Acceptance Criteria
1. While アクティビティが公開中（PUBLISHED）の状態で, the Activity Front shall 詳細ページに申込ページへのリンクまたはボタンを表示する
2. When 訪問者が申込導線をタップする, the Activity Front shall 申込ページ（将来実装）のパスへ遷移する
3. The Activity Front shall 申込ページのルーティングパスを確保する（実装は将来スコープ）

### Requirement 6: 一覧フィルター

**Objective:** 訪問者として、募集中の体験だけに絞り込んで一覧を確認したい。これにより、今すぐ参加できる体験を素早く見つけられる。

#### Acceptance Criteria
1. The Activity Front shall 一覧ページに「すべて」と「募集中のみ」の 2 つのフィルターボタンを表示する
2. When 訪問者が「すべて」を選択する, the Activity Front shall PUBLISHED および CLOSED のアクティビティを全件表示する
3. When 訪問者が「募集中のみ」を選択する, the Activity Front shall PUBLISHED のアクティビティのみ表示する
4. The Activity Front shall アクティブなフィルターを視覚的に区別する（塗りつぶし vs アウトライン）
5. The Activity Front shall フィルター操作をページリロードなしにクライアントサイドで行う

### Requirement 5: アクセシビリティ・ユーザビリティ

**Objective:** 訪問者として、年齢や障害の有無に関わらず快適に利用したい。これにより、幅広い訪問者が交流コンテンツにアクセスできる。

#### Acceptance Criteria
1. The Activity Front shall WCAG AA 準拠のカラーコントラスト比（4.5:1 以上）を確保する
2. The Activity Front shall 最小フォントサイズ 14px・行間 1.5 以上を適用する
3. The Activity Front shall すべてのインタラクティブ要素にキーボード操作でアクセス可能にする
4. The Activity Front shall 画像に適切な代替テキストを付与する
5. The Activity Front shall ページ遷移時にフォーカス管理を適切に行う
