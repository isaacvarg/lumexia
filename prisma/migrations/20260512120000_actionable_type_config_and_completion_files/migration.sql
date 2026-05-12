-- Adds per-type configuration to StepActionableType (e.g. numeric range, photo
-- accept patterns, text maxLength) so admins can constrain actionables without
-- hardcoding rules in code. Stored as JSONB; nullable for existing rows.
--
-- Also introduces the junction table backing photo-evidence actionables: a
-- BprStepActionableCompletion can have many attached Files, mirroring the
-- existing BprStagingFile pattern.

ALTER TABLE "step_actionable_types" ADD COLUMN "config" JSONB;

CREATE TABLE "bpr_step_actionable_completion_files" (
    "id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "completion_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bpr_step_actionable_completion_files_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "bpr_step_actionable_completion_files"
    ADD CONSTRAINT "bpr_step_actionable_completion_files_file_id_fkey"
    FOREIGN KEY ("file_id") REFERENCES "files"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bpr_step_actionable_completion_files"
    ADD CONSTRAINT "bpr_step_actionable_completion_files_completion_id_fkey"
    FOREIGN KEY ("completion_id") REFERENCES "bpr_step_action_completions"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
