# Implementation Plan

- [x] 1. アイコン追加: 床認識トグル用アイコンの生成
  - `scripts/gen-icons.mjs` の `NAMES` 配列に `"toggle-on"`, `"toggle-off"` を追加する
  - `node scripts/gen-icons.mjs` を実行して `material-symbols.generated.ts` を再生成する
  - Observable: 再生成後の`iconData`に`"toggle-on"`と`"toggle-off"`のエントリが存在し、`IconName`として型安全に参照できる
  - _Requirements: 1.3_

- [x] 2. 共有トグルコンポーネントの実装
  - `FloorRecognitionToggle`コンポーネントを新規作成する(`enabled: boolean`, `onChange: (enabled: boolean) => void`のPropsを受け取る表示専用コンポーネント)
  - ~~現在の状態をアイコン(`toggle-on`/`toggle-off`)とテキストラベル(「床認識: オン」/「床認識: オフ」)で表示する~~
  - ~~`aria-pressed`属性と、状態を含むアクセシブルラベルを設定する~~
  - **Revised (2026-07-22, レビュー指摘): [shadcn/ui Switch](https://ui.shadcn.com/docs/components/base/switch)のtrack+thumb表現に倣ったスライド式スイッチ(`role="switch"`)として実装する。ラベル文言(「床認識機能を有効にする」)は状態にかかわらず固定表示し、`aria-checked`と`aria-labelledby`で状態・ラベルを伝える。状態依存の説明はラベルではなくスイッチ下のキャプションでのみ出し分ける。詳細は`research.md`のRevisionおよび`design.md`のFloorRecognitionToggle項目を参照。**
  - 最小タップ領域48x48px、テキスト16px以上・行間1.5以上・コントラスト4.5:1以上を満たすスタイルを適用する
  - 実装後に`/baseline-ui`・`/fixing-accessibility`・`/fixing-motion-performance`(サムのスライドアニメーション追加のため)を本コンポーネントに適用し、指摘に対応する
  - Observable: `enabled`にかかわらず「床認識機能を有効にする」ラベルが表示され続け、`enabled=true`のときトラックが有効色・サムが右側・`aria-checked="true"`、`enabled=false`のときトラックが無効色・サムが左側・`aria-checked="false"`になる。クリックで`onChange`が反転後の値で呼ばれる
  - _Requirements: 1.1, 1.3, 1.4, 5.1, 5.2, 5.3_
  - _Depends: 1_

- [x] 3. (P) 自宅撮影ページへの統合
  - `HomeArExperience.tsx`に`floorRecognitionEnabled`state(初期値`true`)を追加する
  - `handleArClick`を、`false`のとき既存の`setView("fallback")`を呼ぶよう分岐拡張し、`true`のときは既存の`canActivateAR`判定を変更せず実行するようにする
  - 「いますぐ撮影する」カード内のARボタン付近に`FloorRecognitionToggle`を配置する
  - 統合後に`/baseline-ui`と`/fixing-accessibility`を`HomeArExperience.tsx`に適用し、既存レイアウトのコントラスト・タップ領域に回帰が無いことを確認する
  - Observable: 自宅撮影ページを開くと床認識トグルがオン表示で見え、オフに切り替えてARボタンを押すと既存の代替撮影体験(操作ガイド)が起動し、オンのままだと従来通りのネイティブAR/ArModal分岐になる
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 3.1_
  - _Boundary: HomeArExperience_
  - _Depends: 2_

- [x] 4. スポット撮影ページへの統合
- [x] 4.1 (P) ArLandingへのトグルProps追加
  - `floorRecognitionEnabled: boolean`, `onToggleFloorRecognition: (enabled: boolean) => void`をPropsに追加する
  - 「ARで撮影する」ボタン付近に`FloorRecognitionToggle`を配置する
  - 実装後に`/baseline-ui`と`/fixing-accessibility`を`ArLanding.tsx`に適用する
  - Observable: `ArLanding`に`floorRecognitionEnabled=false`を渡すとトグルがオフ表示になる
  - _Requirements: 1.1, 1.3, 1.4, 4.1_
  - _Boundary: ArLanding_
  - _Depends: 2_

- [x] 4.2 SpotArExperienceへの状態機械とフォールバック結線の追加
  - `view: "landing" | "fallback"`(初期値`"landing"`)と`floorRecognitionEnabled`(初期値`true`)のstateを追加する
  - `handleStart`を、`false`のとき`setView("fallback")`を呼ぶよう分岐拡張し、`true`のときは既存の`canActivateAR`判定を変更せず実行するようにする
  - `view === "fallback"`のとき`HomeArFallbackExperience`に`model`と`onBack`(`setView("landing")`)を渡して表示する早期returnを追加する
  - `ArLanding`に`floorRecognitionEnabled`と`onToggleFloorRecognition`を渡す
  - 統合後に`/baseline-ui`と`/fixing-accessibility`を`SpotArExperience.tsx`の変更箇所に適用する
  - Observable: スポット撮影ページでトグルをオフにして「ARで撮影する」を押すと、そのスポットのモデル(または`arAssetUrl`未設定時は既定モデル)で代替撮影体験が開始し、「戻る」操作でランディングに戻れる
  - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 3.1, 4.1, 4.2_
  - _Boundary: SpotArExperience_
  - _Depends: 4.1_

- [ ] 5. 検証
- [ ] 5.1 (P) 自宅撮影ページの手動確認
  - 初回表示でトグルがオン表示であること、タップでオン/オフの表示・`aria-pressed`が切り替わることを確認する
  - オンのままARで撮影するを押した場合、既存の`canActivateAR`分岐(ネイティブAR起動 or `ArModal`)が本仕様導入前と同一に動作することを確認する
  - オフの状態でARで撮影するを押すと、操作ガイド→カメラ許可→固定表示→撮影→プレビュー(保存/シェア/撮り直し)の代替撮影体験が開始することを確認する
  - カメラ許可拒否時・初期化失敗時に既存の案内・エラー表示が出ることを確認する
  - 既存の「うまく表示されなかった方はこちら」がトグルの状態に関わらず変更なく動作することを確認する
  - オフにして代替体験に入り「戻る」でEntryに戻った際、トグルがオフのまま保持されていることを確認する
  - Observable: 上記6項目すべてが期待通りに動作することをチェックリストとして確認済みにする
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - _Boundary: HomeArExperience_
  - _Depends: 3_
  - _Blocked: 実機のカメラ・ブラウザ・OS標準ARビューア(Scene Viewer/Quick Look)へのアクセスが無いCLIサンドボックス環境のため、人手による実機/ブラウザでの手動確認が必要。コードの実装・レビューは完了済み(タスク3で承認済み)_

- [ ] 5.2 (P) スポット撮影ページの手動確認
  - 5.1と同様の項目をスポット撮影ページで確認する(トグル表示・オン/オフ分岐・代替体験)
  - `arAssetUrl`設定済み・未設定(既定モデル)の両方で、オフ時の代替体験に正しいモデルが反映されることを確認する
  - Observable: 上記項目すべてが期待通りに動作することをチェックリストとして確認済みにする
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2_
  - _Boundary: SpotArExperience, ArLanding_
  - _Depends: 4.2_
  - _Blocked: 実機のカメラ・ブラウザ・OS標準ARビューアへのアクセスが無いCLIサンドボックス環境のため、人手による実機/ブラウザでの手動確認が必要。コードの実装・レビューは完了済み(タスク4.1/4.2で承認済み)_

- [ ] 5.3 (P) アクセシビリティ確認
  - **Reopened (2026-07-22): タスク2のスイッチ形式への変更に伴い再確認が必要。**
  - トグルのタップ領域が48x48px以上であることを、自宅撮影・スポット撮影の両方の配置先で確認する
  - スクリーンリーダーでトグルの現在状態(オン/オフ)が`aria-checked`として読み上げられ、ラベル(「床認識機能を有効にする」)が状態にかかわらず一貫して読み上げられることを確認する
  - トグルのテキストが16px以上・行間1.5以上・コントラスト比4.5:1以上を満たすことを確認する
  - `HomeArExperience`・`ArLanding`・`SpotArExperience`・`FloorRecognitionToggle`の全ファイルで`/baseline-ui`・`/fixing-accessibility`の指摘が残っていないことを最終確認する
  - `FloorRecognitionToggle`に`/fixing-motion-performance`を適用し、サムのスライドアニメーションに指摘が残っていないことを確認する
  - Observable: 4ファイルすべてで`/baseline-ui`・`/fixing-accessibility`の指摘が0件、`FloorRecognitionToggle`で`/fixing-motion-performance`の指摘が0件になっている
  - _Requirements: 5.1, 5.2, 5.3_
  - _Boundary: HomeArExperience, ArLanding, SpotArExperience, FloorRecognitionToggle_
  - _Depends: 3, 4.2_

- [ ] 5.4 実機E2E確認
  - Android実機(Scene Viewer対応端末)でオン→Scene Viewer起動→撮影→保存/共有、オフ→代替体験→撮影→保存/共有を確認する
  - iOS実機(Quick Look対応端末)で同様の確認を行う
  - 非対応端末(`canActivateAR=false`)でオンのまま起動して`ArModal`が表示される既存動作に回帰がないことを確認する
  - Observable: Android/iOS/非対応端末の3パターンすべてで期待した体験が得られる
  - _Requirements: 2.1, 2.2, 3.1, 3.5, 4.2_
  - _Depends: 5.1, 5.2, 5.3_
  - _Blocked: Android/iOS実機が無いCLIサンドボックス環境のため実行不可。5.1/5.2の人手確認と合わせて実施が必要_
