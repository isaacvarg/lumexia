-- Per-step check-off gate: a BPR BOM line is "added to the batch" when an
-- operator confirms the staged material has actually been compounded into the
-- batch per the step's instructions. Captured as a timestamp + userId on the
-- BOM-line row itself; null means not-yet-added. Used to gate batch-step
-- completion so a step can't be marked done until every BOM line for it has
-- been checked off.

ALTER TABLE "bpr_bills_of_materials" ADD COLUMN "added_at" TIMESTAMP(3);
ALTER TABLE "bpr_bills_of_materials" ADD COLUMN "added_by_user_id" TEXT;

ALTER TABLE "bpr_bills_of_materials"
    ADD CONSTRAINT "bpr_bills_of_materials_added_by_user_id_fkey"
    FOREIGN KEY ("added_by_user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
