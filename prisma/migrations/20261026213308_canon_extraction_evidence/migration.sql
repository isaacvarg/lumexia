-- AlterTable
ALTER TABLE "canon_change_request_sources" ADD COLUMN     "extraction_id" TEXT,
ADD COLUMN     "fact_ids" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey
ALTER TABLE "canon_change_request_sources" ADD CONSTRAINT "canon_change_request_sources_extraction_id_fkey" FOREIGN KEY ("extraction_id") REFERENCES "document_extractions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
