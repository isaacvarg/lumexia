-- Sample preparation: target size + UOM, prepared-by audit fields,
-- and a junction table for per-material check-off during prep.

ALTER TABLE "experiment_samples"
  ADD COLUMN "size" DOUBLE PRECISION,
  ADD COLUMN "uom_id" TEXT,
  ADD COLUMN "prepared_at" TIMESTAMP(3),
  ADD COLUMN "prepared_by_id" TEXT;

ALTER TABLE "experiment_samples"
  ADD CONSTRAINT "experiment_samples_uom_id_fkey"
  FOREIGN KEY ("uom_id") REFERENCES "units_of_measurement"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "experiment_samples"
  ADD CONSTRAINT "experiment_samples_prepared_by_id_fkey"
  FOREIGN KEY ("prepared_by_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "experiment_sample_preparation_steps" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sample_id" TEXT NOT NULL,
  "experiment_variant_material_id" TEXT NOT NULL,
  "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_by_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX "esps_sample_material_key"
  ON "experiment_sample_preparation_steps"("sample_id", "experiment_variant_material_id");

ALTER TABLE "experiment_sample_preparation_steps"
  ADD CONSTRAINT "esps_sample_id_fkey"
  FOREIGN KEY ("sample_id") REFERENCES "experiment_samples"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "experiment_sample_preparation_steps"
  ADD CONSTRAINT "esps_material_id_fkey"
  FOREIGN KEY ("experiment_variant_material_id") REFERENCES "experiment_variant_materials"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "experiment_sample_preparation_steps"
  ADD CONSTRAINT "esps_completed_by_id_fkey"
  FOREIGN KEY ("completed_by_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
