-- AlterEnum: add CANCELLED value to EntryStatus
ALTER TYPE "EntryStatus" ADD VALUE 'CANCELLED';

-- AlterTable: add cancelToken to entries with UUID default
ALTER TABLE "entries" ADD COLUMN "cancelToken" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "entries_cancelToken_key" ON "entries"("cancelToken");
