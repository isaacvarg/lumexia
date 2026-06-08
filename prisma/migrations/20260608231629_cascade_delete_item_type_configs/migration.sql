-- DropForeignKey
ALTER TABLE "experiment_sample_preparation_steps" DROP CONSTRAINT "esps_completed_by_id_fkey";

-- DropForeignKey
ALTER TABLE "experiment_samples" DROP CONSTRAINT "experiment_samples_prepared_by_id_fkey";

-- DropForeignKey
ALTER TABLE "experiment_samples" DROP CONSTRAINT "experiment_samples_uom_id_fkey";

-- DropForeignKey
ALTER TABLE "item_type_configs" DROP CONSTRAINT "item_type_configs_item_type_id_fkey";

-- RenameForeignKey
ALTER TABLE "experiment_sample_files" RENAME CONSTRAINT "esf_file_id_fkey" TO "experiment_sample_files_file_id_fkey";

-- RenameForeignKey
ALTER TABLE "experiment_sample_files" RENAME CONSTRAINT "esf_sample_id_fkey" TO "experiment_sample_files_sample_id_fkey";

-- RenameForeignKey
ALTER TABLE "experiment_sample_note_files" RENAME CONSTRAINT "esnf_file_id_fkey" TO "experiment_sample_note_files_file_id_fkey";

-- RenameForeignKey
ALTER TABLE "experiment_sample_note_files" RENAME CONSTRAINT "esnf_sample_note_id_fkey" TO "experiment_sample_note_files_experiment_sample_note_id_fkey";

-- RenameForeignKey
ALTER TABLE "experiment_sample_notes" RENAME CONSTRAINT "esn_note_type_id_fkey" TO "experiment_sample_notes_note_type_id_fkey";

-- RenameForeignKey
ALTER TABLE "experiment_sample_notes" RENAME CONSTRAINT "esn_sample_id_fkey" TO "experiment_sample_notes_sample_id_fkey";

-- RenameForeignKey
ALTER TABLE "experiment_sample_notes" RENAME CONSTRAINT "esn_user_id_fkey" TO "experiment_sample_notes_user_id_fkey";

-- RenameForeignKey
ALTER TABLE "experiment_sample_preparation_steps" RENAME CONSTRAINT "esps_material_id_fkey" TO "experiment_sample_preparation_steps_experiment_variant_mat_fkey";

-- RenameForeignKey
ALTER TABLE "experiment_sample_preparation_steps" RENAME CONSTRAINT "esps_sample_id_fkey" TO "experiment_sample_preparation_steps_sample_id_fkey";

-- AddForeignKey
ALTER TABLE "item_type_configs" ADD CONSTRAINT "item_type_configs_item_type_id_fkey" FOREIGN KEY ("item_type_id") REFERENCES "item_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_sample_preparation_steps" ADD CONSTRAINT "experiment_sample_preparation_steps_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_samples" ADD CONSTRAINT "experiment_samples_uom_id_fkey" FOREIGN KEY ("uom_id") REFERENCES "units_of_measurement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_samples" ADD CONSTRAINT "experiment_samples_prepared_by_id_fkey" FOREIGN KEY ("prepared_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "esps_sample_material_key" RENAME TO "experiment_sample_preparation_steps_sample_id_experiment_va_key";
