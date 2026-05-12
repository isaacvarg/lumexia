-- DropForeignKey
ALTER TABLE "bpr_step_actionable_completion_files" DROP CONSTRAINT "bpr_step_actionable_completion_files_completion_id_fkey";

-- AddForeignKey
ALTER TABLE "bpr_step_actionable_completion_files" ADD CONSTRAINT "bpr_step_actionable_completion_files_completion_id_fkey" FOREIGN KEY ("completion_id") REFERENCES "bpr_step_action_completions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
