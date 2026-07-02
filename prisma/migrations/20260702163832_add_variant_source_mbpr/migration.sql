-- AlterTable
ALTER TABLE "experiment_variants" ADD COLUMN     "source_mbpr_id" TEXT;

-- AddForeignKey
ALTER TABLE "experiment_variants" ADD CONSTRAINT "experiment_variants_source_mbpr_id_fkey" FOREIGN KEY ("source_mbpr_id") REFERENCES "master_batch_production_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;
