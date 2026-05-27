-- AlterTable
ALTER TABLE "suppliers" ALTER COLUMN "record_status_id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "experiment_files" (
    "id" TEXT NOT NULL,
    "experiment_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_group_statuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "text_color" TEXT NOT NULL DEFAULT '#000000',
    "bg_color" TEXT NOT NULL DEFAULT '#077202',
    "sequence" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_group_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_groups" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_note_files" (
    "id" TEXT NOT NULL,
    "experiment_note_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_note_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_note_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "text_color" TEXT NOT NULL DEFAULT '#000000',
    "bg_color" TEXT NOT NULL DEFAULT '#077202',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_note_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_notes" (
    "id" TEXT NOT NULL,
    "experiment_id" TEXT NOT NULL,
    "note_type_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_samples" (
    "id" TEXT NOT NULL,
    "reference_code" SERIAL NOT NULL,
    "experiment_id" TEXT NOT NULL,
    "experiment_variant_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_statuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "text_color" TEXT NOT NULL DEFAULT '#000000',
    "bg_color" TEXT NOT NULL DEFAULT '#077202',
    "sequence" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_variant_materials" (
    "id" TEXT NOT NULL,
    "experiment_variant_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "concentration" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_variant_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_variants" (
    "id" TEXT NOT NULL,
    "experiment_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" TEXT NOT NULL,
    "reference_code" SERIAL NOT NULL,
    "status_id" TEXT NOT NULL,
    "primary_investigator_id" TEXT NOT NULL,
    "primary_subject_id" TEXT NOT NULL,
    "experiment_group_id" TEXT,
    "objective" TEXT NOT NULL,
    "hypothesis" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "experiment_group_statuses_sequence_key" ON "experiment_group_statuses"("sequence");

-- CreateIndex
CREATE UNIQUE INDEX "experiment_samples_reference_code_key" ON "experiment_samples"("reference_code");

-- CreateIndex
CREATE UNIQUE INDEX "experiment_statuses_sequence_key" ON "experiment_statuses"("sequence");

-- CreateIndex
CREATE UNIQUE INDEX "experiment_variant_materials_experiment_variant_id_item_id_key" ON "experiment_variant_materials"("experiment_variant_id", "item_id");

-- AddForeignKey
ALTER TABLE "experiment_files" ADD CONSTRAINT "experiment_files_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_files" ADD CONSTRAINT "experiment_files_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_groups" ADD CONSTRAINT "experiment_groups_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "experiment_group_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_note_files" ADD CONSTRAINT "experiment_note_files_experiment_note_id_fkey" FOREIGN KEY ("experiment_note_id") REFERENCES "experiment_notes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_note_files" ADD CONSTRAINT "experiment_note_files_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_notes" ADD CONSTRAINT "experiment_notes_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_notes" ADD CONSTRAINT "experiment_notes_note_type_id_fkey" FOREIGN KEY ("note_type_id") REFERENCES "experiment_note_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_notes" ADD CONSTRAINT "experiment_notes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_samples" ADD CONSTRAINT "experiment_samples_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_samples" ADD CONSTRAINT "experiment_samples_experiment_variant_id_fkey" FOREIGN KEY ("experiment_variant_id") REFERENCES "experiment_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_variant_materials" ADD CONSTRAINT "experiment_variant_materials_experiment_variant_id_fkey" FOREIGN KEY ("experiment_variant_id") REFERENCES "experiment_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_variant_materials" ADD CONSTRAINT "experiment_variant_materials_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_variants" ADD CONSTRAINT "experiment_variants_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "experiment_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_primary_investigator_id_fkey" FOREIGN KEY ("primary_investigator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_primary_subject_id_fkey" FOREIGN KEY ("primary_subject_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_experiment_group_id_fkey" FOREIGN KEY ("experiment_group_id") REFERENCES "experiment_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "qc_item_specifications_item_parameter_id_examination_type_id_id" RENAME TO "qc_item_specifications_item_parameter_id_examination_type_i_idx";

-- RenameIndex
ALTER INDEX "qc_parameter_results_qc_record_id_qc_item_parameter_id_run_numb" RENAME TO "qc_parameter_results_qc_record_id_qc_item_parameter_id_run__key";
