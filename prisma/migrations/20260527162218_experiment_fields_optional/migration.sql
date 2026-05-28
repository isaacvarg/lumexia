-- Relax the not-null constraint on objective and primary_subject_id so
-- experiments can be created as a stub and filled in later.

ALTER TABLE "experiments" ALTER COLUMN "objective" DROP NOT NULL;
ALTER TABLE "experiments" ALTER COLUMN "primary_subject_id" DROP NOT NULL;
