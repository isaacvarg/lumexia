-- Add ordering + grouping to variant materials.
-- sequence: global within a variant (sort key for display)
-- phase:    optional grouping label (e.g. "Phase A", "Heating")

ALTER TABLE "experiment_variant_materials"
  ADD COLUMN "sequence" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "phase" TEXT;

-- Backfill sequence per variant in creation order so existing rows keep their
-- current visual order.
UPDATE "experiment_variant_materials" AS m
SET "sequence" = sub.seq
FROM (
  SELECT id, row_number() OVER (PARTITION BY experiment_variant_id ORDER BY created_at) - 1 AS seq
  FROM "experiment_variant_materials"
) AS sub
WHERE m.id = sub.id;
