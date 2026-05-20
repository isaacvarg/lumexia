-- DropForeignKey
ALTER TABLE "pricing_queue" DROP CONSTRAINT IF EXISTS "pricing_queue_item_id_fkey";

-- DropTable
DROP TABLE IF EXISTS "pricing_queue";

-- AlterTable
ALTER TABLE "pricing_examinations"
    ADD COLUMN "approved_by_id" TEXT,
    ADD COLUMN "approved_at" TIMESTAMP(3),
    ADD COLUMN "rejected_by_id" TEXT,
    ADD COLUMN "rejected_at" TIMESTAMP(3),
    ADD COLUMN "rejected_from_id" TEXT;

-- AddForeignKey
ALTER TABLE "pricing_examinations"
    ADD CONSTRAINT "pricing_examinations_approved_by_id_fkey"
    FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_examinations"
    ADD CONSTRAINT "pricing_examinations_rejected_by_id_fkey"
    FOREIGN KEY ("rejected_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_examinations"
    ADD CONSTRAINT "pricing_examinations_rejected_from_id_fkey"
    FOREIGN KEY ("rejected_from_id") REFERENCES "pricing_examinations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
