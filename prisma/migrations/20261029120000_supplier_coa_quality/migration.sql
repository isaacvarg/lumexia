-- AlterTable
ALTER TABLE "qc_item_specifications" ADD COLUMN     "created_by_id" TEXT,
ADD COLUMN     "source_item_file_id" TEXT;

-- AlterTable
ALTER TABLE "qc_parameter_results" ADD COLUMN     "computed_outcome" TEXT,
ADD COLUMN     "confirmed_at" TIMESTAMP(3),
ADD COLUMN     "confirmed_by_id" TEXT,
ADD COLUMN     "review_reasons" JSONB,
ADD COLUMN     "review_state" TEXT NOT NULL DEFAULT 'accepted',
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "source_fact_id" TEXT,
ADD COLUMN     "source_item_file_id" TEXT,
ADD COLUMN     "suggested_outcome" TEXT,
ADD COLUMN     "supplier_outcome" TEXT;

-- AlterTable
ALTER TABLE "qc_records" ADD COLUMN     "source_item_file_id" TEXT;

-- CreateTable
CREATE TABLE "qc_item_baselines" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source_item_file_id" TEXT,
    "approved_by_id" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qc_item_baselines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qc_coa_imports" (
    "id" TEXT NOT NULL,
    "lot_id" TEXT NOT NULL,
    "item_file_id" TEXT NOT NULL,
    "qc_record_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "report" JSONB,
    "superseded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qc_coa_imports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qc_item_baselines_item_id_key" ON "qc_item_baselines"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "qc_coa_imports_lot_id_item_file_id_key" ON "qc_coa_imports"("lot_id", "item_file_id");

-- AddForeignKey
ALTER TABLE "qc_item_baselines" ADD CONSTRAINT "qc_item_baselines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_item_baselines" ADD CONSTRAINT "qc_item_baselines_source_item_file_id_fkey" FOREIGN KEY ("source_item_file_id") REFERENCES "item_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_item_baselines" ADD CONSTRAINT "qc_item_baselines_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_coa_imports" ADD CONSTRAINT "qc_coa_imports_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_coa_imports" ADD CONSTRAINT "qc_coa_imports_item_file_id_fkey" FOREIGN KEY ("item_file_id") REFERENCES "item_files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_coa_imports" ADD CONSTRAINT "qc_coa_imports_qc_record_id_fkey" FOREIGN KEY ("qc_record_id") REFERENCES "qc_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qc_coa_imports" ADD CONSTRAINT "qc_coa_imports_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

