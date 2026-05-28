-- Sample-level notes, sample-level note-file attachments, and direct
-- sample-level file attachments.

CREATE TABLE "experiment_sample_notes" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sample_id" TEXT NOT NULL,
  "note_type_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

ALTER TABLE "experiment_sample_notes"
  ADD CONSTRAINT "esn_sample_id_fkey"
  FOREIGN KEY ("sample_id") REFERENCES "experiment_samples"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "experiment_sample_notes"
  ADD CONSTRAINT "esn_note_type_id_fkey"
  FOREIGN KEY ("note_type_id") REFERENCES "experiment_note_types"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "experiment_sample_notes"
  ADD CONSTRAINT "esn_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;


CREATE TABLE "experiment_sample_note_files" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "experiment_sample_note_id" TEXT NOT NULL,
  "file_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

ALTER TABLE "experiment_sample_note_files"
  ADD CONSTRAINT "esnf_sample_note_id_fkey"
  FOREIGN KEY ("experiment_sample_note_id") REFERENCES "experiment_sample_notes"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "experiment_sample_note_files"
  ADD CONSTRAINT "esnf_file_id_fkey"
  FOREIGN KEY ("file_id") REFERENCES "files"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;


CREATE TABLE "experiment_sample_files" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sample_id" TEXT NOT NULL,
  "file_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

ALTER TABLE "experiment_sample_files"
  ADD CONSTRAINT "esf_sample_id_fkey"
  FOREIGN KEY ("sample_id") REFERENCES "experiment_samples"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "experiment_sample_files"
  ADD CONSTRAINT "esf_file_id_fkey"
  FOREIGN KEY ("file_id") REFERENCES "files"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
