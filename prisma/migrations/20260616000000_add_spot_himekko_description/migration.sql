-- spots テーブルにスポット限定ひめっこ説明文カラムを追加。
-- カメラランディングページ (spots/[slug]/camera) で表示する任意テキスト。
ALTER TABLE "spots" ADD COLUMN "himekkoDescription" TEXT;
