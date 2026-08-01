-- AlterTable
-- スポットを地図上にピン表示するための緯度・経度。
-- 住所からのジオコーディング結果を保持する。未取得・取得失敗時は NULL。
ALTER TABLE "spots" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
