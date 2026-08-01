# Implementation Plan

- [ ] 1. シェア設定基盤の構築
- [x] 1.1 (P) シェアテキスト・URL定数モジュールを作成する
  - `src/lib/ar/share-config.ts` を新規作成する
  - `SHARE_TEXT` に「新庄村に遊びにきたよ！あなたも自宅でひめっ子と撮影してみよう」を定義する
  - `SHARE_URL` に `https://example.com/` を定義する
  - TypeScript strict モードで型エラーなくビルドが通ること
  - _Requirements: 1.2, 1.3_
  - _Boundary: ShareConfig_

- [x] 1.2 (P) `canShare` ユーティリティをファイル共有サポート確認に対応させる
  - `src/lib/ar/utils.ts` の `canShare` を更新する
  - `navigator.share` が存在しない場合は `false` を返す（既存動作を維持）
  - `navigator.canShare` が存在しない場合は `false` を返す（追加）
  - テスト用ファイルで `navigator.canShare({ files })` を確認し、ファイル共有非対応の場合は `false` を返す（追加）
  - 既存の呼び出し元（`PhotoPreview.tsx` の `canShare(navigator)`）がシグネチャ変更なく動作すること
  - _Requirements: 1.4_
  - _Boundary: canShare utility_

- [x] 2. PhotoPreview のシェア内容を更新する
  - `src/app/spots/[slug]/camera/_components/PhotoPreview.tsx` で `SHARE_TEXT`・`SHARE_URL` を `@/lib/ar/share-config` からインポートする
  - `handleShare` 内のインライン文字列をインポートした定数に置き換える（2行変更）
  - iOS Safari または Android Chrome でシェアボタンをタップすると、シェアシートにテキスト「新庄村に遊びにきたよ！あなたも自宅でひめっ子と撮影してみよう」と URL `https://example.com/` が表示されること
  - キャンセル・失敗時にエラーが表示されないこと（既存の try/catch で担保済み、変更不要）
  - _Requirements: 1.1, 1.2, 1.3, 1.5_
  - _Depends: 1.1_

- [ ] 3. 開発用プレビュー確認環境を追加する
- [x] 3.1 (P) dev用プレビュー確認ページを作成する
  - `src/app/dev/preview/page.tsx` を Client Component として新規作成する
  - サンプル dataUrl（1×1 透過PNG: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`）を使って `PhotoPreview` を描画する
  - `onRetake` は何もしないノップ関数を渡す
  - `localhost:3005/dev/preview` を開くとプレビューUI（画像・シェアボタン・保存ボタン・撮り直しボタン）が表示されること
  - _Requirements: 2.2_
  - _Boundary: DevPreviewPage_

- [x] 3.2 (P) 開発ポータルの軸①セクションに dev プレビューへのリンクを追加する
  - `src/app/page.tsx` のページ一覧セクション（「来村者向け — AR記念撮影」グループ）に「撮影後プレビュー（シェアテスト）」リンクを `PageLink` として追加する
  - リンク先を `/dev/preview` とする
  - 開発環境の `localhost:3005` でトップページを開くと「撮影後プレビュー（シェアテスト）」リンクが表示され、クリックで `/dev/preview` に遷移すること
  - _Requirements: 2.1_
  - _Boundary: DevPortal_
