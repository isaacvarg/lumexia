-- AlterTable
ALTER TABLE "item_document_requirements" ADD COLUMN     "lot_origin" TEXT,
ADD COLUMN     "sold" BOOLEAN;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "is_sold" BOOLEAN NOT NULL DEFAULT false;
