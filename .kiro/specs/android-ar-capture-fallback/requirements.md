# Requirements Document

## Introduction
自宅撮影ページ(`/camera`)は、来村者がQRコードやスポット選択なしにキャラクター「ヒメッコ」とAR記念撮影ができる機能である。Android端末では端末標準のAR viewer(Scene Viewer)の起動を試みるが、ARCoreに対応していない一部の端末では、カメラが起動せず撮影ボタンも表示されない3D専用の縮退画面になってしまう。Webページ側からは、Scene Viewerが実際に正常なAR体験を提供できたかどうかを検知する手段が無く、事前に自動判定して切り替えることはできない(検証の詳細は`research.md`を参照)。

本specは、Scene Viewerの起動導線自体は変更せず、起動後にユーザー自身の申告によって上手くいかなかったことが分かった場合に、確実に動作する代替のAR撮影体験(カメラ映像上にヒメッコを固定表示し、その場で撮影できる)へ切り替える導線を提供することを目的とする。この代替体験は、既存のスポット撮影ページで実証済みの撮影技術(カメラ映像とレンダリング結果をcanvasに合成して静止画化する手法)を踏襲する。

## Boundary Context
- **In scope**: Scene Viewer起動後にユーザーが「うまく表示されなかった」と申告した場合の、代替AR撮影体験(カメラ映像への固定表示＋撮影＋プレビュー＋保存/シェア)への切り替え。代替体験内でのヒメッコの位置(ドラッグ移動)・向き(回転ボタン)・大きさ(2本指ピンチ)のユーザー操作。カメラへのアクセスを許可する前に、これらの操作方法(移動・回転・拡大縮小)をユーザーへ説明するガイド表示
- **Out of scope**:
  - iOS(Quick Look)の挙動変更
  - Scene Viewerの起動ロジック自体の変更(既存の判定・起動呼び出しは変更しない)
  - Scene Viewerが正常動作する端末に対して、体験を妨げる確認ダイアログ等を強制すること(成功時は極力今と同じ体験を保つ)
  - WebXRを用いた実装(技術検証の結果、対象端末群では現実的でないと判断したため採用しない。詳細は`research.md`参照)
  - 平面検出・床への設置(代替体験ではヒメッコは画面内に固定表示され、床の検出は行わない。ユーザーによる位置・向き・大きさの操作はスクリーン空間内の2D的な移動・回転・拡大縮小に限る)
  - スポット撮影ページ(`/spots/[slug]/camera`)の変更
  - 自宅撮影ページ全体を自前AR方式へ全面移行する対応(別途検討)
  - 2本指ピンチ以外の拡大縮小手段(ボタン等)の追加(今回はユーザー指定の2本指ピンチジェスチャーのみを対象とする)
  - 操作ガイドの表示要否をユーザーが恒久的に設定できる機能(「次回から表示しない」等)の追加(今回は毎回表示のみを対象とする)
- **Adjacent expectations**: 代替体験の撮影→プレビュー→保存/シェアのUXは、スポット撮影ページで既に実装されている挙動(保存はWeb Share API優先・ダウンロードフォールバック、シェアはWeb Share API、撮り直しで撮影に戻る)と一致させる

## Requirements

### Requirement 1: AR結果の確認と代替体験への切り替え
**Objective:** As a Androidで自宅撮影ページを使う訪問者, I want Scene Viewerでの撮影がうまくいかなかった場合に代替の撮影方法へ切り替えられる, so that 端末の対応状況に関わらずAR記念撮影を完了できる

#### Acceptance Criteria
1. The 自宅撮影ページ shall provide an unobtrusive, always-available way for the user to indicate that AR photography did not display correctly, positioned near the button that launches the platform's native AR viewer.
2. When the user indicates that AR photography did not display correctly, the 自宅撮影ページ shall switch to a fallback AR photography experience.
3. The 自宅撮影ページ shall not require the user to indicate a problem before continuing to use the platform's native AR viewer, and shall not block or interrupt that flow with a mandatory confirmation.
4. The 自宅撮影ページ shall not change the existing behavior for launching the platform's native AR viewer (Scene Viewer on Android, Quick Look on iOS).

### Requirement 2: 代替AR撮影体験
**Objective:** As a Scene Viewerが利用できない端末を持つ訪問者, I want カメラ映像の上にヒメッコが表示された状態で撮影できる, so that 端末の対応状況に関わらず記念撮影ができる

#### Acceptance Criteria
1. When the fallback AR photography experience starts, the 自宅撮影ページ shall request camera access from the user.
2. If the user denies camera access, the 自宅撮影ページ shall display a camera permission error guide with instructions to re-enable access.
3. While the fallback AR photography experience is active, the 自宅撮影ページ shall display the ヒメッコキャラクター overlaid on the live camera feed.
4. While the fallback AR photography experience is active, the 自宅撮影ページ shall display a capture button.
5. While the fallback AR photography experience is active, the 自宅撮影ページ shall provide a way to return to the previous screen.
6. If camera access or AR initialization fails in the fallback experience, the 自宅撮影ページ shall display an error message and a retry option.

### Requirement 3: 撮影・プレビュー・保存/シェア
**Objective:** As a 代替AR撮影体験を利用する訪問者, I want 撮影した写真を確認し、保存・シェア・撮り直しができる, so that スポット撮影と同じように写真を持ち帰ったりSNSでシェアできる

#### Acceptance Criteria
1. When the user taps the capture button, the 自宅撮影ページ shall capture a still image containing both the live camera background and the overlaid ヒメッコキャラクター.
2. When a photo has been captured, the 自宅撮影ページ shall display a preview screen showing the captured image.
3. When the preview screen is displayed, the 自宅撮影ページ shall provide an option to save the photo to the user's device.
4. When the user chooses to share the photo, the 自宅撮影ページ shall invoke the Web Share API if supported by the browser, or trigger a file download as a fallback.
5. When the user chooses to retake the photo, the 自宅撮影ページ shall return to the fallback AR photography experience so the user can capture again.

### Requirement 4: アクセシビリティ
**Objective:** As a 幅広い年齢層(高齢者を含む)の訪問者, I want 新しく追加されるUIが既存のアクセシビリティ基準を満たしている, so that 年齢や視力に関わらず操作できる

#### Acceptance Criteria
1. The capture button and the "うまく表示されなかった" indication control shall each have a minimum tap target size of 48x48 pixels.
2. The capture button and each action button on the preview screen (save, share, retake) shall have a descriptive accessible label.
3. All text displayed in the newly added UI shall use a minimum font size of 16 pixels with a line height of at least 1.5.
4. All text and interactive elements in the newly added UI shall meet a color contrast ratio of at least 4.5:1.
5. The ヒメッコ rotate controls (Requirement 5) shall each have a minimum tap target size of 48x48 pixels and a descriptive accessible label.
6. The dismiss control of the operation guide (Requirement 7) shall have a minimum tap target size of 48x48 pixels and a descriptive accessible label.

### Requirement 5: ヒメッコの位置・向きの操作
**Objective:** As a 代替AR撮影体験を利用する訪問者, I want ヒメッコの表示位置と向きを自分で操作できる, so that 好きな構図・向きで記念撮影ができる

#### Acceptance Criteria
1. When the fallback AR photography experience starts or restarts, the 自宅撮影ページ shall position ヒメッコ at the center of the screen.
2. The 自宅撮影ページ shall not automatically rotate or move ヒメッコ; ヒメッコ shall remain stationary until the user interacts with it.
3. When the user drags ヒメッコ with a single finger or the mouse, the 自宅撮影ページ shall move ヒメッコ to follow the drag within the visible camera view.
4. The 自宅撮影ページ shall constrain the draggable range so that ヒメッコ cannot be moved fully off-screen or behind the capture button.
5. While the fallback AR photography experience is active, the 自宅撮影ページ shall provide dedicated controls for the user to rotate ヒメッコ's facing direction left and right.
6. When the user activates a rotate control, the 自宅撮影ページ shall rotate ヒメッコ by a fixed increment in the corresponding direction.
7. When the user retakes a photo (returns to the fallback AR photography experience from the preview screen), the 自宅撮影ページ shall reset ヒメッコ's position and orientation back to the initial centered state.

### Requirement 6: ヒメッコの拡大縮小操作
**Objective:** As a 代替AR撮影体験を利用する訪問者, I want ヒメッコの大きさを2本指のピンチ操作で変えられる, so that 好きな構図で記念撮影ができる

#### Acceptance Criteria
1. While the fallback AR photography experience is active, the 自宅撮影ページ shall allow the user to resize ヒメッコ using a two-finger pinch gesture.
2. When the user pinches outward (two touch points moving apart), the 自宅撮影ページ shall increase ヒメッコ's size proportionally to the pinch distance change.
3. When the user pinches inward (two touch points moving together), the 自宅撮影ページ shall decrease ヒメッコ's size proportionally to the pinch distance change.
4. The 自宅撮影ページ shall constrain the resulting size so that ヒメッコ cannot be scaled below a minimum or above a maximum multiple of its default size.
5. When a two-finger pinch gesture begins, the 自宅撮影ページ shall not also move ヒメッコ's position as if it were a single-finger drag (Requirement 5.3).
6. When the fallback AR photography experience starts or restarts (including after retaking a photo), the 自宅撮影ページ shall reset ヒメッコ's size back to its initial default size.

### Requirement 7: 操作方法ガイドの表示
**Objective:** As a 代替AR撮影体験を利用する訪問者, I want カメラへのアクセスを許可する前にヒメッコの操作方法(移動・回転・拡大縮小)の説明を確認できる, so that カメラ許可を求められる前に主要な操作方法を理解した上で撮影に臨める

#### Acceptance Criteria
1. When the fallback AR photography experience starts, the 自宅撮影ページ shall display an operation guide before requesting camera access.
2. The operation guide shall describe that the user can move ヒメッコ with a single-finger drag, resize ヒメッコ with a two-finger pinch gesture, and rotate ヒメッコ using the on-screen rotate controls.
3. The 自宅撮影ページ shall provide a control for the user to dismiss the operation guide and proceed toward the camera access request.
4. While the operation guide is displayed, the 自宅撮影ページ shall not request camera access.
5. When the user retakes a photo and the fallback AR photography experience restarts, the 自宅撮影ページ shall display the operation guide again before requesting camera access.
