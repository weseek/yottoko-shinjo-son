# 要件定義書

## Introduction

スポット限定AR撮影（`/spots/[slug]/camera`）を、現行の MindAR によるマーカー認識方式から、自宅撮影（`/camera`）と統一したマーカーレスの床検知方式へ全面移行する。撮影・保存・共有は OS 標準の AR ビューア（Android: Scene Viewer / iOS: Quick Look）に委ねる。これにより、マーカー画像の印刷・設置・`.mind` ファイル生成という運用負荷を解消し、自宅撮影とスポット撮影の実装・体験を一本化する。

来訪者はスポット固有のひめっこ（3Dモデル）と、マーカーを用意せずカメラを床に向けるだけで記念撮影できるようになる。管理者はスポット登録時に `.mind` ファイルやマーカー画像を用意する必要がなくなる。

本仕様は既存の `spot-slug-camera`（現行マーカー方式）を置き換えるものであり、自宅撮影の既存実装（`HiddenArViewer` / `ModelViewer` / `ArModal`）を再利用する。

## Boundary Context

- **In scope（対象）**:
  - スポット限定AR撮影のマーカーレス（床検知）方式への置き換え
  - スポット固有の3Dモデル（`arAssetUrl`）とスポット限定説明文（`himekkoDescription`）、ランディング画面の維持
  - マーカー関連資産の撤去（MindAR依存、`.mind` ファイル参照、自作キャプチャ/プレビュー/シェアフロー）
  - Spot テーブルからの `mindFileUrl`・`markerImageUrl` 削除と DB マイグレーション
  - 管理画面の `.mind`／マーカー画像アップロードUIと `.mind` アップロードAPIの撤去
- **Out of scope（対象外）**:
  - 自宅撮影（`/camera`）側の挙動変更（既に床検知方式で稼働中）
  - スポットの3Dモデル（`arAssetUrl`）の設定方法・アップロードフローの変更
  - 新規のスタンプラリー／写真保存サーバ連携などの追加機能
- **Adjacent expectations（隣接システムの前提）**:
  - AR起動・撮影・端末保存・SNSシェアの実挙動は OS標準の AR ビューアに依存する。本アプリはモデル表示と AR 起動導線までを担い、撮影後の保存/共有UIは所有しない。
  - 3Dモデル（GLB）は既存の `arAssetUrl` に登録済みの前提で動作する。

## Requirements

### Requirement 1: マーカーレスAR撮影への移行

**Objective:** As a 来訪者, I want マーカーを用意せずスポット固有のひめっことAR撮影できること, so that QRを読むだけで手軽に記念撮影ができる

#### Acceptance Criteria
1. When 来訪者がスポット撮影画面で AR 撮影を開始する, the Spot撮影ページ shall マーカー画像を要求せずに OS標準の AR ビューア（Android: Scene Viewer / iOS: Quick Look）を起動する。
2. While AR ビューアが起動している, the Spot撮影ページ shall 対象スポットの `arAssetUrl` に登録された3Dモデルを配置対象として提供する。
3. The Spot撮影ページ shall 物理マーカーおよび `.mind` ファイルを一切要求しない。
4. Where スポットに `arAssetUrl` が登録されていない場合, the Spot撮影ページ shall 既定のひめっこモデルを用いて AR 撮影を提供する。

### Requirement 2: ランディング画面の維持

**Objective:** As a 来訪者, I want 撮影前にスポット名・ひめっこの見た目・説明を確認できること, so that どのスポットで誰と撮るのかを理解してから撮影を開始できる

#### Acceptance Criteria
1. When 来訪者がスポット撮影ページに到達する, the Spot撮影ページ shall スポット名と3Dモデルプレビューを表示する。
2. Where スポットに `himekkoDescription` が設定されている場合, the Spot撮影ページ shall スポット限定説明文を表示する。
3. When ランディング画面が表示されている, the Spot撮影ページ shall AR 撮影を開始するボタンとスポット詳細（または一覧）へ戻る導線を表示する。
4. The ランディング画面 shall マーカー画像を表示しない。

### Requirement 3: 端末非対応時のフォールバック

**Objective:** As a 来訪者, I want AR非対応端末でもひめっこを閲覧できること, so that 端末を問わずコンテンツを楽しめる

#### Acceptance Criteria
1. If 端末が OS標準の AR 表示に対応していない, then the Spot撮影ページ shall 3Dモデルビューア（回転可能なプレビュー）を代替表示する。
2. When 代替の3Dモデルビューアが表示される, the Spot撮影ページ shall AR 非対応である旨の案内を表示する。
3. When 来訪者が代替ビューアを閉じる操作を行う, the Spot撮影ページ shall 元のランディング画面に戻る。

### Requirement 4: 撮影・保存・共有の委譲

**Objective:** As a 来訪者, I want 撮影・端末保存・SNSシェアを普段使い慣れた操作で行えること, so that 追加の学習なしに写真を残せる

#### Acceptance Criteria
1. While OS標準の AR ビューアが起動している, the Spot撮影ページ shall 撮影・端末保存・共有の操作を OS標準 AR ビューアに委ねる。
2. The Spot撮影ページ shall 独自のキャプチャ処理・プレビュー画面・シェア機能を提供しない。

### Requirement 5: マーカー関連資産の撤去

**Objective:** As a 開発者, I want マーカー方式の不要コード・依存を撤去できること, so that コードベースが自宅撮影方式に一本化され保守しやすくなる

#### Acceptance Criteria
1. The Spot撮影ページ shall MindAR ライブラリ（`mind-ar`）およびマーカー認識ロジックを含まない。
2. The Spot撮影機能 shall `.mind` ファイル、自作の AR シーン合成、自作キャプチャ／プレビュー／シェアの各処理を含まない。
3. If マーカー方式でのみ使用されていたコードが他画面から参照されていない, then the 移行 shall 当該コード・アセットを削除する。
4. When 自宅撮影（`/camera`）の既存機能が利用される, the 自宅撮影機能 shall 本移行の前後で挙動を変えない。

### Requirement 6: データモデルの整理

**Objective:** As a 管理者, I want マーカー用フィールドが不要になること, so that スポット登録時に `.mind` やマーカー画像を用意しなくてよくなる

#### Acceptance Criteria
1. The Spot データモデル shall `mindFileUrl` および `markerImageUrl` フィールドを持たない。
2. When スキーマ変更を適用する, the 移行 shall 当該フィールド削除のための DB マイグレーションを提供する。
3. The アプリケーションコード shall 削除後のフィールドをどこからも参照しない。

### Requirement 7: 管理画面の整理

**Objective:** As a 管理者, I want スポット登録画面からマーカー関連の入力が消えること, so that 迷わずスポットを登録できる

#### Acceptance Criteria
1. The スポット管理画面 shall `.mind` ファイルおよびマーカー画像のアップロードUIを表示しない。
2. The 管理API shall `.mind` ファイルアップロード用エンドポイント（`/api/admin/upload-mind`）を提供しない。
3. When 管理者がスポットを作成・編集する, the スポット管理画面 shall 3Dモデル（`arAssetUrl`）・スポット限定説明文（`himekkoDescription`）の設定を引き続き提供する。

### Requirement 8: アクセシビリティ

**Objective:** As a 幅広い年齢層の来訪者（高齢者を含む）, I want 読みやすく操作しやすいUIであること, so that 誰でも迷わず撮影できる

#### Acceptance Criteria
1. The Spot撮影ページ shall 本文フォントサイズを 14px 以上、行間を 1.5 以上で表示する。
2. The Spot撮影ページ shall テキストと背景のコントラスト比を 4.5:1 以上で表示する。
3. The Spot撮影ページ shall 主要な操作ボタンにアクセシブルなラベルを付与し、キーボード操作およびフォーカス表示に対応する。
4. The Spot撮影ページ shall WCAG 2.1 レベル AA の該当基準を満たす。
