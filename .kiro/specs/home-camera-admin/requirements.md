# 要件定義書

## プロジェクト概要（入力）
管理者が自宅でひめっこ撮影のARモデルをadmin画面から設定できる機能。
既存のスポット管理（Spot モデル）と同様に、自宅撮影専用の設定エンティティ（HomeCameraConfig）をPrismaに追加し、next-adminの「コンテンツ管理」グループに「自宅でひめっこ撮影」として追加する。
設定項目はGLBファイルURL（arAssetUrl）・ラベル・スケール・.mindファイルURL（mindFileUrl）・マーカー画像URL（markerImageUrl）。
現在 src/app/camera/page.tsx はハードコードの定数（HOME_MODEL, HOME_TARGET）を使っており、これをDB値にフォールバックつきで切り替える。
既存の home-camera スペック（.kiro/specs/home-camera/）のRequirement 6（admin設定・将来スコープ）を実装するもの。

## 境界コンテキスト

- **対象（In scope）**: 自宅撮影AR設定エンティティのadmin管理（作成・編集）、自宅撮影ページ（`/camera`）でのDB設定参照とフォールバック
- **対象外（Out of scope）**: スポット撮影ページ・コンポーネントの変更、`HomeArExperience`・`ArScene`・`ArLanding`・`PhotoPreview` の改修、訪問者向けUI変更
- **隣接期待（Adjacent expectations）**: 自宅撮影ページは既存の home-camera スペック（Req 1〜5）で定義された訪問者体験を維持すること

## 要件

### 要件1: admin画面への「自宅でひめっこ撮影」設定追加

**Objective:** As a 管理者, I want to access a dedicated "自宅でひめっこ撮影" management section in the admin panel, so that I can configure the home camera AR settings from a familiar interface.

#### 受け入れ基準

1. When an administrator navigates to the admin panel, the 管理システム shall display "自宅でひめっこ撮影" within the コンテンツ管理 sidebar group.
2. When an administrator opens the 自宅でひめっこ撮影 management screen, the 管理システム shall display the current home camera AR configuration.
3. The 管理システム shall manage a single shared AR configuration for the home camera page.
4. When an administrator creates or edits the configuration, the 管理システム shall allow setting the AR model label.
5. When an administrator creates or edits the configuration, the 管理システム shall allow setting the AR model display scale.

---

### 要件2: ARモデル（GLBファイル）の設定

**Objective:** As a 管理者, I want to set the 3D model GLB file for the home camera page, so that I can change which Himekko character appears without a code deployment.

#### 受け入れ基準

1. When an administrator creates or edits the home camera configuration, the 管理システム shall allow setting the AR model GLB file URL.
2. If the AR model GLB file URL is not set, the 管理システム shall use the default GLB file (`/assets/himekko.glb`) for the home camera page.

---

### 要件3: ARマーカー（.mindファイル・マーカー画像）の設定

**Objective:** As a 管理者, I want to set the AR marker .mind file and reference image for the home camera page, so that the AR recognition target can be updated independently of the code.

#### 受け入れ基準

1. When an administrator creates or edits the configuration, the 管理システム shall allow uploading or specifying the URL of the .mind file for AR marker recognition.
2. When an administrator creates or edits the configuration, the 管理システム shall allow uploading or specifying the marker reference image URL（任意）.
3. If the .mind file URL is not set, the 管理システム shall use the default .mind file (`/assets/targets/demo.mind`) for the home camera page.

---

### 要件4: ファイルアップロード対応

**Objective:** As a 管理者, I want to upload .mind files and marker images directly from the admin screen, so that I can update AR assets without needing separate file hosting.

#### 受け入れ基準

1. When an administrator uploads a .mind file via the admin screen, the 管理システム shall store the file and populate the .mind file URL field in the configuration.
2. When an administrator uploads a marker image via the admin screen, the 管理システム shall store the image and populate the marker image URL field in the configuration.

---

### 要件5: 自宅撮影ページへの設定反映

**Objective:** As a 管理者, I want the home camera page to automatically use the configuration I saved, so that AR model changes take effect for visitors without a deployment.

#### 受け入れ基準

1. When a visitor accesses the home camera page and an administrator configuration exists, the 自宅撮影ページ shall use the configured AR model GLB file URL, label, and scale.
2. When a visitor accesses the home camera page and an administrator has configured a .mind file URL, the 自宅撮影ページ shall use the configured .mind file for AR marker recognition.
3. If no administrator configuration exists, the 自宅撮影ページ shall display the home camera AR experience using default values（デフォルトGLBファイル・デフォルト.mindファイル）.
4. When an administrator saves an updated configuration, the 自宅撮影ページ shall reflect the changes without requiring a code deployment.
