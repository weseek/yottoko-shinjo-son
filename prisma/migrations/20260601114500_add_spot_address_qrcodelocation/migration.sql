-- スポット詳細機能 (commit 33d1aa4) で schema に address / qrCodeLocation が
-- 追加されたが、対応する migration が作られていなかったため本番 DB に列が存在せず
-- next-admin の Spot 取得が P2022 (column does not exist) で失敗していた。これを補修する。
--
-- 既存行が存在するため、一時的に DEFAULT '' を付与してから DROP DEFAULT し、
-- schema 定義 (NOT NULL・default なし) と一致させる。
ALTER TABLE "spots" ADD COLUMN "address" TEXT NOT NULL DEFAULT '';
ALTER TABLE "spots" ADD COLUMN "qrCodeLocation" TEXT NOT NULL DEFAULT '';
ALTER TABLE "spots" ALTER COLUMN "address" DROP DEFAULT;
ALTER TABLE "spots" ALTER COLUMN "qrCodeLocation" DROP DEFAULT;
