# 要件定義書

## プロジェクト概要（入力）
自宅で撮影ページ: トップページからアクセスできる、スポットのQRコード不要でヒメッコとAR撮影ができる単独ページ。UIはスポットカメラページ（/spots/[slug]/camera）と同じ構成（ランディング→AR撮影→プレビュー）を使用。**マーカー不要**で撮影できる（カメラを向けるだけでヒメッコが現れる）。ヒメッコの種類はスポットとは独立して設定する。将来的にはadmin画面からヒメッコ（GLBファイル・ラベル・スケール）を設定可能にする。

## スコープ境界

**対象（α版）:**
- トップページから直接アクセスできるスタンドアロンなAR撮影ページ
- スポットエンティティ・QRコードと無関係に動作する
- スポット撮影と同じUI構成（ランディング → AR撮影 → プレビュー）
- **マーカーレスAR**: マーカー画像不要でヒメッコを画面に表示
- 自宅用ヒメッコは初期デフォルトモデルを使用

**対象外（将来スコープ）:**
- admin画面からの自宅用ヒメッコ設定機能（Requirement 6 を参照）

## 要件

### 1. ページアクセス

訪問者は QR コードやスポット選択なしに、専用の自宅撮影ページへアクセスできる。

**受け入れ基準:**
- 1.1. The 自宅撮影ページ shall be accessible at a dedicated URL without requiring a QR code scan or spot selection.
- 1.2. When a user navigates to the home-camera page, the 自宅撮影ページ shall display the landing screen.

---

### 2. ランディング画面

訪問者がページに到達した際、AR撮影の説明と開始ボタンを確認できる。

**受け入れ基準:**
- 2.1. When the landing screen is displayed, the 自宅撮影ページ shall show a title and description explaining the home AR photography feature.
- 2.2. When the landing screen is displayed, the 自宅撮影ページ shall show a button to start AR shooting.
- 2.3. If the user's browser does not support WebGL or the camera access API, the 自宅撮影ページ shall display a compatibility error message and disable the shooting start button.
- 2.4. When the user taps the shooting start button, the 自宅撮影ページ shall transition to the AR shooting screen.
- 2.5. When the landing screen is displayed, the 自宅撮影ページ shall provide a link to return to the top page.
- 2.6. The landing screen shall NOT display a marker image. Users do not need to prepare any marker to shoot.

---

### 3. AR撮影画面（マーカーレス）

訪問者はカメラを使って、**マーカー不要で**ヒメッコと一緒に写真を撮影できる。

**受け入れ基準:**
- 3.1. When the AR shooting screen is displayed, the 自宅撮影ページ shall request camera access from the user.
- 3.2. If the user denies camera access, the 自宅撮影ページ shall display a camera permission error guide with instructions to re-enable access.
- 3.3. When the AR shooting screen is active, the 自宅撮影ページ shall display the home-camera Himekko character on the live camera feed WITHOUT requiring a physical marker.
- 3.5. While the AR shooting screen is active, the 自宅撮影ページ shall display a capture button.
- 3.6. When the user taps the capture button, the 自宅撮影ページ shall capture a still photo of the AR scene including the Himekko overlay.
- 3.7. While the AR shooting screen is active, the 自宅撮影ページ shall provide a back button to return to the landing screen.
- 3.8. If an AR initialization error occurs, the 自宅撮影ページ shall display an error message and a retry button.

---

### 4. プレビュー画面

訪問者は撮影した写真を確認し、保存・シェア・撮り直しを選択できる。

**受け入れ基準:**
- 4.1. When a photo is captured, the 自宅撮影ページ shall display a preview screen showing the captured image.
- 4.2. When the preview screen is displayed, the 自宅撮影ページ shall provide an option to save the photo to the user's device.
- 4.3. When the user chooses to share the photo, the 自宅撮影ページ shall invoke the Web Share API if the browser supports it, or trigger a file download as a fallback.
- 4.4. When the user chooses to retake the photo, the 自宅撮影ページ shall return to the AR shooting screen.

---

### 5. 自宅用ヒメッコ設定

自宅撮影ページのヒメッコはスポットのヒメッコとは独立して管理される。

**受け入れ基準:**
- 5.1. The 自宅撮影ページ shall display a Himekko character configured independently from any spot-specific Himekko models.
- 5.2. The 自宅撮影ページ shall use a designated default Himekko model (GLB file URL, label, scale) when no administrator configuration has been applied.

---

### 6. 管理者によるヒメッコ設定【将来スコープ・α版対象外】

管理者がadmin画面から自宅撮影用ヒメッコを設定できる（将来リリースで対応）。

**受け入れ基準:**
- 6.1. Where admin Himekko configuration is enabled, the system shall allow administrators to set the home-camera Himekko GLB file URL via the admin screen.
- 6.2. Where admin Himekko configuration is enabled, the system shall allow administrators to set the home-camera Himekko label and display scale via the admin screen.
- 6.3. When an administrator saves updated Himekko settings, the system shall reflect the new model on the home-camera page without requiring a deployment.
