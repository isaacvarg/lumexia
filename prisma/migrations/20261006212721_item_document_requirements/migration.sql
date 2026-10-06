-- AlterTable
ALTER TABLE "item_files" ADD COLUMN     "derived_from_id" TEXT,
ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "issued_at" TIMESTAMP(3),
ADD COLUMN     "issuer" TEXT NOT NULL DEFAULT 'supplier',
ADD COLUMN     "lot_id" TEXT,
ADD COLUMN     "revision" TEXT,
ADD COLUMN     "superseded_at" TIMESTAMP(3),
ADD COLUMN     "supplier_id" TEXT;

-- CreateTable
CREATE TABLE "item_document_requirements" (
    "id" TEXT NOT NULL,
    "item_type_id" TEXT,
    "procurement_type_id" TEXT,
    "file_type_id" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "valid_for_months" INTEGER,
    "min_issued_at" TIMESTAMP(3),
    "warn_days" INTEGER NOT NULL DEFAULT 60,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "item_document_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "item_document_requirements_item_type_id_idx" ON "item_document_requirements"("item_type_id");

-- CreateIndex
CREATE INDEX "item_document_requirements_procurement_type_id_idx" ON "item_document_requirements"("procurement_type_id");

-- CreateIndex
CREATE INDEX "item_files_item_id_idx" ON "item_files"("item_id");

-- CreateIndex
CREATE INDEX "item_files_lot_id_idx" ON "item_files"("lot_id");

-- AddForeignKey
ALTER TABLE "item_document_requirements" ADD CONSTRAINT "item_document_requirements_item_type_id_fkey" FOREIGN KEY ("item_type_id") REFERENCES "item_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_document_requirements" ADD CONSTRAINT "item_document_requirements_procurement_type_id_fkey" FOREIGN KEY ("procurement_type_id") REFERENCES "procurement_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_document_requirements" ADD CONSTRAINT "item_document_requirements_file_type_id_fkey" FOREIGN KEY ("file_type_id") REFERENCES "item_file_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_files" ADD CONSTRAINT "item_files_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_files" ADD CONSTRAINT "item_files_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_files" ADD CONSTRAINT "item_files_derived_from_id_fkey" FOREIGN KEY ("derived_from_id") REFERENCES "item_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: COAs made by the in-app generator (uploaded under item/coa/) are internal documents.
-- Link each to its lot via the "_Lot-<lot>_" part of its filename and treat its upload date as its issue date.
UPDATE "item_files" itf
SET "issuer" = 'internal',
    "issued_at" = f."created_at",
    "lot_id" = (
      SELECT l."id" FROM "lots" l
      WHERE l."item_id" = itf."item_id"
        AND f."name" LIKE '%\_Lot-' || regexp_replace(l."lot_number", '[^a-zA-Z0-9_-]', '_', 'g') || '\_%'
      ORDER BY l."created_at" DESC
      LIMIT 1
    )
FROM "files" f
WHERE f."id" = itf."file_id"
  AND f."object_name" LIKE 'item/coa/%';
