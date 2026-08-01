# 実装計画

- [x] 1. `/camera` ページルートと自宅用 AR 設定定数の作成
- [x] 1.1 `src/app/camera/page.tsx` を Server Component として作成し、`HOME_MODEL` 定数を定義する
  - `HOME_MODEL: ModelConfig = { url: "/assets/himekko.glb", label: "ヒメッコ", scale: 0.5 }` を定義する
  - `HomeArExperience` に `model` を props として渡してレンダーする（target・markerImageUrl は不要）
  - `/camera` にアクセスすると Next.js がルートとして認識し、404 ではなく応答を返す状態になっている
  - _Requirements: 1.1, 5.1, 5.2_

- [x] 2. `MarkerlessArScene` — マーカーレス AR 撮影コンポーネント
- [x] 2.1 `src/app/camera/_components/MarkerlessArScene.tsx` を新規作成する
  - `getUserMedia` でカメラ映像を取得し `<video>` 要素として全画面表示する
  - Three.js で 3D モデルを固定位置（画面下部中央）にレンダリングするオーバーレイ `<canvas>` を追加する
  - `ArSceneState` フェーズ遷移: `camera-requesting` → `initializing` → `tracking` → `capturing`
  - ゆっくり Y 軸回転アニメーションでヒメッコを演出する
  - マーカー不要: カメラを向けるだけでヒメッコが現れる
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6, 3.8_

- [x] 3. `HomeArExperience` — ビュー状態管理とランディング・プレビュー
- [x] 3.1 `src/app/camera/_components/HomeArExperience.tsx` を更新する
  - `HomeArExperienceProps` からマーカー関連 props（`target`, `markerImageUrl`）を削除する
  - ランディング画面のマーカー参照画像と「マーカーにカメラを向けてください」説明を削除する
  - ランディング説明を「「撮影する」をタップするとヒメッコが現れます。一緒に記念撮影しましょう！」に変更する
  - `MarkerlessArScene` を `next/dynamic` + `{ ssr: false }` で遅延ロードして使用する
  - `tracking` フェーズではステータスメッセージを非表示にする（マーカーレスなので「マーカーを認識しました」は不要）
  - _Requirements: 1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 3.2, 3.7, 3.8, 4.4_

- [x] 3.2 プレビュービューを統合する
  - `view.kind === "preview"` のとき `<PhotoPreview captureResult={view.captureResult} onRetake={handleRetake} />` をレンダーする
  - `handleCapture(result)` が `{ kind: "preview", captureResult: result }` に遷移し、`handleRetake()` が `{ kind: "ar" }` に戻ることを確認する
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 4. 動作確認
- [ ] 4.1 `/camera` ページのルートアクセスとランディング表示を手動確認する（要ブラウザ）
  - ブラウザで `http://localhost:3005/camera` を直接入力してランディング画面が 404 なく表示されること
  - マーカー参照画像が表示されていないこと
  - 「トップへ戻る」リンクをタップすると `/` に遷移すること
  - _Requirements: 1.1, 1.2, 2.1, 2.5_

- [ ] 4.2 マーカーレス AR 起動〜撮影〜プレビュー〜保存のフルフローを手動確認する
  - 「撮影する」ボタンからカメラが起動し、マーカーなしでヒメッコが画面に現れること
  - ヒメッコがゆっくり回転していること
  - 撮影ボタンでプレビュー画面へ遷移し、保存またはシェアボタンが機能すること
  - 「撮り直し」で AR 画面へ戻ること
  - _Requirements: 2.4, 3.1, 3.3, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4_
