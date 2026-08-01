# Gap Analysis

## 1.現状調査

### 関連ファイルとレイヤー構成
| ファイル | 役割 | 本specとの関係 |
|---|---|---|
| `src/app/camera/_components/HomeArExperience.tsx` | 自宅撮影ページの本体。`view: "home" \| "fallback"` の状態を持ち、`handleArClick`で`canActivateAR`判定→`activateAR()`/`ArModal`、または`setView("fallback")`で代替体験へ切替。既に「うまく表示されなかった方はこちら」ボタンから`setView("fallback")`を呼んでいる | 拡張対象。トグルの表示場所、および`handleArClick`の分岐ロジック拡張ポイント |
| `src/app/camera/_components/HomeArFallbackExperience.tsx` | 床検知なしの代替体験のラッパー。`guide→idle→(camera-denied\|error)→preview`の状態機械を内包し、`model`と`onBack`のみを受け取る汎用的なProps | 再利用対象。home固有の実装ではなく`ModelConfig`ベースの汎用コンポーネント |
| `src/app/camera/_components/HomeArFallbackScene.tsx` | カメラ映像取得＋Three.jsでのヒメッコ固定表示＋ドラッグ移動/回転ボタン/ピンチ拡大縮小＋撮影 | 再利用対象。変更不要 |
| `src/app/camera/_components/OperationGuide.tsx` | 操作方法ガイド（移動・回転・拡大縮小の説明）。状態を持たない表示専用 | 再利用対象。変更不要 |
| `src/app/camera/_components/CapturedPhotoPreview.tsx` | 撮影結果のプレビュー・保存・シェア・撮り直し | 再利用対象。変更不要 |
| `src/lib/ar/capture.ts` / `src/lib/ar/types.ts` | `compositeCapture`関数、`ModelConfig`/`CaptureResult`/`HomeArFallbackState`型 | 再利用対象。変更不要（型名に`Home`が付くが実体は汎用） |
| `src/app/spots/[slug]/camera/_components/SpotArExperience.tsx` | スポット撮影ページの本体。`showArModal`のみの単純な状態。`handleStart`で`canActivateAR`判定→`activateAR()`/`ArModal`。フォールバック体験への導線は一切ない | 拡張対象。Homeの`view`状態と同型の仕組みを新規に追加する必要がある |
| `src/app/spots/[slug]/camera/_components/ArLanding.tsx` | スポットのランディングUI（名前・3Dプレビュー・説明文・ARボタン）。`spot`と`onStart`のみを受け取る表示コンポーネント | 拡張対象。トグルUIをどこに置くか（Landing内 or 親コンポーネント側に重ねるか）は設計判断 |
| `src/app/camera/_components/HiddenArViewer.tsx` / `ArModal.tsx` / `ModelViewer.tsx` | `<model-viewer>`ベースのネイティブAR起動・3D表示。既にhome/spot両方から再利用されている前例（`spot-camera-markerless`design.md参照） | 変更不要。床認識オン時の起動は完全にこれらに委譲されており、Web側からの制御余地はない |

### 既存の設計上の制約・前例
- `spot-camera-markerless`specの設計により、home側の`app/camera/_components`をspot側が再利用する構成は既に確立済み（`HiddenArViewer`/`ArModal`/`ModelViewer`）。本specの`HomeArFallbackExperience`系の再利用も同じ前例に沿う。
- `android-ar-capture-fallback`specの Non-Goals に「平面検出・床への設置などの本格的な空間認識AR」が明記されており、代替体験(`HomeArFallbackScene`)は最初から床検知を行わない設計。技術的にも矛盾なく本specの「オフ=代替体験」という対応付けが成立する。
- OS標準ARビューア(Scene Viewer/Quick Look)の内部動作を検知・制御する手段が無いことは`android-ar-capture-fallback/research.md`で既に検証済み（本spec前段のユーザー確認でも同じ結論に到達している）。

### 命名上の懸念
- `HomeArFallbackExperience`/`HomeArFallbackScene`/`HomeArFallbackState`という名称は元々home専用に付けられたが、実体はモデル(`ModelConfig`)と汎用コールバックのみに依存し、spot固有の情報を持たない。spotページから同じ名称のコンポーネントをimportして使うことは技術的には問題ないが、命名がhome専用を示唆するため誤解を招く可能性がある（design phaseでの判断事項）。

### テスト基盤
- `package.json`にテストランナー（Vitest/Jest/Playwright等）は未導入。`tech.md`にも「テスト戦略は仕様策定フェーズで決定予定」とあり、既存の`android-ar-capture-fallback`/`spot-camera-markerless`のdesign.mdも自動テストコードではなく手順としてのテスト戦略を記述するのみ。本specも同様に手動/実機確認ベースになる可能性が高い（Research Needed: design phaseで確定）。

## 2. 要件フィージビリティ分析

| Requirement | 必要な技術要素 | 既存アセット | ギャップ |
|---|---|---|---|
| 1. トグルの表示・デフォルトon・状態表示・切替 | UIコンポーネント、`useState<boolean>`（初期値true） | 既存の`Icon`（Material Symbolsアイコンセット）、48px以上のボタンパターンは全ページに前例あり | **Missing**: 専用のトグルUIコンポーネントが存在しない。トグル向けアイコン（toggle_on/toggle_off等）が生成済みアイコンセットに含まれるかは **Unknown**（要確認） |
| 2. オンでの起動（現行維持） | 既存の`canActivateAR`/`activateAR()`分岐 | `HomeArExperience.handleArClick`、`SpotArExperience.handleStart`が既に実装済み | **Constraint**: 既存ロジックを壊さないよう、トグル分岐を追加する形で拡張する必要がある |
| 3. オフでの起動（代替体験） | カメラ取得・固定表示・撮影・プレビュー・保存/シェア・エラー処理 | `HomeArFallbackExperience`一式がhomeで実運用中。ロジックはモデル非依存 | **Missing (home)**: トグル起点の新しい遷移経路（自己申告リンクとは別に、事前選択での遷移を`handleArClick`に追加）。**Missing (spot)**: `SpotArExperience`に相当する状態管理と`HomeArFallbackExperience`の呼び出しが全く無い |
| 4. スポットページでの提供 | Req1〜3のspot版 | Req3と同じ | **Missing**: spot側の状態機械・トグルUI・遷移ロジックすべて新規 |
| 5. アクセシビリティ | 48x48px、aria-label、16px/1.5/4.5:1 | 既存の`OperationGuide`/`CapturedPhotoPreview`/`ArModal`等で一貫して満たされているパターン | **Low risk**: 新規トグルUIを既存パターンに合わせるのみ |

### 複雑度シグナル
- ワークフロー拡張が中心（既存の状態機械への分岐追加）であり、新規の外部連携・データモデル変更は無い。
- スポット側は「既存パターンの横展開」だが、home側で確立済みの`view`状態・遷移をゼロから再現する分だけhomeより手数が多い。

## 3. 実装アプローチの選択肢

### Option A: 既存コンポーネントの拡張のみ
- `HomeArExperience.tsx`にトグルのstateとUIを直接追加し、`handleArClick`を拡張。
- `SpotArExperience.tsx`に同様の`view`state・トグルUI・`HomeArFallbackExperience`呼び出しを追加。`ArLanding.tsx`にもトグル用propsを追加。
- **Trade-offs**:
  - ✅ 新規ファイルが増えず、既存の読み方（1コンポーネント=1画面のオーケストレーション）に沿う
  - ✅ 既存の`view`分岐パターン（home）をそのまま横展開できる
  - ❌ トグルのUI・アクセシビリティ実装がhome/spotの2箇所に重複する
  - ❌ `ArLanding.tsx`は現在「表示専用・状態を持たない」設計思想（`ArModal`同様）であり、トグルの状態を持たせると責務が曖昧になる

### Option B: トグルUIを新規共有コンポーネントとして切り出す
- 新規`FloorRecognitionToggle`（仮称）コンポーネントを`src/app/camera/_components/`に追加し、`checked`/`onChange`のみを受け取る表示専用コンポーネントとする。
- 状態管理自体（`useState`、`handleArClick`/`handleStart`の分岐）は各オーケストレーター（`HomeArExperience`/`SpotArExperience`）に残す。
- **Trade-offs**:
  - ✅ UIとアクセシビリティ実装が1箇所に集約され、home/spotで見た目・挙動が確実に一致する
  - ✅ `ArModal`/`ModelViewer`等の既存の「camera/_components配下を両ページで共有する」規約に整合する
  - ✅ 単体でテスト・レビューしやすい
  - ❌ ファイルが1つ増える（既存規約上は許容範囲）

### Option C: ハイブリッド（トグルUIは共有・遷移ロジックは個別最適化）
- Option Bのトグル共有コンポーネントに加え、home側は既存の`setView("fallback")`を再利用する最小差分、spot側は新規に`view`state（またはそれに準ずる仕組み）を導入する非対称な実装。
- **Trade-offs**:
  - ✅ home側の変更を最小化しつつ、spot側は必要な分だけ新規実装できる
  - ✅ 段階的な実装・レビューがしやすい（home拡張→spot新規追加の順で進められる）
  - ❌ home/spotで内部の状態管理方法が完全には揃わない（ただし現状も`view` vs `showArModal`で既に非対称なため、悪化はしない）

## 4. Research Needed（design phaseで解決）

- Material Symbols生成済みアイコンセット（`icons/material-symbols.generated`）に、トグルON/OFFを表す適切なアイコン（`toggle_on`/`toggle_off`または同等）が含まれているかの確認。
- トグルのUI表現（スイッチ/チェックボックス風ボタン/2択ボタン等）とラベル文言の確定。
- `HomeArFallbackExperience`/`HomeArFallbackScene`/`HomeArFallbackState`のリネーム有無（spotからの利用を機に汎用名へ変更するか、既存の`home-camera`spec由来の前例（`HiddenArViewer`等は元からhome/spot共有名）に倣ってそのまま使うか）。
- 自宅撮影の既存「うまく表示されなかった方はこちら」リンクと、新規トグルの両方が`view: "fallback"`に到達する場合の表示上の整合（例: トグルがオンのままそのリンクを踏んだ場合の状態表示との矛盾がないか）。
- 本spec範囲でのテスト方針（自動テスト基盤が存在しないため、手動/実機確認ベースになる可能性が高い点を含む）。

## 5. 実装複雑度とリスク

| 項目 | Effort | Risk | 根拠 |
|---|---|---|---|
| トグルUIコンポーネントの新規作成 | S | Low | 既存の48px/aria-label/コントラストパターンを踏襲するのみ。新規依存なし |
| home側の遷移ロジック拡張(`handleArClick`) | S | Low | 既存の`setView("fallback")`を条件分岐に載せるだけで、実運用中のコードパスを再利用 |
| spot側の状態機械・遷移ロジック新規追加 | S〜M | Low〜Medium | home側で確立済みパターンの横展開だが、spotには床検知なしモードの受け口が現状皆無のため新規結線が必要 |
| データモデル/DB変更 | – | – | 不要（本specは永続化を伴わないUI状態のみ） |
| 既存機能への回帰リスク | – | Low | ネイティブAR起動(オン時)・既存の自己申告リンクの経路は変更せず、新しい分岐を追加するのみ |

## 6. Design Phaseへの推奨

- **推奨アプローチ**: Option B（トグルUIの共有コンポーネント化）を軸に、home側はOption Cの考え方で既存`view`状態を最小拡張し、spot側は同型の状態機械を新規追加する。
- **主要な設計判断事項**: トグルの視覚表現とアイコン選定、`HomeArFallback*`系のリネーム有無、トグル配置場所（ARボタン直上/直下など）。
- **持ち越す調査項目**: 上記「Research Needed」の4点。

---

## Design Phase Research (kiro-spec-design)

### Summary
- **Feature**: `ar-floor-recognition-toggle`
- **Discovery Scope**: Extension（既存システムへの機能追加）。Light Discoveryを実施。
- **Key Findings**:
  - Material Symbolsアイコンセットに`toggle-on`/`toggle-off`が実在し、既存の`scripts/gen-icons.mjs`ワークフローで追加コスト無く導入できる。
  - `HomeArFallback*`系の命名は、既存の`HiddenArViewer`/`ArModal`/`ModelViewer`がhome/spot間で無改名のまま共有されている前例に倣い、本specでもリネームしない。
  - トグルはスイッチ風のカスタムUIではなく、既存コードベース全体で一貫している「アイコン+テキストのボタン」パターン（`aria-pressed`によるトグルボタン）を採用する。アニメーションを伴うスイッチにしないため、`/fixing-motion-performance`の追加確認は不要と判断。
  - トグルは各ページの起動前画面（entry screen）にのみ表示され、ネイティブAR起動後やフォールバック体験中は画面から外れる。そのため、既存の事後申告リンク経路とトグルの表示状態が同時に競合する余地は構造的に存在しない。

### Research Log

#### アイコン確認: toggle-on / toggle-off
- **Context**: 床認識オン/オフの視覚的な状態表示に使えるアイコンが、現在使用中のアイコンセット(`src/app/_components/icons/material-symbols.generated.ts`)に含まれているか。
- **Sources Consulted**: `node_modules/@iconify-json/material-symbols/icons.json`(スクリプトから実際に解決確認)、`scripts/gen-icons.mjs`。
- **Findings**: 現行の生成済みファイルには`toggle-on`/`toggle-off`は含まれていないが、`@iconify-json/material-symbols`(既存devDependency)には両アイコンが存在し、`resolve()`で解決可能。
- **Implications**: `scripts/gen-icons.mjs`の`NAMES`に`"toggle-on"`, `"toggle-off"`を追加し、`node scripts/gen-icons.mjs`を再実行するだけで導入できる。新規パッケージ追加は不要。

#### テスト基盤の有無
- **Context**: Testing Strategyをどの前提で書くか。
- **Sources Consulted**: `package.json`(テストランナー未検出)、`tech.md`(「テスト戦略は仕様策定フェーズで決定予定」)、`android-ar-capture-fallback`/`spot-camera-markerless`の既存design.md(いずれも自動テストコードではなく手順記述)。
- **Findings**: 本プロジェクトに自動テストランナーは導入されていない。
- **Implications**: 本specのTesting Strategyも既存2specと同様、手動確認・実機E2E確認を前提として記述する。自動テスト基盤の新規導入はOut of Boundaryとする。

### Design Decisions

#### Decision: トグルUIの表現形式
- **Context**: 床認識オン/オフを表す操作をどのようなUIコンポーネントで実現するか。
- **Alternatives Considered**:
  1. スライド式のスイッチ(track+thumbのカスタムアニメーションUI)
  2. アイコン+テキストが状態に応じて切り替わる単一のトグルボタン(`aria-pressed`)
- **Selected Approach**: 2を採用。単一の`<button aria-pressed>`要素とし、内部のアイコン(`toggle-on`/`toggle-off`)とラベル文言(「床認識: オン」/「床認識: オフ」)を状態に応じて切り替える。
- **Rationale**: 既存コードベースの全ボタン(戻る・回転・撮影・保存・シェア等)がこのアイコン+テキストのボタンパターンに統一されており、一貫性が高い。スライド式スイッチは新規のトラック/サム描画とアニメーションが必要になり、CLAUDE.mdのUI実装ルール上`/fixing-motion-performance`の追加確認対象になるが、本パターンなら不要。
- **Trade-offs**: スイッチ的な「オン=右」という一般的なメタファーは持たないが、`aria-pressed`+テキストラベルにより状態は明確に伝わる。
- **Follow-up**: 実装時に`/baseline-ui`・`/fixing-accessibility`を対象ファイルに適用して最終確認する。

#### Revision (2026-07-22): コードレビュー指摘によるスイッチ形式への変更
- **Context**: 実装後のコードレビューで「ボタンとSwitchの見た目が混在している」「[shadcn/ui Switch](https://ui.shadcn.com/docs/components/base/switch)をベースにしてよい」「スイッチの原則としてラベルは状態にかかわらず固定する必要がある(説明文は状態で出し分けてよい)」という指摘を受けた。
- **Decision Update**: 上記「Selected Approach」(単一の`<button aria-pressed>`、アイコン+ラベルが状態で丸ごと切り替わる形式)を撤回し、shadcn/ui Switchのtrack+thumb表現に倣ったスライド式スイッチ(`role="switch"`、`aria-checked`)に変更する。
  - ラベル文言(「床認識機能を有効にする」)は状態にかかわらず固定表示する。状態依存の説明はラベルではなく、スイッチ下のキャプション(「※ 床を自動で検出して〜」/「※ 手動でひめっこの位置を調整しながら〜」、既存実装のまま維持)でのみ出し分ける。
  - アイコン(`toggle-on`/`toggle-off`)は使用しない。トラックの色とサムの位置の両方で状態を視覚的に表現する(色のみに依存しない)。
  - アクセシブルラベルは固定ラベル文言と`aria-labelledby`で関連付ける(以前のような、状態が変わるたびに可視テキスト自体が変化する方式ではない)。
- **Rationale**: レビューで確定した通り、スイッチ的な操作には「ラベル固定・状態は視覚的表現(スライド)と`aria-checked`で伝える」という一般的な期待があり、ボタンパターンとの混在は誤解を招く。shadcn/ui Switchの構造を踏襲することで、この期待に沿った見た目・挙動になる。
- **Motion Performance再判定**: サムのスライドアニメーションを追加するため、当初の「アニメーションを伴わないためmotion-performance確認は不要」という判断は無効になる。実装時に`/fixing-motion-performance`を対象ファイルに適用する(グローバルな`prefers-reduced-motion`対応は`src/app/globals.css`に既存)。
- **Icon依存の扱い**: `toggle-on`/`toggle-off`アイコン自体は`scripts/gen-icons.mjs`/生成済みファイルに残すが、`FloorRecognitionToggle`からの参照は無くなる(他コンポーネントでの再利用に備えて生成物自体は撤去しない)。
- **Follow-up**: 実装時に`/baseline-ui`・`/fixing-accessibility`・`/fixing-motion-performance`を対象ファイルに適用して最終確認する。

#### Decision: HomeArFallback系コンポーネントのリネーム有無
- **Context**: spotページから`HomeArFallbackExperience`等の"Home"接頭辞付きコンポーネントを利用することになるため、命名を汎用化(リネーム)するかどうか。
- **Alternatives Considered**:
  1. `HomeArFallbackExperience`→`ArFallbackExperience`等へリネームし、型(`HomeArFallbackState`)も含めて汎用名に統一する
  2. 現状の命名のまま、spotからもそのままimportして再利用する
- **Selected Approach**: 2を採用(リネームしない)。
- **Rationale**: `spot-camera-markerless`specで確立された前例(`HiddenArViewer`/`ArModal`/`ModelViewer`を`app/camera/_components`のまま無改名でspotが再利用)に倣う。リネームは機能要件に寄与しない純粋なリファクタリングであり、本spec(トグル追加)のスコープを超える差分・レビューリスクを増やす。
- **Trade-offs**: コンポーネント名が"Home"を含むままspotでも使われる点はやや直感的でないが、コメント(JSDoc)や本design.mdで実体が汎用的である旨を明記することで緩和する。
- **Follow-up**: 将来、命名の汎用化が必要になった場合は別途リファクタリングspecとして起票する。

#### Decision: トグル状態のライフサイクルとフォールバック体験からの復帰時の扱い
- **Context**: フォールバック体験(オフ時の代替撮影体験)から「戻る」で入口画面に戻った際、トグルの状態を保持するかオンにリセットするか。要件1.2は「新たにページへ到達した場合」のデフォルトのみを規定しており、同一セッション内での往復時の挙動は未規定。
- **Alternatives Considered**:
  1. フォールバック体験を抜けるたびにオンへリセットする
  2. ユーザーが選んだ状態をそのセッション内(ページ遷移・リロードなしの間)は保持する
- **Selected Approach**: 2を採用。トグル状態はページ全体を所有する`HomeArExperience`/`SpotArExperience`のstateとして保持し、フォールバック体験の表示/非表示(`view`の切替)によって破棄・リセットされない。
- **Rationale**: オフを選んで撮り直しのために「戻る」を押すたびにオンへ戻ってしまうと、再度オフに切り替える操作をユーザーに毎回強いることになり、要件1の意図(訪問者が状況に応じて選べる)に反する。ページの新規到達(フルリロード)時のみオンにリセットされれば要件1.2を満たす。
- **Trade-offs**: 特になし(Reactのstateはコンポーネントのマウント中は自然に保持されるため、追加実装コストもない)。
- **Follow-up**: なし。

### Risks & Mitigations
- Material Symbolsの`toggle-on`/`toggle-off`が視覚的に「オン/オフ」の意味を直感的に伝えられない可能性 — 実装時にラベル文言(「床認識: オン」/「オフ」)を必ず併記し、アイコン単体の意味理解に依存しない。
- `ArLanding.tsx`へのprops追加により、既存の呼び出し元(`SpotArExperience.tsx`)以外に同コンポーネントを使う箇所がないかの確認漏れ — grep済みで呼び出し元は1箇所のみ(`SpotArExperience.tsx`)であることを確認済み。

### References
- `node_modules/@iconify-json/material-symbols/icons.json` — `toggle-on`/`toggle-off`アイコンの実在確認に使用。
- `.kiro/specs/spot-camera-markerless/design.md` — home/spot間でのコンポーネント無改名共有の前例。
- `.kiro/specs/android-ar-capture-fallback/design.md`, `requirements.md` — 既存の事後申告リンク・代替体験の仕様根拠。
