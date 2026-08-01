# 要件定義書

## プロジェクト概要（入力）
adminがアクティビティの登録・編集時に画像をアップロードでき、ユーザーがアクティビティ詳細画面で画像を閲覧できるようにする。画像の保存・アップロード処理はスポット画像と同様の仕組みで実装する。

## 前提・現状分析

- `ActivityImage` モデルはPrismaスキーマに既定義（`url`, `order`, `activityId`）
- ユーザー向けの活動詳細ページ・一覧ページは `images` の表示に対応済み（データがあれば表示される）
- スポット用の画像アップロードAPI（`/api/admin/upload`）と `ImageUploadInput` コンポーネントが存在する
- **未実装**: admin画面の Activity 編集フォームに画像管理UIがない

---

## 要件

### 要件 1: アクティビティ画像のアップロード（管理者）

**目的:** 管理者として、アクティビティの登録・編集画面から画像をアップロードしたい。それにより、訪問者にアクティビティの内容を視覚的に伝えられる。

#### 受け入れ基準

1. When 管理者がアクティビティの編集フォームで画像ファイルを選択したとき、the Admin system shall `/api/admin/upload` にファイルをアップロードし、取得したURLで `ActivityImage` レコードを作成する
2. The Admin system shall JPEG・PNG・WebP・GIF 形式、最大5MBのファイルのみを受け付ける（スポット画像と同仕様）
3. If 対応外のファイル形式またはサイズ超過のファイルが選択されたとき、the Admin system shall フォーム上にエラーメッセージを表示する
4. When アップロードが成功したとき、the Admin system shall アップロード済み画像のプレビューをフォーム内に表示する
5. The Admin system shall 1つのアクティビティに対して複数枚の画像を登録できる

---

### 要件 2: アクティビティ画像の削除・並び順管理（管理者）

**目的:** 管理者として、アップロード済みの画像を削除・並び替えしたい。それにより、表示内容を柔軟に管理できる。

#### 受け入れ基準

1. When 管理者が画像の削除ボタンをクリックしたとき、the Admin system shall 対応する `ActivityImage` レコードをDBから削除する
2. The Admin system shall `ActivityImage.order` フィールドの昇順で画像を表示する
3. When 管理者が画像の並び順を変更したとき、the Admin system shall `ActivityImage.order` を更新する

---

### 要件 3: アクティビティ一覧のサムネイル表示（訪問者）

**目的:** 訪問者として、アクティビティ一覧でサムネイル画像を確認したい。それにより、コンテンツを視覚的に把握して興味のある体験を選びやすくなる。

#### 受け入れ基準

1. When 訪問者がアクティビティ一覧ページを開いたとき、the Activity List page shall `order` の昇順で最初の `ActivityImage` をカードのサムネイルとして表示する
2. If アクティビティに画像が登録されていないとき、the Activity List page shall プレースホルダーグラフィックを表示する

---

### 要件 4: アクティビティ詳細の画像表示（訪問者）

**目的:** 訪問者として、アクティビティ詳細ページでアップロードされた全画像を閲覧したい。それにより、体験内容をより深く理解して申込の判断ができる。

#### 受け入れ基準

1. When 訪問者がアクティビティ詳細ページを開いたとき、the Activity Detail page shall `ActivityImage.order` の昇順で全画像を表示する
2. If アクティビティに画像が登録されていないとき、the Activity Detail page shall プレースホルダーグラフィックを表示する
3. The Activity Detail page shall 各画像に適切な代替テキスト（alt属性）を設定し、アクセシビリティ要件を満たす
