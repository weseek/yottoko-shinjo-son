# Implementation Plan

- [ ] 1. Foundation: 共有ユーティリティと型の追加
- [x] 1.1 (P) compositeCapture共有ユーティリティの実装
  - `src/lib/ar/capture.ts` に、`<video>`要素とレンダリング済みcanvasを合成し`image/png`のdata URLを返す純粋関数を実装する
  - `ArScene.tsx`の既存の合成手順(video描画→canvas描画→`toDataURL()`)と同じ手法を踏襲する。`ArScene.tsx`自体は変更しない
  - 本プロジェクトにはテストランナーが存在しないため、自動テストは書かない(下部Implementation Notes参照)。型チェック(`tsc`相当のNext.jsビルド)と、`HomeArFallbackScene`からの実際の呼び出し結果で動作を確認する
  - 観測可能な完了条件: `compositeCapture(video, canvas)`が`image/png`形式のdata URL文字列を返す関数として実装され、型チェック・lintが通ること
  - _Requirements: 3.1_
  - _Boundary: compositeCapture_

- [x] 1.2 (P) HomeArFallbackState型の追加
  - `src/lib/ar/types.ts` に `idle` / `camera-requesting` / `camera-denied` / `initializing` / `ready` / `capturing` / `error` のユニオン型`HomeArFallbackState`を追加する
  - 既存の`ArSceneState`は変更しない(マーカー追跡専用のフェーズを持たない別の型として定義)
  - 観測可能な完了条件: `HomeArFallbackState`型がexportされ、型チェックが通ること
  - _Requirements: 2.1, 2.2, 2.6_
  - _Boundary: lib/ar/types.ts_

- [ ] 2. Core: 代替AR撮影シーン(カメラ映像取得とヒメッコ固定表示)
- [x] 2.1 カメラ映像取得と許可拒否時のハンドリング
  - `HomeArFallbackScene`で`navigator.mediaDevices.getUserMedia({video: {facingMode: "environment"}})`を呼び、`<video>`要素にストリームを流す
  - 許可拒否時は例外をキャッチし、コールバックで親(`HomeArFallbackExperience`)に伝える(ガイドUI自体はタスク3.1側で実装)
  - 観測可能な完了条件: カメラ許可時に`<video>`にライブ映像が表示され、拒否時は親コンポーネントにエラー状態が伝播すること
  - _Requirements: 2.1_
  - _Boundary: HomeArFallbackScene_

- [x] 2.2 ヒメッコのスクリーン空間固定表示レンダリング
  - `three`の`WebGLRenderer`(`preserveDrawingBuffer: true`, `alpha: true`)とGLTFLoaderで、ヒメッコモデルをロードし表示する
  - カメラは起動時に設定した固定視点を保持し、device orientation・平面検出と連動させない(スクリーン空間固定)。ライティングは`ArScene.tsx`と同様のAmbientLight/DirectionalLightを設定する
  - タップ領域や視認性に影響しないよう、モデル表示領域とカメラ映像の重なりを確認する(4.3, 4.4の土台)
  - 観測可能な完了条件: カメラ映像の上にヒメッコモデルが表示され、端末を動かしてもモデルの画面上の位置・大きさが変化しないこと
  - _Requirements: 2.3_
  - _Boundary: HomeArFallbackScene_
  - _Depends: 2.1_

- [x] 2.3 撮影ボタンとcompositeCaptureの統合、リソース解放
  - タップ領域48x48px以上・`aria-label`付きの撮影ボタンを表示する
  - タップ時に`compositeCapture(video, glCanvas)`を呼び、結果を`onCapture(CaptureResult)`で親に渡す
  - アンマウント時に`MediaStreamTrack.stop()`と`renderer.setAnimationLoop(null)`を確実に呼び、カメラとレンダーループを解放する
  - 観測可能な完了条件: 撮影ボタンタップで`CaptureResult{dataUrl, capturedAt}`が親に渡され、コンポーネントのアンマウント後にカメラの使用中インジケータが消えること
  - _Requirements: 2.4, 3.1_
  - _Boundary: HomeArFallbackScene_
  - _Depends: 1.1, 2.2_

- [ ] 3. Core: 代替AR体験の状態管理とエラーハンドリング
- [x] 3.1 状態管理とエラーUIの実装
  - `HomeArFallbackState`に基づき、`HomeArFallbackScene`をラップして状態(カメラ許可待ち/拒否/初期化中/準備完了/撮影中/エラー)を管理する
  - カメラ拒否時に「カメラの許可が必要です」ガイド(`SpotArExperience.tsx`と同様のコピー・レイアウトを参考に独立実装、タップ領域48x48px以上・16px以上のテキスト)、初期化失敗時にエラーメッセージ+リトライボタンを表示する
  - 観測可能な完了条件: カメラ拒否時に許可ガイドが表示され、初期化失敗時にリトライボタンをタップすると`HomeArFallbackScene`が再マウントされること
  - _Requirements: 2.2, 2.6_
  - _Boundary: HomeArFallbackExperience_
  - _Depends: 1.2, 2.1, 2.2, 2.3_

- [x] 3.2 撮影結果のプレビュー統合と保存/シェア/撮り直し導線の接続
  - 撮影完了(`CaptureResult`受領)時に、既存の`PhotoPreview`(`@/app/spots/[slug]/camera/_components/PhotoPreview`から既存パスのままimport)を表示する
  - 撮り直し時は`HomeArFallbackScene`に戻り、戻る操作で親(`HomeArExperience`)に画面を戻すコールバックを呼ぶ(戻るボタンはタップ領域48x48px以上・`aria-label`付き)
  - 観測可能な完了条件: 撮影後に`PhotoPreview`が表示され、保存/シェア/撮り直しの各ボタンが機能し、戻る操作で自宅撮影ページのホーム画面に戻ること
  - _Requirements: 2.5, 3.2, 3.3, 3.4, 3.5_
  - _Boundary: HomeArFallbackExperience_
  - _Depends: 3.1_

- [ ] 4. Integration: 自宅撮影ページへの申告導線と画面切り替えの統合
- [x] 4.1 常時表示の申告リンクUIの追加
  - `HomeArExperience.tsx`の「AR で撮影する」ボタン付近に、常時・控えめに表示される申告リンク/ボタン(例:「うまく表示されなかった方はこちら」)を追加する。イベント検知(`visibilitychange`等)は使用せず、Android/iOS/`canActivateAR`の値に関わらず一律で表示する
  - タップ領域48x48px以上、`aria-label`、16px以上のテキスト/行間1.5以上、コントラスト比4.5:1以上を満たす
  - 観測可能な完了条件: ページ読み込み直後から申告リンクが常に表示され、既存の「AR で撮影する」ボタンの動作(`handleArClick`)に変化がないこと
  - _Requirements: 1.1_
  - _Boundary: HomeArExperience_

- [x] 4.2 申告リンクから代替体験への画面切り替えの接続
  - `HomeArExperience.tsx`に`view: "home" | "fallback"`ステートを追加し、申告リンクタップで`HomeArFallbackExperience`を表示する
  - 既存の`handleArClick`(`canActivateAR && activateAR()`)のロジックは変更しない
  - 観測可能な完了条件: 申告リンクをタップすると`HomeArFallbackExperience`の画面に切り替わり、Scene Viewer/Quick Lookの起動導線には何の変化もないこと
  - _Requirements: 1.2, 1.3, 1.4_
  - _Boundary: HomeArExperience_
  - _Depends: 3.2, 4.1_

- [ ] 5. Validation: アクセシビリティ・回帰・実機検証
- [x] 5.1 (P) アクセシビリティ基準の確認
  - 新規UI(申告リンク・撮影ボタン・プレビュー画面各ボタン・カメラ拒否ガイド・リトライボタン)について、タップ領域48x48px以上、`aria-label`等のアクセシブルラベル、フォントサイズ16px以上/行間1.5以上、コントラスト比4.5:1以上を確認する
  - 観測可能な完了条件: 全新規インタラクティブ要素がWCAG AA相当の基準を満たしていることをチェックリストで確認できること
  - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - _Boundary: HomeArExperience, HomeArFallbackScene, HomeArFallbackExperience(読み取り専用の確認作業)_
  - _Depends: 4.2_

- [x] 5.2 (P) 既存経路の回帰確認
  - Scene Viewer対応端末でのAR撮影、iOSのQuick Look、`canActivateAR`がfalseの場合の既存`ArModal`表示のいずれも、本spec実装前と同一の挙動であることを確認する
  - 観測可能な完了条件: 上記3経路について、実装前後で挙動に差分が無いことが確認できること
  - _Requirements: 1.4_
  - _Boundary: HomeArExperience(読み取り専用の確認作業)_
  - _Depends: 4.2_

- [ ] 5.3 (P) Android実機での一連の代替体験フローの検証
  - Scene Viewer非対応端末(3D専用の縮退表示になる端末)で、申告リンク→カメラ許可→ヒメッコ表示→撮影→プレビュー→保存/シェアの一連の流れをE2Eで確認する
  - カメラ拒否・初期化失敗時のエラー導線も実機で確認する
  - 観測可能な完了条件: 対象端末で一連のフローが最後まで完了し、保存またはシェアが実行できること
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5_
  - _Boundary: HomeArExperience, HomeArFallbackScene, HomeArFallbackExperience(読み取り専用の確認作業)_
  - _Depends: 4.2_
  - _Blocked: 物理的なAndroid実機(Scene Viewer非対応端末)とカメラアクセスが必要で、この開発環境(サンドボックス)には存在しない。コード上の検証(1.1-5.2で実施済み: 型チェック・lint・アクセシビリティ計算・回帰diff確認)はすべて完了しているが、実際のカメラ許可ダイアログ・getUserMediaの挙動・撮影画像の見た目・保存/シェアの実機動作は、対象端末を持つ人(会話冒頭で画面共有していた同僚等)による手動確認が必要。人間による実施が必須_

- [x] 6. Enhancement: ヒメッコの位置・向きのユーザー操作(自動回転の廃止・ドラッグ移動・回転ボタン)
- [x] 6.1 自動回転の廃止とon-demandレンダリングへの変更
  - `HomeArFallbackScene`の`setAnimationLoop`内で毎フレーム`modelGroup.rotation.y`を加算していた自動回転処理を削除する
  - `scene`/`camera`/`modelGroup`/`renderer`を`useEffect`内のローカル変数からrefに昇格させ、ドラッグ・回転ボタンのハンドラ(6.2, 6.3)から参照・`renderer.render(scene, camera)`の呼び出しができるようにする
  - モデルロード完了時・リサイズ時に一度だけ`render()`を呼び、以後はユーザー操作時のみ再描画する(継続ループは行わない)
  - 観測可能な完了条件: ヒメッコがページ表示直後は初期姿勢のまま静止しており、ユーザーが何も操作しない限り位置・向きが変化しないこと
  - _Requirements: 5.1, 5.2_
  - _Boundary: HomeArFallbackScene_
  - _Depends: 2.2_

- [x] 6.2 ドラッグによるヒメッコの移動
  - `canvas`要素の`pointerEvents`を`none`から`auto`に変更し、Pointer Events(`onPointerDown`/`onPointerMove`/`onPointerUp`、`setPointerCapture`)でドラッグを検出する
  - ポインターのスクリーン座標差分を、固定カメラのfov・距離から算出したワールド座標スケールに変換し`modelGroup.position.x/y`に反映、ドラッグ中は都度`render()`する
  - 可動範囲を、モデル中心が可視半幅・半高の概ね60%以内に収まる安全マージンにクランプし(暫定デフォルト。視覚確認しながら微調整可)、画面端や下部の撮影ボタン領域に完全に隠れないようにする
  - 撮影ボタン・回転ボタン(6.3)・戻るボタンのタップがcanvasの`pointerEvents: auto`化によって妨げられないことを確認する(各ボタンのzIndexがcanvasより高いことを確認)
  - 観測可能な完了条件: ヒメッコを指/マウスでドラッグすると画面内を追従して移動し、画面端までドラッグしても完全に見切れず、他のボタン操作に支障が出ないこと
  - _Requirements: 5.3, 5.4_
  - _Boundary: HomeArFallbackScene_
  - _Depends: 6.1_

- [x] 6.3 回転ボタンによる向き変更
  - タップ領域48x48px以上・`aria-label`付きの左右回転ボタンを撮影ボタン付近に追加する(16px以上のテキスト/アイコン、コントラスト比4.5:1以上)。canvasの`pointerEvents: auto`化後もタップが確実にボタンへ渡るよう、撮影ボタンと同じ`zIndex: 10`以上を明示的に指定する
  - タップ時に`modelGroup.rotation.y`を固定量(`Math.PI / 6`程度)ずつ増減させ、都度`render()`する
  - 観測可能な完了条件: 左右の回転ボタンをタップするたびにヒメッコの向きが一定量ずつ回転し、タップ領域・アクセシブルラベル・コントラストが基準を満たすこと
  - _Requirements: 5.5, 5.6, 4.5_
  - _Boundary: HomeArFallbackScene_
  - _Depends: 6.1_

- [x] 6.4 (P) 撮り直し時のリセット確認とアクセシビリティ・回帰確認
  - 撮り直し(`HomeArFallbackExperience`の`sceneKey`変更による`HomeArFallbackScene`再マウント、既存実装)によって、ドラッグ・回転操作の結果が破棄され初期状態(中央・初期姿勢)に戻ることを確認する(追加実装は不要な想定だが、実際に動作を確認する)
  - 新規追加した回転ボタンについて、既存のアクセシビリティ確認(5.1相当)と同様にタップ領域・ラベル・コントラスト・フォントサイズを再確認する
  - 観測可能な完了条件: 撮り直し操作後にヒメッコが中央・初期姿勢で表示されること、回転ボタンがWCAG AA相当の基準を満たすこと
  - _Requirements: 5.7, 4.5_
  - _Boundary: HomeArFallbackScene, HomeArFallbackExperience(読み取り専用の確認作業)_
  - _Depends: 6.2, 6.3_

- [x] 7. Enhancement: ヒメッコの拡大縮小操作(2本指ピンチ)
- [x] 7.1 アクティブポインター管理とピンチ検出・スケール適用
  - 既存の`onPointerDown`/`onPointerMove`/`onPointerUp`/`onPointerCancel`ハンドラを、アクティブなポインター(`pointerId`とスクリーン座標)を`Map`で管理する方式に拡張する
  - 2本目の`pointerdown`が発生した時点で、その2点間の距離とその時点のモデルスケールを記録し、進行中の1本指ドラッグ状態を破棄してピンチ操作へ切り替える(ドラッグとピンチを同時に併発させない)
  - `pointermove`でアクティブポインターが2点以上ある間、2点間の距離の変化比率をピンチ開始時のスケールに掛けて`modelGroup.scale`に反映し、都度`render()`する。3本目以降のポインターは無視し、最初にピンチを開始した2点のみを追跡する
  - 観測可能な完了条件: 2本指でピンチアウト/インするとヒメッコが大きく/小さくなり、ピンチ中に1本指ドラッグの移動が同時発生しないこと
  - _Requirements: 6.1, 6.2, 6.3, 6.5_
  - _Boundary: HomeArFallbackScene_
  - _Depends: 6.1, 6.2_

- [x] 7.2 スケール範囲のクランプ
  - モデルロード時の`model.scale ?? 1`を基準スケールとして保持し、暫定デフォルトとして基準スケールの0.5倍〜2.5倍の範囲にクランプする(実装時に視覚確認しながら微調整可)
  - 観測可能な完了条件: ピンチを続けても基準スケールの0.5〜2.5倍の範囲を超えて拡大縮小されないこと
  - _Requirements: 6.4_
  - _Boundary: HomeArFallbackScene_
  - _Depends: 7.1_

- [x] 7.3 (P) 撮り直し時のスケールリセット確認と既存操作の回帰確認
  - 撮り直し(`HomeArFallbackExperience`の`sceneKey`変更による`HomeArFallbackScene`再マウント、既存実装)によって、ピンチで変更したスケールが破棄され初期スケールに戻ることを確認する(追加実装は不要な想定だが、実際に動作を確認する)
  - ピンチ機能追加によって、既存のドラッグ移動(6.2)・回転ボタン(6.3)・撮影ボタンの動作にデグレが無いことを確認する
  - 観測可能な完了条件: 撮り直し操作後にヒメッコが初期スケールで表示されること、ドラッグ・回転・撮影の各操作が引き続き正常に機能すること
  - _Requirements: 6.6_
  - _Boundary: HomeArFallbackScene, HomeArFallbackExperience(読み取り専用の確認作業)_
  - _Depends: 7.2_

- [x] 8. Enhancement: カメラアクセス前の操作方法ガイド表示
- [x] 8.1 (P) HomeArFallbackStateへのguideフェーズ追加
  - `src/lib/ar/types.ts`の`HomeArFallbackState`ユニオン型に`{ phase: "guide" }`を追加する
  - 既存の`idle`/`camera-requesting`/`camera-denied`/`initializing`/`ready`/`capturing`/`error`の各フェーズはそのまま維持する
  - 観測可能な完了条件: `HomeArFallbackState`が`guide`を含む型としてexportされ、型チェックが通ること
  - _Requirements: 7.4_
  - _Boundary: lib/ar/types.ts_

- [x] 8.2 (P) 操作方法アイコン(移動・拡大縮小)の追加
  - `scripts/gen-icons.mjs`のNAMESに`open-with`(移動)・`pinch-outline`(拡大縮小)を追加し、`material-symbols.generated.ts`を再生成する
  - 既存の`rotate-right`は変更せずそのまま流用する
  - 観測可能な完了条件: `Icon`コンポーネントから`name="open-with"`・`name="pinch-outline"`が描画できること
  - _Requirements: 7.2_
  - _Boundary: icons registry_

- [x] 8.3 OperationGuideコンポーネントの実装
  - 一本指ドラッグでの移動・二本指ピンチでの拡大縮小・画面内ボタンでの回転の3項目を、それぞれアイコン+16px以上のテキストで説明するカードUIを実装する(既存のカメラ拒否ガイド・エラー画面と同じ視覚パターンを踏襲)
  - タップ領域48x48px以上・`aria-label`付きの「はじめる」ボタンを表示し、タップ時に`onDismiss`コールバックを呼ぶ
  - 状態を持たない表示専用コンポーネントとして実装する(`onDismiss: () => void`のみを受け取る)
  - 観測可能な完了条件: `OperationGuide`が独立してレンダリング可能で、「はじめる」ボタンタップで`onDismiss`が呼ばれること
  - _Requirements: 7.2, 7.3, 4.6_
  - _Boundary: OperationGuide_
  - _Depends: 8.2_

- [x] 8.4 HomeArFallbackExperienceへのガイド表示制御の統合
  - 初期状態を`{phase: "guide"}`に変更し、`guide`フェーズの間は`HomeArFallbackScene`をマウントせず`OperationGuide`を表示する(既存の`showScene`等の排他条件に`guide`判定を追加)
  - `OperationGuide`の`onDismiss`で`phase`を`"idle"`に遷移させ、`HomeArFallbackScene`をマウントする
  - 撮り直し(`handleRetake`)の遷移先を`{phase: "idle"}`から`{phase: "guide"}`に変更する
  - フローティング戻るボタンが`guide`フェーズ中も表示され続けることを確認する(既存の`showBackButton`条件を変更しない)
  - 観測可能な完了条件: 申告リンクタップ直後・撮り直し直後のいずれも、カメラ許可ダイアログが表示される前に操作方法ガイドが表示され、「はじめる」タップ後にのみカメラアクセスが要求されること
  - _Requirements: 7.1, 7.4, 7.5_
  - _Boundary: HomeArFallbackExperience_
  - _Depends: 8.1, 8.3_

- [x] 8.5 (P) アクセシビリティ・回帰確認
  - `OperationGuide`の「はじめる」ボタンについて、タップ領域48x48px以上・`aria-label`・フォントサイズ16px以上/行間1.5以上・コントラスト比4.5:1以上を確認する
  - ガイド追加によって、既存のドラッグ移動・回転ボタン・2本指ピンチ・撮影・プレビュー・カメラ拒否ガイド・エラー+リトライの各動作にデグレが無いことを確認する
  - 観測可能な完了条件: 「はじめる」ボタンがWCAG AA相当の基準を満たし、既存の全操作(5.1-6.6, 2.1-3.5)が本改訂前と同じ挙動であること
  - _Requirements: 4.6_
  - _Boundary: OperationGuide, HomeArFallbackExperience(読み取り専用の確認作業)_
  - _Depends: 8.4_

## Implementation Notes
- `pnpm lint`(`biome lint .`)はlintルールのみで、フォーマット(整形)チェックは行わない。CIの`biome ci .`はlint+フォーマットの両方を検証するため、`pnpm lint`がクリーンでも`biome ci .`で整形差分が指摘されることがある(実際に発生済み: import文の折り返し、JSX属性の折り返し)。今後は`pnpm lint`だけでなく`npx biome ci .`(または`pnpm format`で自動整形)も実行してから完了を判断すること
- 本プロジェクトにはVitest/Jest等のテストランナーが導入されていない(2026-07-07時点)。今回のspecでは新規にテストフレームワークを導入しないことをユーザーと確認済み。そのため各タスクはTDD(自動テストのRED→GREEN)を行わず、型チェック・lintと、5.1-5.3の手動/実機検証で品質を確認する。レビューア・実装者エージェントは、自動テスト不在を理由に単体で`REJECTED`/`BLOCKED`としないこと
- `pnpm build`は本specの変更と無関係な既存の問題(Prisma生成クライアント`.prisma/client/default`が本サンドボックスに存在しない)により、「Collecting page data」フェーズで必ず失敗する(タスク1.1実装者が発見、変更をstashしても同じ失敗を再現し確認済み)。ただし同じ`pnpm build`内の「Linting and checking validity of types」フェーズはこの失敗より前に完了し、型エラーがあればここで報告される。今後のタスクの型チェックは`npx tsc --noEmit`(exit code 0を確認)を正とし、`pnpm build`の「Collecting page data」以降の失敗は本specの検証対象外とすること
- タスク2.1/2.2で`HomeArFallbackScene`の`useEffect`依存配列は`[model, onCameraDenied, onError]`になっている(いずれのidentityが変わっても再実行され、カメラ再取得・Three.jsシーンの再構築が起きる)。タスク3.1で`HomeArFallbackExperience`がこれらを渡す際は、`onCameraDenied`/`onError`を`useCallback`で安定化し、`model`も親から安定した参照(page.tsxから渡される既存の`model`オブジェクトをそのまま使う、再生成しない)で渡すこと → タスク3.1で対応済み(`useCallback`空配列 + `model`をそのまま渡す)
- `HomeArFallbackScene`の`onError`は初期化失敗と撮影失敗(`compositeCapture`失敗)を区別せず同一コールバックで通知する(2.1/2.3で確定済みのインターフェース)。そのため`HomeArFallbackExperience`(3.1)は撮影失敗時も初期化失敗と同じ「エラー+リトライ(シーン再マウント)」導線に入る。design.mdのError Handling節が想定する「撮影失敗時は撮影前の状態に留まる」という区別は今回のインターフェースでは実現していない(スコープ外・既知の制約として受容)
- タスク5.1のアクセシビリティ検証で、`HomeArFallbackExperience`の再試行ボタンが`--color-primary-500`(#d63d5e)に白文字でコントラスト比4.479:1(要件4.4の4.5:1未達)だったことが判明し、`--color-primary-600`(6.23:1)に変更して修正済み。**同じ`--color-primary-500`+白文字の組み合わせは`SpotArExperience.tsx`の保存ボタンおよび`PhotoPreview.tsx`の保存ボタン(既存・本spec対象外)にも存在しており、同様のコントラスト不足が疑われる。** 本specのBoundary外(スポット撮影ページの変更は対象外)のため未修正のまま。ユーザーへ別途報告・別issue化を推奨
- `/kiro-validate-impl`の統合チェックで、要件2.5(代替体験中は常に戻る手段を提供する)がカメラ拒否・エラーの両状態で破られていることが判明(個別タスクレビューでは見逃されていた)。カメラ拒否ガイドには元々ボタンが一つも無く行き止まりになっていた。修正: フローティング戻るボタンをカメラ拒否時は表示継続するよう変更し、エラー画面には`SpotArExperience.tsx`と同じパターンで「再試行」と並べて専用の「戻る」ボタンを追加した。この種の「個別タスクは要件を満たすが、状態をまたいで見ると抜けがある」パターンは、今後も`/kiro-validate-impl`のような通し確認が有効であることを示す事例
- 実際にアプリを操作したユーザーからのフィードバックで、代替体験画面でサイト共通のフッター(`AppFooter`)が透けて見え、撮影後のプレビュー画面の保存/シェアボタン列がフッターと重なる不具合が発覚。原因は`/camera`が`CameraLayout`(`AppHeader`/`CharacterContainer`/`AppFooter`を常時レンダリング)にラップされており、`HomeArFallbackExperience`のルート要素が`position: relative`のままレイアウトの通常フローに乗っていたため。`ArModal.tsx`と同じ`position: fixed; inset: 0`の全画面オーバーレイに変更して解決(`zIndex`は`AppHeader`の`z-50`と衝突しないよう60に設定)。今後、代替体験のような「ページ内の状態切り替えで全画面UIに切り替える」実装をこのレイアウト配下に追加する場合は、同様に`position: fixed`のオーバーレイにする必要がある
- 上記の`position: fixed`修正時に`overflow: hidden`も設定したところ、実機での確認で「撮影後のプレビュー画面(`PhotoPreview`)で保存/シェアボタンが見切れる」不具合が発覚。`PhotoPreview.tsx`(既存・本spec対象外)は`minHeight: "100dvh"`の通常フローレイアウトのため、縦長の写真だとボタン列を含めた合計の高さが画面を超える。`overflow: hidden`だとスクロールできず見切れるため、`overflowY: "auto"; overflowX: "hidden"`に変更して解決(`position: fixed`かつ背景が不透明なので、スクロールしてもフッターが再度見えることはない、という想定だった)
- ところが上記の修正後も実機(iPhone Safari)で再度フッター・ヘッダーが見える不具合が再発。原因はオーバーレイ自身のスクロールが端に達した後もドラッグを続けると、スクロールが裏の`/camera`ページ自体(ヘッダー・キャラクターイラスト・フッターがDOM上に存在し続けている)に「漏れる」iOS Safari特有の挙動だった。`document.body.style.overflow = "hidden"`をマウント中に設定するボディスクロールロックのuseEffectを追加し、オーバーレイのスクロール領域に`overscrollBehavior: "contain"`も追加して解決。**このレイアウト構成(裏にスクロール可能なページが存在する状態でオーバーレイを重ねる)で同様のフルスクリーンUIを実装する場合は、bodyスクロールロックを最初から組み込むこと**
- **それでも実機で3回目の再発**(body/html の`overflow: hidden`と`overscroll-behavior: contain`だけでは、iOS Safari特有のゴム弾性バウンスがCSSだけで完全には止まらなかった)。最終的に、`document`レベルの`touchmove`リスナー(`{passive:false}`)を追加し、オーバーレイのスクロール領域(`scrollContainerRef`)が先頭/末尾に達した状態でさらに同方向へドラッグされた場合に`preventDefault()`する実装で解決。方向判定はジェスチャー開始位置ではなく直前フレームの位置と比較する(累積移動量ではなく瞬間の方向で判定し、ドラッグ中に方向を反転しても引っかからないようにする)。**この種のフルスクリーンオーバーレイ(裏にスクロール可能なページがあるレイアウト)を実装する際は、CSSの`overflow`/`overscroll-behavior`だけでは不十分な場合があり、この`touchmove`境界ガードのパターンを最初から検討すること**
- **`main`とのマージで大規模な衝突が発生し解決済み**。本spec作業中に`main`側で独立して`c250458`(スポットAR撮影のマーカーレス化。MindAR/`ArScene.tsx`/`PhotoPreview.tsx`/`src/lib/ar/`の大半を削除し、スポット撮影も自宅撮影と同じネイティブAR方式に統一)が進んでいたため、以下の衝突が発生した:
  1. `src/lib/ar/types.ts`: `main`が`ModelConfig`以外の全型(`CaptureResult`/`ArSceneState`/`PageView`/`TargetConfig`)を削除。解決: `ModelConfig`(main)+`CaptureResult`(本specで依然必要)+`HomeArFallbackState`(本spec追加)のみを残し、他は(利用箇所が無いことを確認の上)削除
  2. `PhotoPreview.tsx`が`main`で完全削除。解決: 同等品を`src/app/camera/_components/CapturedPhotoPreview.tsx`として本specの境界内に再作成し、`HomeArFallbackExperience.tsx`のimport元を変更(過去に発見した保存ボタンのコントラスト不足も、再作成時に`--color-primary-600`へ修正済み)
  3. `package.json`から`three`/`@types/three`が`main`のMindAR撤去で削除されていたが、`HomeArFallbackScene`が引き続き必要とするため復元(`pnpm install`で`pnpm-lock.yaml`も更新)
  4. `next.config.ts`の`config.resolve.alias.three$`(MindAR用の`three-shim.ts`互換シム)が、シム本体の削除により参照先の無いエイリアスとして残存し、**アプリ全体のbare `import "three"`を破壊(`three`自身の内部self-importも含む)し、`/camera`・`/spots`ともにビルド不能**になっていた。原因調査に時間を要した箇所。エイリアス設定自体を削除して解決
  - マージ後、`npx tsc --noEmit`・`pnpm lint`・`.next`キャッシュ削除後の`/camera`・`/spots`の初回コンパイルと200応答を確認済み
  - **今後、同じリポジトリで並行して大きな変更が進んでいる場合は、こまめに`git fetch origin main`して差分を把握すること。特に共有ファイル(`src/lib/ar/`等)を「変更しない前提」で設計した場合、その前提自体が並行作業で崩れる可能性がある**
- タスク6.1-6.4で、自動回転(`setAnimationLoop`内の`modelGroup.rotation.y += 0.004`)を廃止しon-demandレンダリングに変更、ドラッグ移動(Pointer Events)と回転ボタンを追加した。実装過程で、既存の`HomeArFallbackExperience.tsx`の戻るボタンで使われている`rgba(30, 28, 25, 0.6)`+白アイコンの組み合わせが、明るい背景(空・雪・白壁など)がカメラ映像に写り込んだ場合の最悪ケースで約4.483:1となり、要件のコントラスト比4.5:1をわずかに下回ることが判明した(独立レビューでの計算により確認)。新規追加した回転ボタンは`rgba(30, 28, 25, 0.75)`(約7.47:1)に変更して対応したが、**既存の戻るボタン自体は本spec Out of Boundary(振り返り時に見つかった別コンポーネントの既存不具合)のため未修正のまま**。ユーザーへ別途報告・別issue化を推奨(task 5.1で発見された`--color-primary-500`保存ボタンのコントラスト不足の件と同様のパターン)
- タスク7.1で、2本指ピンチの開始距離(`pinchStartDistance`)にゼロ除算ガードが無く、2本指がほぼ同一座標で検出された場合に`modelGroup.scale`が`NaN`になりうるバグが独立レビュー(round 1)で発見された(`REJECTED`)。`MIN_PINCH_DISTANCE = 1`px の下限を`Math.max`で適用して修正し、round 2で`APPROVED`。**複数ポインター間の距離・比率計算を伴う実装(ピンチ・回転ジェスチャー等)では、開始時の距離が理論上ゼロになりうるケースのゼロ除算ガードを最初から入れておくこと**
