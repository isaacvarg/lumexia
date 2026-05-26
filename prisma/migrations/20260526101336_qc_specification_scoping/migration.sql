-- AlterTable: add new columns. examination_type_id starts nullable for backfill.
ALTER TABLE "qc_item_specifications"
  ADD COLUMN "name" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "examination_type_id" TEXT,
  ADD COLUMN "display_on_coa" BOOLEAN NOT NULL DEFAULT true;

-- Backfill: any existing spec gets the lexicographically-first examination type.
-- Safe no-op if there are no existing specs. If your data needs a specific mapping,
-- update these rows manually before running this migration.
UPDATE "qc_item_specifications"
SET "examination_type_id" = (SELECT "id" FROM "qc_examination_types" ORDER BY "name" ASC LIMIT 1)
WHERE "examination_type_id" IS NULL;

-- Now enforce NOT NULL.
ALTER TABLE "qc_item_specifications"
  ALTER COLUMN "examination_type_id" SET NOT NULL;

-- Drop the default on name; existing rows already have ''.
ALTER TABLE "qc_item_specifications"
  ALTER COLUMN "name" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "qc_item_specifications"
  ADD CONSTRAINT "qc_item_specifications_examination_type_id_fkey"
  FOREIGN KEY ("examination_type_id") REFERENCES "qc_examination_types"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "qc_item_specifications_item_parameter_id_examination_type_id_idx"
  ON "qc_item_specifications"("item_parameter_id", "examination_type_id");
