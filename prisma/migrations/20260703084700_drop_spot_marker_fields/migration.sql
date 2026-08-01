-- マーカーレス（床検知）AR撮影への移行に伴い、Spot のマーカー関連フィールドを削除する。
-- AlterTable
ALTER TABLE "spots"
  DROP COLUMN "mindFileUrl",
  DROP COLUMN "markerImageUrl";
