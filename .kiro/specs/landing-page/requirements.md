# Requirements Document

## はじめに

本ドキュメントは「よっとこ！新庄村」サービスのランディングページ（入り口ページ）の要件を定義する。
訪問者（新庄村への来訪者・潜在的な来訪者）がサービスの価値を理解し、
体験・手伝いへの参加や AR フォト撮影に興味を持てるよう誘導することを目的とする。

## Boundary Context

- **In scope**: ルート `/` に表示されるランディングページ本体。PC・スマホ両レイアウト。ページ内の全セクションとフッター。
- **Out of scope**: 各機能ページの実装内容（`/activities`, `/spots`, `/camera` など）。チーム写真・スマホモックアップ画像等の素材作成。管理画面の変更。
- **Adjacent expectations**: ランディングページから `/activities`（体験一覧）・`/spots`（スポット一覧）・`/camera`（ARカメラ）へのナビゲーションが機能していることを前提とする。現行の開発ポータル機能（ページ一覧・体験フロー確認）は `/dev` 等の別パスへ移管される。

## Requirements

### Requirement 1: ランディングページの全環境表示

**Objective:** 訪問者として、サービスの入り口ページを確認したい。これにより、サービスの価値を理解し利用を開始できる。

#### Acceptance Criteria
1. The Landing Page shall ルート `/` に対してランディングページを表示する（本番・ステージング・開発すべての環境で）
2. When 訪問者がルート `/` にアクセスする, the Landing Page shall 環境に関わらずランディングページのコンテンツを表示し、他ページへのリダイレクトを行わない
3. The Landing Page shall 現在の `/` にある開発ポータルコンテンツ（体験フロー・ページ一覧）を別パスへ移管し、`/` では表示しない

### Requirement 2: ヒーローセクション

**Objective:** 訪問者として、サービスの第一印象とコンセプトを直感的に把握したい。これにより、サービスへの興味・関心が高まる。

#### Acceptance Criteria
1. The Landing Page shall ヒーローセクションにサービス名「よっとこ！」と所在地「岡山県 真庭郡 新庄村」を表示する
2. The Landing Page shall キャッチコピー「よっとこ！村の暮らしへ。」を視覚的に強調して表示する
3. The Landing Page shall サービス説明文「新庄村の体験や人と、気軽につながり、『ちょっとうれしい交流のきっかけ』を作るサービスです。」を表示する
4. The Landing Page shall 体験・手伝い一覧ページ（`/activities`）へ遷移するプライマリ CTA ボタン「体験・手伝いを見てみる」を表示する
5. The Landing Page shall スポット一覧ページ（`/spots`）へ遷移するセカンダリリンク「スポット一覧」を表示する
6. The Landing Page shall スマートフォンのアプリ画面を表示したモックアップ画像を含むビジュアルエリアを表示する
7. When PC レイアウト（画面幅 1024px 以上）で表示する, the Landing Page shall テキストエリアとビジュアルエリアを左右2カラムに並べて表示する
8. When スマートフォンレイアウト（画面幅 1024px 未満）で表示する, the Landing Page shall ビジュアルエリアをテキストエリアの上側に表示し、縦方向に積み上げたレイアウトで表示する

### Requirement 3: ABOUT セクション

**Objective:** 訪問者として、サービスが何をするものかを簡潔に理解したい。これにより、利用前の疑問が解消される。

#### Acceptance Criteria
1. The Landing Page shall 「ABOUT」見出しと「よっとこ！新庄村 とは？」のセクションタイトルを表示する
2. The Landing Page shall サービス概要説明文（新庄村を訪れた人が体験・手伝いに申し込み、スポットの QR コードから AR フォトを撮れるウェブサービス）を表示する
3. The Landing Page shall 「登録不要。スマートフォンのブラウザからすぐ使えます。」という利点を強調したバナー・インフォメーション要素を表示する
4. When PC レイアウトで表示する, the Landing Page shall セクションタイトルと説明文を左右に分割したレイアウトで表示する

### Requirement 4: 機能その1 — 体験・手伝いに参加するセクション

**Objective:** 訪問者として、体験・手伝いへの参加方法を知りたい。これにより、村の人との交流のきっかけが得られる。

#### Acceptance Criteria
1. The Landing Page shall 「機能 その１」ラベルと「体験・手伝いに参加する」見出しを表示する
2. The Landing Page shall 体験・手伝いのコンセプト説明文と「参加者にはちょっとした記念品を贈呈」の注記を表示する
3. The Landing Page shall 体験・手伝い一覧ページ（`/activities`）へ遷移する CTA ボタン「体験・手伝いを見てみる」を表示する
4. The Landing Page shall 体験メニューのカードイメージ（モックアップ）を含むビジュアルエリアを表示する
5. When PC レイアウトで表示する, the Landing Page shall テキストエリアとカードビジュアルエリアを左右2カラムに並べて表示する

### Requirement 5: 機能その2 — AR フォトを撮るセクション

**Objective:** 訪問者として、AR 記念撮影機能の存在と楽しさを知りたい。これにより、スポット巡りへの動機が生まれる。

#### Acceptance Criteria
1. The Landing Page shall 「ひめっ子が出現」ラベルと「機能 その２」見出し・「AR フォトを撮る」セクションタイトルを表示する
2. The Landing Page shall AR フォト機能の説明文（QR コードをスキャンするとキャラクター「ひめっ子」が出現し、写真をシェアできる）を表示する
3. The Landing Page shall スポット一覧ページ（`/spots`）へ遷移する CTA ボタン「スポット一覧を見る」を表示する
4. The Landing Page shall AR カメラページ（`/camera`）へ遷移するお試し用 CTA ボタン「ひめっ子と写真を撮ってみる」を表示する
5. The Landing Page shall AR 機能を示すスマートフォンモックアップ画像を表示する
6. When PC レイアウトで表示する, the Landing Page shall モックアップ画像とテキストエリアを左右2カラムに並べて表示する（体験セクションとは左右反転した配置で）

### Requirement 6: BACKGROUND セクション

**Objective:** 訪問者として、サービスの背景と開発チームを知りたい。これにより、サービスへの信頼感が増す。

#### Acceptance Criteria
1. The Landing Page shall 「BACKGROUND」見出しと「このサービスについて」セクションタイトルを表示する
2. The Landing Page shall サービスの背景説明文（2026年3月のハッカソン発祥・新庄村と WESEEK の共同開発・実証実験）を表示する
3. The Landing Page shall チーム写真を表示する
4. When PC レイアウトで表示する, the Landing Page shall 説明文とチーム写真を左右2カラムに並べて表示する

### Requirement 7: フッター

**Objective:** 訪問者として、提供者情報と連絡先を確認したい。これにより、問い合わせが可能になる。

#### Acceptance Criteria
1. The Landing Page shall フッターに「よっとこ！新庄村」ロゴを表示する
2. The Landing Page shall 提供者情報「岡山県真庭郡新庄村 × 株式会社 WESEEK」を表示する
3. The Landing Page shall お問い合わせメールアドレス「contact@example.com」を表示する

### Requirement 8: レスポンシブレイアウト

**Objective:** 訪問者として、使用デバイス（PC・スマートフォン）に最適化された表示でランディングページを閲覧したい。これにより、快適な閲覧体験が得られる。

#### Acceptance Criteria
1. The Landing Page shall 画面幅 1024px 以上（PC）と 1024px 未満（スマートフォン）で異なるレイアウトを提供する
2. When スマートフォンレイアウトで表示する, the Landing Page shall 全セクションのコンテンツを縦方向に積み上げた単一カラムレイアウトで表示する
3. When PC レイアウトで表示する, the Landing Page shall 各セクションに2カラム配置を採用してワイド画面の領域を有効活用したレイアウトで表示する
4. The Landing Page shall 横スクロールが発生しないよう、すべての画面幅でコンテンツを適切に収める

### Requirement 9: アクセシビリティ・ユーザビリティ

**Objective:** 訪問者として、年齢や障害の有無に関わらず快適にランディングページを閲覧したい。これにより、幅広い層のユーザーがサービスを知る機会を得られる。

#### Acceptance Criteria
1. The Landing Page shall WCAG AA 準拠のカラーコントラスト比（4.5:1 以上）をすべてのテキスト要素に確保する
2. The Landing Page shall 最小フォントサイズ 14px・行間 1.5 以上を本文テキストに適用する
3. The Landing Page shall すべての画像に代替テキスト（alt 属性）を設定する
4. The Landing Page shall キーボード操作のみで全 CTA ボタン・リンクに到達・操作できるようにする
5. The Landing Page shall 各セクションに適切な見出し階層（h1, h2, h3）を設定し、スクリーンリーダーでページ構造を把握できるようにする
