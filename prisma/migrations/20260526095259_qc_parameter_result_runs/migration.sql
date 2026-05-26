-- DropIndex
DROP INDEX "qc_parameter_results_qc_record_id_qc_item_parameter_id_key";

-- AlterTable
ALTER TABLE "qc_parameter_results" ADD COLUMN "run_number" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "qc_parameter_results_qc_record_id_qc_item_parameter_id_run_number_key" ON "qc_parameter_results"("qc_record_id", "qc_item_parameter_id", "run_number");
