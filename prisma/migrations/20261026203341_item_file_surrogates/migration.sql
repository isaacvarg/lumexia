-- AlterTable
ALTER TABLE "item_files" ADD COLUMN     "surrogate_for_item_file_id" TEXT,
ADD COLUMN     "surrogate_reason" TEXT;

-- AddForeignKey
ALTER TABLE "item_files" ADD CONSTRAINT "item_files_surrogate_for_item_file_id_fkey" FOREIGN KEY ("surrogate_for_item_file_id") REFERENCES "item_files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
