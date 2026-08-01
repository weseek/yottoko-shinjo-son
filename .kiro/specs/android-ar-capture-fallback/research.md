# Gap Analysis: ar-webxr-capture-fallback

## 1. 現状調査サマリー

### 関連する既存資産
- `src/app/camera/_components/HiddenArViewer.tsx` — 非表示(`position:fixed; 1px`)の`<model-viewer>`要素。`ar-modes="scene-viewer quick-look"`を保持し、`onReady`で要素参照を渡すだけ。WebXRイベントの購読は無い。
- `src/app/camera/_components/HomeArExperience.tsx` — `handleArClick`で`el.canActivateAR && el.activateAR()`を呼ぶのみ。起動されたARモードが何かを検知するロジックは無い。
- `src/app/camera/_components/ArModal.tsx` / `ModelViewer.tsx` — AR非対応時の3D専用フォールバック。撮影機能は無い。
- `src/app/spots/[slug]/camera/_components/ArScene.tsx` — **唯一の既存の撮影実装**。MindAR(マーカー画像認識)+Three.jsの自前レンダリングパイプラインで、`<video>`要素(通常のgetUserMedia映像)と`preserveDrawingBuffer:true`なWebGL canvasを2D canvasに合成して`toDataURL()`で静止画化。**WebXRセッションは使用していない**ため、この撮影ロジックはそのまま転用できない。
- `src/app/spots/[slug]/camera/_components/PhotoPreview.tsx` — `CaptureResult{dataUrl, capturedAt}`を受け取るだけの、AR実装方式に依存しないプレビュー/保存/シェア/撮り直しUI。**再利用性が高い**。
- `src/lib/ar/utils.ts`(`canShare`)、`src/lib/ar/share-config.ts`(`SHARE_TEXT`/`SHARE_URL`)、`src/lib/ar/state.ts`(ステータス文言・バリアント判定)— いずれも再利用可能な小さいユーティリティ。
- `<model-viewer>`はCDN読み込みのみ(`@google/model-viewer`はpackage.jsonに存在せず、型定義も無く各コンポーネントで`@ts-expect-error`を個別に書いている)。

### 前回の技術調査で判明している外部制約
- model-viewer 4.0.0の`scene-viewer`対応判定はUser-Agentチェックのみ、`webxr`対応判定は`navigator.xr.isSessionSupported('immersive-ar')`という実判定。
- model-viewerはWebXRの`dom-overlay`機能を公式サポートし、`<model-viewer>`の子要素はAR中にオーバーレイ表示される(メンテナ確認済み)。
- `ar-status`属性/イベント(`not-presenting` / `session-started` / `object-placed` / `failed`)は公式ドキュメントに存在。
- **WebXRセッション中のスクリーンショット/キャプチャは、model-viewer側でも未解決の課題**(関連issue #1481が2023年時点でopenのまま)。「撮影ボタンの完成レシピ」は公式にも存在しない。

## 2. Requirement-to-Asset Map

| Requirement | 既存資産 | ギャップ |
|---|---|---|
| 1. ARモードのフォールバック | `HiddenArViewer.tsx`の`ar-modes`属性 | **Constraint**: 属性値変更のみで済むはず(model-viewer内部が優先順位通りに自動フォールバック)。起動モードの検知手段が無い → **Missing**(ただし`ar-status`購読で解決可能、Low risk) |
| 2. 撮影ボタンの表示 | なし(前例なし) | **Missing**: dom-overlayによる子要素オーバーレイの実装パターンが本コードベースに存在しない。`HiddenArViewer`は「非表示要素」として設計されており、WebXR中は「表示される要素」に構造変更が必要 → **Unknown**: 1pxの親要素スタイルがdom-overlay表示に影響しないか未検証。エラーハンドリングUIは`SpotArExperience.tsx`にインラインで存在するが共通化されていない → **Missing**(移植/共通化が必要) |
| 3. 撮影・プレビュー・保存/シェア | `PhotoPreview.tsx`、`canShare`、`SHARE_TEXT/URL` | プレビュー・保存・シェア・撮り直しは**再利用可能(Low risk)**。しかし**肝心の「WebXRセッション中の静止画キャプチャ」手法が本コードベース・model-viewer公式のいずれにも確立されていない** → **Unknown / High Risk**。既存の`ArScene.tsx`のキャプチャ技法(video要素+WebGL canvas合成)はWebXRセッションには適用できない |
| 4. アクセシビリティ | `ArScene.tsx`の撮影ボタン(72x72px, aria-label)、`PhotoPreview.tsx`のボタン群(16px+, aria-label) | 既存パターンをそのまま適用すれば要件を満たせる(**Low risk**)。ただしdom-overlay内でのCSS適用に制約が無いか要確認 → **Unknown**(軽微) |

## 3. 実装アプローチの選択肢

### Option A: 既存のmodel-viewerベース実装を拡張(推奨)
`HiddenArViewer.tsx`/`HomeArExperience.tsx`に`ar-status`イベント購読とdom-overlay用の子要素(撮影ボタン)を追加し、`PhotoPreview.tsx`等の既存資産をそのまま再利用する。

- ✅ Scene Viewer対応端末・iOSには一切影響しない(要件1.1/1.4を自然に満たす)
- ✅ プレビュー・保存・シェアは`PhotoPreview.tsx`をほぼそのまま再利用できる
- ❌ WebXRセッション中のフレームキャプチャ手法が未確立(Unknown)。この一点が実装全体をブロックするリスクがある
- ❌ `HiddenArViewer`を「非表示要素」から「必要時に表示される要素」へ構造変更する必要がある

### Option B: 自前マーカーレスAR実装への切り替え(非推奨・スコープ外)
`ArScene.tsx`と同様の自前カメラ+Three.js実装を、マーカーではなく平面検出で行う。

- ✅ OS標準AR viewerに依存しない一貫した撮影体験
- ❌ 平面検出(hit-test)は基本的にWebXRのAR Hit Test機能やARCoreのネイティブ機能に依存するため、「WebXRなしの自前平面検出」は技術的に非常に困難
- ❌ 本specで合意済みのスコープ外(`home-camera`spec全面作り直しに相当)

### Option C: Option A + キャプチャ不能時のフォールバック定義
Option Aで進めるが、技術検証でキャプチャが実現不可能と判明した場合の代替UX(例: 「この端末では写真の保存に対応していません」という案内表示、または撮影自体を諦めてAR体験のみ提供)を設計フェーズ用に用意しておく。

- ✅ Req3の技術的不確実性に対するリスク軽減策を事前に持てる
- ✅ 段階的にスコープを調整できる
- ❌ 要件3の受け入れ基準を満たせない可能性があり、事前に関係者との合意形成が必要になる

## 4. 工数・リスク評価

| Requirement | Effort | Risk | 理由 |
|---|---|---|---|
| 1. ARモードのフォールバック | S | Low | 属性値の変更のみ。model-viewerの既存フォールバック機構をそのまま利用 |
| 2. 撮影ボタンの表示 | M | Medium | dom-overlayは公式サポートだが本コードベースに前例なし。`HiddenArViewer`の構造変更とイベント購読の新規実装が必要 |
| 3. 撮影・プレビュー・保存/シェア | L〜XL | **High** | プレビュー/保存/シェアはLow risk(既存資産を再利用)だが、WebXRセッション中のフレームキャプチャ手法自体がmodel-viewer公式でも未解決の課題であり、技術検証なしに工数を見積もれない。最悪、現在のブラウザ実装では実現不可能と判明する可能性がある |
| 4. アクセシビリティ | S | Low | 既存パターン(`ArScene.tsx`/`PhotoPreview.tsx`)を適用するのみ |

## 5. 設計フェーズへの推奨事項

**推奨アプローチ**: Option A。ただし要件3のキャプチャ手法は、設計を書き始める前に**小規模な技術検証(スパイク)**を実施し、実機(Scene Viewer非対応・WebXR対応端末)でXRセッション中のフレームキャプチャが実際に可能かを確認することを強く推奨する。この検証結果次第で設計そのものが変わる(Option Cのフォールバックが必要になる可能性がある)。

**設計フェーズで決めるべき主要事項**:
1. `ar-status`イベントの購読場所(`HiddenArViewer`内部 vs `HomeArExperience`)と、起動モード(scene-viewer/webxr/none)をコンポーネント間でどう伝えるか
2. `HiddenArViewer`を「常時非表示」から「WebXR中のみ表示される要素」へどう構造変更するか
3. WebXRセッション中のフレームキャプチャの具体的な実装方式
4. キャプチャが技術的に不可能と判明した場合のフォールバックUX(Option C)
5. カメラ拒否/AR初期化失敗のエラーハンドリングUIを、`SpotArExperience.tsx`から共通コンポーネントとして切り出すかどうか

**Research Needed(設計フェーズに引き継ぐ未解決事項)**:
1. WebXR immersive-arセッション中に、カメラ映像+3Dモデル合成済みのレンダリング結果を静止画として取得する具体的な技術検証(`gl.readPixels` / `XRWebGLLayer`のframebuffer読み取り / 他の手法)
2. dom-overlayとして表示される要素に、親要素の`position:fixed; 1px`スタイルが影響しないかの実機確認
3. `ar-status`イベント(特に`object-placed`)の発火タイミング・ペイロードが実機・実ブラウザでドキュメント通りに動作するかの確認
4. 対象デバイス母集団の実態(前回調査で「エッジケースだが規模は不明」と判明済み。可能であれば追加の実機テストで再現率を把握)

---

## 6. 追加調査によるピボット: WebXRキャプチャ方式を撤回

上記5節でOption Aを推奨した後、要件定義の議論の中で「WebXRセッション中のフレームキャプチャ」の技術的feasibilityについて追加調査を行った。結論として、**Option A(WebXRベースの実装)は撤回し、Option Bの一部(自前カメラ実装)を、平面検出なしの縮小スコープで採用する**方針に変更した。

### 追加調査で確認できた事実
- `canvas.toDataURL()`のような素朴な方法は、WebXR immersive-arセッション中は専用フレームバッファを経由するため機能しない(実例: PlayCanvas開発者フォーラムで「真っ黒な画像になる」と報告されている)
- 正式な代替手段「WebXR Raw Camera Access」(`XRWebGLBinding.getCameraImage()`)は存在するが、**カメラの生映像しか返さず、3Dモデルとの合成は開発者が自分でWebGLコードを書く必要がある**。完成した実装例は見つからなかった(model-viewer公式issue #1481は2023年時点でも未解決、Needle Engineのフォーラムでも類似の試みがFOVミスマッチで頓挫)
- **さらに重要な事実**: このRaw Camera Access機能自体が内部でARCore(Google Play 開発者サービス AR)に依存している(Chromium Intent-to-Ship文書で確認)。つまり本specが助けたい「ARCore非対応端末」では、この代替手段自体も使えない可能性が高く、手段と対象が構造的に噛み合わない

### 判明した追加の制約: Scene Viewerの成否はWebページ側から検知不能
- Scene Viewerの起動は`intent://`スキームによるネイティブアプリへのハンドオフであり、起動後にScene Viewer内でARが正常に機能したか、3D専用の縮退表示になったかを、Webページ側のJavaScriptから判別する手段が無い(ページはバックグラウンドに退避し、結果に関する情報は一切返ってこない)
- そのため「Scene Viewer非対応端末を自動検知してWebXRにフォールバックする」という当初のRequirement 1は、そもそも実装不可能と判明した

### 新方針
- Scene Viewerへの起動導線は変更しない(既存のUAベース判定・`activateAR()`呼び出しをそのまま使う。現状動いている端末には影響ゼロ)
- Scene Viewer起動後、ページに戻ってきたユーザーに対して「うまく表示されなかった」ことを任意で申告できる、体験を妨げない導線を用意する
- 申告された場合のみ、`ArScene.tsx`と同じ撮影技術(video要素+WebGL canvasをcanvasに合成)を使うが、**マーカー認識や平面検出は行わず、ヒメッコを画面内に固定表示する**シンプルな代替体験に切り替える
- これにより、WebXR固有の未解決課題(フレームキャプチャ)を完全に回避しつつ、`getUserMedia`+WebGLという実績のある技術のみで全Android端末に対して確実に動作する代替手段を提供できる

この方針は`requirements.md`に反映済み。設計フェーズでは、代替体験を新規コンポーネントとして実装するか、`ArScene.tsx`の平面検出・マーカー部分を除いた共通化を検討するかを決定する。

---

## 7. 設計フェーズ: Discovery & Synthesis サマリー

### Discovery(Light、Extension前提)
- `PhotoPreview.tsx`をルートを跨いでimportする前例が既に存在する(`src/app/dev/preview/_components/DevPreviewClient.tsx`が`@/app/spots/[slug]/camera/_components/PhotoPreview`を直接import)。これにより「スポット撮影ページを変更せずに`PhotoPreview.tsx`を再利用する」という設計判断が、本コードベースの既存パターンとして裏付けられた
- `three` (^0.183.2) と `@types/three` は既に`package.json`の依存関係に存在し、新規追加は不要と確認済み

### Synthesis
- **Generalization**: `ArScene.tsx`の撮影処理(video要素+WebGL canvasをオフスクリーンcanvasに合成し`toDataURL()`)を、`compositeCapture(video, canvas)`という汎用関数として抽出可能と判断。ただし`ArScene.tsx`自体の変更はOut of Boundaryのため、抽出した関数は新規コンポーネント側でのみ使用し、`ArScene.tsx`は既存のインライン実装のまま残す(重複は許容)
- **Build vs Adopt**: カメラ映像取得はブラウザ標準の`getUserMedia`を採用(既に`ArScene.tsx`が内部で利用実績あり)。3DレンダリングはThree.js(既存依存)を採用。WebXR・Raw Camera Access APIは、6節の調査により対象端末群と構造的に噛み合わないため明確に不採用とした
- **Simplification**: 代替体験用の状態(`HomeArFallbackState`)は、マーカー追跡が無いため`ArSceneState`の`scanning`/`tracking`フェーズを持たない、専用の小さい型として新規定義する(既存の`ArSceneState`を無理に共用せず、不要なフェーズを持たせない)。ステータス文言のヘルパー関数(`state.ts`相当)も、利用箇所が1つのみのため独立ファイル化せず`HomeArFallbackExperience`内にインラインで持つ

### 設計判断の記録
- `PhotoPreview.tsx`の`src/app/_components/`への移動(共有コンポーネント化)は今回は行わない。既存のクロスルートimportの前例に倣い、現状のパスから直接importする形に留めた(スポット撮影ページへの変更ゼロを優先)
- カメラ拒否・初期化失敗のエラーUIは、`SpotArExperience.tsx`の既存パターン(コピー・レイアウト)を参考にしつつ、新規コンポーネント側に独立して実装する。共通コンポーネント化は本specのOut of Boundaryとの兼ね合いで見送り、将来的な重複解消の余地として`design.md`に記録した

## 8. `/kiro-validate-design` レビュー結果と修正

設計レビューで3件のCritical Issueが指摘され、いずれも設計に反映済み。

1. **検知手段の脆弱性**: 申告リンクの表示を`document.visibilitychange`イベント検知に依存させる当初案は、ブラウザ/端末差で発火しない場合に申告手段自体が失われるリスクがあると指摘された。**修正**: イベント検知を廃止し、申告リンクを常時・控えめに表示する方式に変更(`requirements.md` Requirement 1.1、`design.md` System Flows/HomeArExperienceを更新)。副次効果として実装が大幅に簡素化された
2. **固定表示の挙動が未確定**: スクリーン空間固定か3D空間内固定(視差でズレる)かが未決定だった。**修正**: スクリーン空間固定(device orientation非連動)に決定し、`design.md` Non-Goals・HomeArFallbackSceneに明記
3. **`HomeArExperience.tsx`の責務肥大化**: 検知ロジック追加によるファイル肥大化が懸念された。**結果**: Issue 1の修正(イベント検知の廃止)により、追加される責務が`view`ステートと静的リンクのみとなり、この懸念は実質的に解消された(専用フックへの切り出しは不要と判断)

---

# Gap Analysis: Requirement 5(ヒメッコの位置・向きの操作)追加

## 対象
2026-07-10 に追加された Requirement 5(自動回転の廃止・ドラッグ移動・回転ボタン)について、既存実装済みコード(`HomeArFallbackScene.tsx`)とのギャップを分析する。本 spec は「tasks-generated」フェーズまで完了し大部分のタスクが実装済みのため、これは brownfield(既存実装拡張)のギャップ分析である。

## 1. 現状調査

### 該当ファイルと現状の実装
- `src/app/camera/_components/HomeArFallbackScene.tsx`(190行、新規コンポーネントなし・既存ファイルの改修のみで対応可能)
  - L182-187: `renderer.setAnimationLoop(() => { modelGroup.rotation.y += 0.004; renderer.render(scene, camera); })` — 毎フレーム無条件に回転を加算し続ける。これが「勝手に自転する」原因。ループを廃止し on-demand レンダリングに変更する必要がある
  - L136-143: `PerspectiveCamera` は起動時に一度だけ `position.set(0,0,3)` / `lookAt(0,0,0)` を設定し、以後不変(スクリーン空間固定の前提は維持したまま活用できる)
  - L179: `modelGroup.position.set(0, 0, 0)` — 初期位置は中央固定。Requirement 5.1(初期位置は中央)は現状のまま維持できる
  - L270-282: `<canvas>` に `pointerEvents: "none"` が明示的に設定されている。ドラッグ操作を追加するには `auto` に変更する必要がある(既存コメントに「タップ操作を持たないため」との理由が明記されている箇所を更新する)
  - L285-323: 撮影ボタンは `position: absolute; zIndex: 10` の兄弟要素。canvas の `pointerEvents` を `auto` にしても、ボタンの stacking がタップを奪うため既存の撮影ボタン挙動への影響はない見込み(ただし実機確認が必要)
  - `scene`/`camera`/`modelGroup`/`renderer` は現状 `loadScene()` 内のローカル変数(`useEffect` クロージャ内)であり、外部の React イベントハンドラ(ドラッグ・ボタン)からアクセスできない → ref への昇格が必須

### 参考にできる既存パターン
- `ModelViewer.tsx`: `<model-viewer>` の `auto-rotate` + `camera-controls`(ポインタードラッグでオービット)を使うが、これは別コンポーネント(Google製Webコンポーネント)であり、本 spec の raw three.js 実装には直接転用できない。ただし「ユーザー操作でオービットする」UXの前例として設計判断の参考にした
- ドラッグ処理自体の既存実装は本コードベースに見当たらず(Pointer Events を使った three.js オブジェクトのドラッグは新規パターン)

## 2. Requirement-to-Asset マップ

| Requirement | 現状資産 | ギャップ種別 | 詳細 |
|---|---|---|---|
| 5.1 初期位置は中央 | `modelGroup.position.set(0,0,0)`(既存) | なし | 既存のまま満たされる |
| 5.2 自動回転・自動移動をしない | `setAnimationLoop`の`rotation.y += 0.004`(既存) | **Missing(要修正)** | 現状は要件と逆の動作(自動回転している)。ループ削除+on-demand化が必要 |
| 5.3 ドラッグで移動 | なし | **Missing** | Pointer Events ハンドラ新規実装。canvas の `pointerEvents: none → auto` 変更が前提 |
| 5.4 可動範囲のクランプ | なし | **Missing** | fov・カメラ距離から可視領域を計算するロジックが新規必要。「安全マージン」の具体的な数値(何%か)は Unknown → 実装時に視覚確認しながら調整(Research Needed) |
| 5.5-5.6 回転ボタン | なし(既存の左右矢印UIパターンなし) | **Missing** | 新規ボタンUI。既存の撮影ボタン(L294-322)の視覚パターン(円形・`--color-primary-400`等)を踏襲可能 |
| 4.5 回転ボタンのa11y | 既存の撮影ボタン・戻るボタンが同等基準を満たす実装パターンを持つ | Constraint(パターンあり) | 48x48px・aria-label・コントラスト比の実装パターンは使い回せる |
| 5.7 撮り直し時リセット | `HomeArFallbackExperience.tsx` L132-136 `handleRetake`(既存・`sceneKey`変更で強制再マウント) | なし | 追加実装不要。ref ベースの位置・向き状態はコンポーネント再マウントで自然に初期化される |

## 3. 実装アプローチの選択肢

### Option A: 既存 `HomeArFallbackScene.tsx` を拡張(推奨)
- 対象: 同ファイル内で (1) `setAnimationLoop` のロジック変更、(2) ref昇格、(3) pointer handler 追加、(4) 回転ボタン JSX 追加
- 互換性: `HomeArFallbackSceneProps`(`model`/`onCapture`/`onCameraDenied`/`onError`)は変更不要。既存の呼び出し元(`HomeArFallbackExperience.tsx`)への影響なし
- 複雑性: ファイルは190行から+60〜80行程度の増加が見込まれるが、単一責務(「ヒメッコの固定表示+ユーザー操作」)の範囲内であり分割が必要なほどの肥大化ではない
- ✅ 新規ファイル不要、既存の three.js セットアップ・クリーンアップ処理をそのまま活かせる
- ✅ Boundary(`This Spec Owns`)は`HomeArFallbackScene`のまま変わらない
- ❌ 1ファイルの責務がやや増える(カメラ取得+3D表示+撮影+ドラッグ+回転ボタンの5役)

### Option B: ドラッグ/回転ロジックを別カスタムフックに切り出し
- 例: `useDraggableModel(camera, modelGroup, canvas)` のようなフックを新規作成し、`HomeArFallbackScene.tsx` から呼び出す
- ✅ ロジックの見通しが良くなる、将来的な再利用(スポット撮影側等)に備えられる
- ❌ 現時点で他に利用箇所がなく、本 spec の Boundary(スポット撮影ページ・`ArScene.tsx`等は Out of Boundary)には抽象化の受益者がいない。YAGNI寄りの過剰設計になるリスク

### Option C: ハイブリッド(まずOption Aで実装し、複雑度が実際に問題になった場合のみフック分離)
- 初期実装はOption Aで進め、`kiro-review`/実装後のコードレビューでファイルの見通しが悪いと判断された場合にのみリファクタリングする

**推奨**: Option A(またはOption C的に「まずAで実装」)。理由: Boundaryの原則(既存の`This Spec Owns`範囲内)、再利用先が現時点で存在しないためOption Bの抽象化コストに見合わない。

## 4. Research Needed(設計フェーズへの持ち越し事項)

1. **可動範囲クランプの具体的な係数**: 「可視領域の何%まで動かせるか」は数値実験が必要(実装時に視覚確認しながら調整する前提。design.mdでは「安全マージン」とだけ規定し、正確な係数は実装ノートに記録する運用で良いか要確認)
2. **回転ボタンの配置**: 撮影ボタン(下部中央・72px円形)の左右に配置する案が有力だが、戻るボタン(左上・48px)や既存のUI要素と視覚的に衝突しないか、実装時にレイアウト確認が必要
3. **pointerEvents変更の副作用**: canvasを`auto`にした際、下の`<video>`要素や上の各ボタンのタップ判定に意図しない影響がないか、実機(タッチデバイス)での確認が必要(タスク6.2の完了条件に含めた通り)

## 5. Effort & Risk

- **Effort: S(1〜3日相当)**: 既存ファイル1つの改修が中心。新規ファイル・新規依存関係なし。Pointer Events はブラウザ標準APIで、three.jsの`WebGLRenderer`/`PerspectiveCamera`は既存知識の延長
- **Risk: Low〜Medium**:
  - Low: 技術要素(Pointer Events、three.jsのposition/rotation操作)は既知パターンの組み合わせ
  - Medium要素: スクリーン座標→ワールド座標変換の係数調整と、canvasの`pointerEvents`変更が既存の撮影ボタン等のタップ判定に影響しないことの実機確認が必要(サンドボックス環境では実機タッチ操作の確認ができないため、既存 spec のタスク5.3同様「人間による実機確認が必須」になる見込み)

## 推奨(設計フェーズへ)
- Option A(既存`HomeArFallbackScene.tsx`拡張)を前提に設計を進める
- 可動範囲クランプの係数・回転ボタンの正確な配置は実装時に確定させ、design.md上は方針レベルの記述に留める(既に反映済み)
- 実機でのポインター操作確認をタスクの完了条件に含める(既にtasks.md 6.2/6.4に反映済み)

---

# Gap Analysis: Requirement 6(ヒメッコの拡大縮小操作)追加

## 対象
2026-07-10 に追加された Requirement 6(2本指ピンチによる拡大縮小)について、既存実装(task 6.1-6.4で追加したドラッグ移動・回転ボタン)とのギャップを分析する。

## 1. 現状調査

- `src/app/camera/_components/HomeArFallbackScene.tsx`
  - L276-289 `handlePointerDown`: `dragStateRef`に単一の`pointerId`・開始座標・開始モデル座標のみを保持する実装。複数ポインターの同時追跡は行っていない
  - L292-338 `handlePointerMove`: `dragStateRef.current.pointerId !== event.pointerId`のときは即returnする単一ポインター前提のガードがあり、2本目の指のPointer Eventは現状無視される(＝現状は2本指操作をしても何も起きず、実害はないが機能もない)
  - L340-348 `handlePointerUp`/`onPointerCancel`: 該当`pointerId`が一致した場合のみ`dragStateRef`をクリア
  - `render()`(L67-74)は`sceneRef`/`perspectiveCameraRef`/`modelGroupRef`/`rendererRef`を参照してon-demand描画する既存の仕組みがそのまま再利用できる
  - `modelGroup.scale.set(s, s, s)`(L217付近、`model.scale ?? 1`)は現状ロード時に一度だけ設定され、以後変更されない。ピンチでの拡大縮小はこの`scale`を動的に変更する形になる

## 2. Requirement-to-Asset マップ

| Requirement | 現状資産 | ギャップ種別 | 詳細 |
|---|---|---|---|
| 6.1-6.3 ピンチで拡大縮小 | 単一ポインター前提の`dragStateRef` | **Missing** | 複数ポインターを`Map`で管理する仕組みが新規に必要。既存のPointer Eventsハンドラの拡張で対応可能(新規イベント種別の追加は不要) |
| 6.4 スケール範囲のクランプ | なし(`scale`は起動時に一度設定されるのみ) | **Missing** | 基準スケール(`model.scale ?? 1`)を保持するrefと、クランプ係数(暫定0.5〜2.5倍)が新規に必要 |
| 6.5 ピンチ中はドラッグを併発させない | `handlePointerMove`が単一ポインター前提のため、実質的に「2本目は無視される」形で偶発的に満たされているが、意図した排他制御ではない | **Missing(意図的な実装が必要)** | 2本目の`pointerdown`検出時に`dragStateRef`を明示的に破棄する処理が必要 |
| 6.6 撮り直し時のスケールリセット | `HomeArFallbackExperience`の`sceneKey`remount(既存) | なし | 5.7と同じ仕組みでスケールもrefごと初期化されるため追加実装不要 |

## 3. 実装アプローチの選択肢

### Option A: 既存のPointer Eventsハンドラを拡張(推奨)
- `dragStateRef`を単一ドラッグ用に残しつつ、新たに`activePointersRef`(`Map<number, {x, y}>`)と`pinchStateRef`(開始距離・開始スケール)を追加し、同じ`onPointerDown`/`onPointerMove`/`onPointerUp`/`onPointerCancel`内で分岐する
- ✅ 新規のイベントリスナー・新規DOM要素が不要。task 6.1-6.4の実装パターンをそのまま踏襲できる
- ✅ Boundaryは引き続き`HomeArFallbackScene`のみ
- ❌ 1つのハンドラ関数が「ドラッグ」と「ピンチ」の2つのモードを分岐する分、やや複雑になる(ただし責務は依然「ポインター入力→モデル変換」の範囲内)

### Option B: ドラッグとピンチを別々のカスタムフックに分離
- 例: `usePointerDrag`と`usePinchZoom`を切り出す
- ✅ 関心の分離という点では綺麗
- ❌ 両者は同じ`activePointersRef`を参照する必要があり(ポインター数で排他制御するため)、完全に独立したフックにはできず、結局密結合な状態管理を共有インターフェース越しに行うことになる。現時点で他に再利用箇所がなく、抽象化コストに見合わない(前回のRequirement 5のgap分析と同じ結論)

**推奨**: Option A。既存のtask 6.1-6.4の実装方針(単一ファイル内でrefベースの状態管理を拡張)と一貫しており、再利用の受益者もいないため追加の抽象化は不要。

## 4. Research Needed
1. スケールクランプ係数(0.5〜2.5倍)は暫定値。実機での視覚確認が必要(Requirement 5.4のクランプ係数と同様の性質の未確定値)
2. 3本指以上の誤操作時の挙動(最初の2点のみ追跡する設計だが、実機のマルチタッチ挙動は要確認)

## 5. Effort & Risk
- **Effort: S(1〜3日相当)**: 既存ファイル1つ(`HomeArFallbackScene.tsx`)の拡張のみ。新規依存関係なし
- **Risk: Low**: Pointer Events APIの複数ポインター管理は標準的なパターンであり、既存のドラッグ実装からの延長線上。ただし実機でのマルチタッチ挙動確認は必須(task 7.3のスコープ)

## 推奨(設計フェーズへ)
- Option A(既存Pointer Eventsハンドラの拡張)を前提に設計を進める(design.md既に反映済み)
- スケールクランプ係数は実装時の視覚確認で微調整可とする(design.md既に反映済み)

---

# Light Discovery: Requirement 7 操作方法ガイドの表示

## 1. Extension Point Analysis
- カメラアクセス要求(`navigator.mediaDevices.getUserMedia`)は`HomeArFallbackScene`の`useEffect`内、マウント直後に呼ばれる(HomeArFallbackScene.tsx L2.1実装箇所)。このコンポーネント自体を条件付きレンダリングでマウントさせないことが、「ガイドを閉じるまでカメラアクセスを要求しない」(7.4)を実現する最も単純な手段であることを確認した(`HomeArFallbackScene`側のコード変更は不要)
- `HomeArFallbackExperience.tsx`は既に`HomeArFallbackState`(`idle`/`camera-denied`/`error`等)に基づく排他的な条件付きレンダリング(`showScene`/`showCameraDeniedGuide`/`showErrorRetry`/`showPreview`)を持っており、同じパターンに`guide`フェーズを追加するだけで実装できることを確認(既存パターンの踏襲、新規アーキテクチャ不要)
- 既存の「カメラ拒否ガイド」「エラー+リトライ」オーバーレイ(いずれもインラインJSX、`zIndex: 15`、`rgba(30, 28, 25, 0.85)`背景、`var(--color-neutral-0)`カード)が、今回追加するガイドと視覚的に同種のパターンであることを確認。ただし`HomeArFallbackExperience.tsx`は現時点で373行(2026-07-13時点)あり、これ以上インラインオーバーレイを増やすと単一ファイルの責務が肥大化するため、今回は`CapturedPhotoPreview.tsx`と同様に別コンポーネントファイル(`OperationGuide.tsx`)に切り出す方針とした(design.md Architecture Integration参照)
- 撮り直し(`handleRetake`)は既存で`sceneKey`をインクリメントしつつ`phase: "idle"`にしていたが、7.5(撮り直し時にガイド再表示)を満たすには遷移先を`phase: "guide"`に変えるだけでよく、`sceneKey`側のロジックは変更不要であることを確認

## 2. Dependency Check
- アイコン: 移動(一本指ドラッグ)・拡大縮小(二本指ピンチ)を表す既存アイコンはリポジトリ内に無い(`scripts/gen-icons.mjs`のNAMESに未登録)。`node_modules/@iconify-json/material-symbols/icons.json`を実際に確認し、`open-with`(4方向矢印、移動の標準的な表現)と`pinch-outline`が実在することを確認済み(他の候補: `pinch`/`pinch-outline-rounded`/`pinch-outline-sharp`/`pinch-rounded`もあるが、既存の`rotate-left`/`no-photography-outline`等と同じ`-outline`系の line スタイルに揃えるため`pinch-outline`を採用)。回転は既存の`rotate-right`アイコンをそのまま流用できる(新規アイコン追加はopen-with・pinch-outlineの2件のみ)
- `@iconify-json/material-symbols`はdevDependenciesとして既に導入済み(既存の`rotate-left`/`rotate-right`追加時と同じ`scripts/gen-icons.mjs`実行フローで追加可能。新規パッケージ追加は不要)

## 3. Integration Risk Assessment
- 既存機能への影響: `HomeArFallbackScene`自体は無変更のため、ドラッグ・ピンチ・回転ボタン・撮影・プレビューの既存動作に副作用はない
- パフォーマンス: 追加コンポーネントは静的なカード1枚(アイコン+テキスト+ボタン)のみで、Three.js/WebGLレンダリングには関与しない。パフォーマンス上の懸念なし
- テスト: 本プロジェクトにはテストランナー未導入(既存の制約、Implementation Notes参照)のため、型チェック・lintと実機確認で品質を担保する方針を踏襲する

## Output Summary
- 統合アプローチ: `HomeArFallbackState`に`guide`フェーズを追加し、`HomeArFallbackExperience`側の条件付きレンダリングでカメラアクセス要求(`HomeArFallbackScene`のマウント)を遅延させる。新規コンポーネント`OperationGuide.tsx`は状態を持たない表示専用
- 変更/新規ファイル: `HomeArFallbackExperience.tsx`(変更)、`OperationGuide.tsx`(新規)、`src/lib/ar/types.ts`(変更)、`scripts/gen-icons.mjs` + `material-symbols.generated.ts`(変更、アイコン2件追加)
- 新規依存: なし(既存の`@iconify-json/material-symbols`からアイコン2件を追加登録するのみ)
- リスク: Low(既存パターンの組み合わせ、`HomeArFallbackScene`本体は無変更)
