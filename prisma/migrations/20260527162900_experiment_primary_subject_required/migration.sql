-- Revert: experiment.primary_subject_id is required again. The create flow
-- now demands an item up-front via the item-search modal, so a stub
-- experiment without a subject is no longer possible.

ALTER TABLE "experiments" ALTER COLUMN "primary_subject_id" SET NOT NULL;
