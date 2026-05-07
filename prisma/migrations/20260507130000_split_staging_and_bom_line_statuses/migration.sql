-- Split the overloaded BprStagingStatus enum into two:
--   - bpr_staging_statuses keeps tracking BprStaging (the lot pull) but its
--     vocabulary is reduced + relabeled.
--   - bpr_bom_line_statuses (new) tracks BprBillOfMaterials (the line item).
--
-- Old shared values mapped to new vocabularies:
--   notStarted (3d5f8db4-...)            staging row -> renamed to "Denied"
--                                        BOM line    -> bpr_bom_line_statuses.pending
--   staged (ee67bd6c-...)                staging row -> unchanged
--                                        BOM line    -> bpr_bom_line_statuses.staged
--   verified (9a8f0c18-...)              staging row -> renamed to "Primary Verified"
--                                        BOM line    -> bpr_bom_line_statuses.primaryVerified
--   secondaryVerification (52311908-...) staging row -> renamed to "Secondary Verified"
--                                        BOM line    -> bpr_bom_line_statuses.secondaryVerified
--   consumed (ec7240b9-...)              staging row -> unchanged
--                                        BOM line    -> bpr_bom_line_statuses.consumed

-- 1. Create bpr_bom_line_statuses
CREATE TABLE "bpr_bom_line_statuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bpr_bom_line_statuses_pkey" PRIMARY KEY ("id")
);

-- 2. Seed bpr_bom_line_statuses with predetermined UUIDs so static-records
--    regeneration produces a stable, version-controlled mapping.
INSERT INTO "bpr_bom_line_statuses" ("id", "name", "sequence", "description", "updated_at") VALUES
    ('8b74733c-1e1e-46a6-80cc-777c3395254c', 'Pending',             0, 'Initial state before any staging has been pulled.', CURRENT_TIMESTAMP),
    ('25fb5e4b-9fbb-4f88-8db7-d09c9a341d1e', 'Staged',              1, 'All required quantity has been staged.',            CURRENT_TIMESTAMP),
    ('926e41e6-ed3e-4c7e-9050-d42a35d8e903', 'Primary Verified',    2, 'Stagings have all passed primary verification.',    CURRENT_TIMESTAMP),
    ('93ef75c6-d421-46b7-87ff-5e081522bbc3', 'Secondary Verified',  3, 'Stagings have all passed secondary verification.',  CURRENT_TIMESTAMP),
    ('8265f47a-f158-4ea6-8880-13ac65bf34cc', 'Consumed',            4, 'Stagings have been consumed by the batch.',         CURRENT_TIMESTAMP);

-- 3. Repoint bpr_bills_of_materials.status_id from bpr_staging_statuses to
--    bpr_bom_line_statuses. Drop the old FK first, rewrite values, add new FK.
ALTER TABLE "bpr_bills_of_materials" DROP CONSTRAINT "bpr_bills_of_materials_status_id_fkey";

UPDATE "bpr_bills_of_materials" SET "status_id" = '8b74733c-1e1e-46a6-80cc-777c3395254c' WHERE "status_id" = '3d5f8db4-3937-41e0-840b-da3c1ab682c5';
UPDATE "bpr_bills_of_materials" SET "status_id" = '25fb5e4b-9fbb-4f88-8db7-d09c9a341d1e' WHERE "status_id" = 'ee67bd6c-974e-407d-99d8-6482b77aabec';
UPDATE "bpr_bills_of_materials" SET "status_id" = '926e41e6-ed3e-4c7e-9050-d42a35d8e903' WHERE "status_id" = '9a8f0c18-a035-424c-ba0f-d7635cf1fee8';
UPDATE "bpr_bills_of_materials" SET "status_id" = '93ef75c6-d421-46b7-87ff-5e081522bbc3' WHERE "status_id" = '52311908-0abf-4fa8-92d9-0152cce93da7';
UPDATE "bpr_bills_of_materials" SET "status_id" = '8265f47a-f158-4ea6-8880-13ac65bf34cc' WHERE "status_id" = 'ec7240b9-d2db-4447-9ad5-1b2ff0ba7885';

ALTER TABLE "bpr_bills_of_materials"
    ADD CONSTRAINT "bpr_bills_of_materials_status_id_fkey"
    FOREIGN KEY ("status_id") REFERENCES "bpr_bom_line_statuses"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- 4. Rename remaining bpr_staging_statuses rows to reflect their new role.
--    The "Not Started" row becomes "Denied" -- it was only ever written by the
--    deny handler and is now the explicit "rejected during verification" state.
UPDATE "bpr_staging_statuses"
    SET "name" = 'Denied', "description" = 'Reverted or denied during verification.'
    WHERE "id" = '3d5f8db4-3937-41e0-840b-da3c1ab682c5';

UPDATE "bpr_staging_statuses"
    SET "name" = 'Primary Verified'
    WHERE "id" = '9a8f0c18-a035-424c-ba0f-d7635cf1fee8';

UPDATE "bpr_staging_statuses"
    SET "name" = 'Secondary Verified'
    WHERE "id" = '52311908-0abf-4fa8-92d9-0152cce93da7';
