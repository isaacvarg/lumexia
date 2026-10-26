-- AlterTable
ALTER TABLE "files" ADD COLUMN     "sha256" TEXT;

-- CreateTable
CREATE TABLE "document_extractions" (
    "id" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'current',
    "superseded_by_id" TEXT,
    "extractor_name" TEXT,
    "extractor_version" TEXT,
    "extractor_model" TEXT,
    "methods" TEXT[],
    "language" TEXT,
    "page_count" INTEGER,
    "notes" TEXT,
    "failure_reason" TEXT,
    "review_state" TEXT NOT NULL DEFAULT 'unreviewed',
    "conflicts" JSONB,
    "created_by_id" TEXT NOT NULL,
    "api_key_id" TEXT,
    "on_behalf_of_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_extractions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_extraction_texts" (
    "extraction_id" TEXT NOT NULL,
    "full_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_extraction_texts_pkey" PRIMARY KEY ("extraction_id")
);

-- CreateTable
CREATE TABLE "fact_definitions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT NOT NULL,
    "value_schema" JSONB NOT NULL DEFAULT '{}',
    "unit_family" TEXT,
    "safety_relevant" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 1000,
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "source" TEXT NOT NULL DEFAULT 'agent',
    "merged_into_id" TEXT,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fact_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fact_definition_file_types" (
    "fact_definition_id" TEXT NOT NULL,
    "file_type_id" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fact_definition_file_types_pkey" PRIMARY KEY ("fact_definition_id","file_type_id")
);

-- CreateTable
CREATE TABLE "extracted_facts" (
    "id" TEXT NOT NULL,
    "extraction_id" TEXT NOT NULL,
    "definition_id" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'material',
    "component_name" TEXT,
    "component_cas" TEXT,
    "value" JSONB NOT NULL,
    "printed" TEXT,
    "unit" TEXT,
    "normalized_value" DOUBLE PRECISION,
    "normalized_max" DOUBLE PRECISION,
    "normalized_unit" TEXT,
    "row_index" INTEGER,
    "page_index" INTEGER,
    "page_label" TEXT,
    "quote" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "needs_human_check" BOOLEAN NOT NULL DEFAULT false,
    "state" TEXT NOT NULL DEFAULT 'active',
    "replaces_fact_id" TEXT,
    "verified_by_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "extracted_facts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_extraction_events" (
    "id" TEXT NOT NULL,
    "extraction_id" TEXT,
    "fact_id" TEXT,
    "fact_definition_id" TEXT,
    "type" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "api_key_id" TEXT,
    "on_behalf_of_id" TEXT,
    "reason" TEXT,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_extraction_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_extractions_sha256_status_idx" ON "document_extractions"("sha256", "status");

-- CreateIndex
CREATE UNIQUE INDEX "fact_definitions_key_key" ON "fact_definitions"("key");

-- CreateIndex
CREATE INDEX "extracted_facts_extraction_id_idx" ON "extracted_facts"("extraction_id");

-- CreateIndex
CREATE INDEX "extracted_facts_definition_id_normalized_value_idx" ON "extracted_facts"("definition_id", "normalized_value");

-- CreateIndex
CREATE INDEX "extracted_facts_component_cas_idx" ON "extracted_facts"("component_cas");

-- CreateIndex
CREATE INDEX "document_extraction_events_extraction_id_idx" ON "document_extraction_events"("extraction_id");

-- CreateIndex
CREATE INDEX "document_extraction_events_fact_definition_id_idx" ON "document_extraction_events"("fact_definition_id");

-- CreateIndex
CREATE INDEX "files_sha256_idx" ON "files"("sha256");

-- AddForeignKey
ALTER TABLE "document_extractions" ADD CONSTRAINT "document_extractions_superseded_by_id_fkey" FOREIGN KEY ("superseded_by_id") REFERENCES "document_extractions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_extractions" ADD CONSTRAINT "document_extractions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_extraction_texts" ADD CONSTRAINT "document_extraction_texts_extraction_id_fkey" FOREIGN KEY ("extraction_id") REFERENCES "document_extractions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_definitions" ADD CONSTRAINT "fact_definitions_merged_into_id_fkey" FOREIGN KEY ("merged_into_id") REFERENCES "fact_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_definitions" ADD CONSTRAINT "fact_definitions_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_definition_file_types" ADD CONSTRAINT "fact_definition_file_types_fact_definition_id_fkey" FOREIGN KEY ("fact_definition_id") REFERENCES "fact_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_definition_file_types" ADD CONSTRAINT "fact_definition_file_types_file_type_id_fkey" FOREIGN KEY ("file_type_id") REFERENCES "item_file_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_facts" ADD CONSTRAINT "extracted_facts_extraction_id_fkey" FOREIGN KEY ("extraction_id") REFERENCES "document_extractions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_facts" ADD CONSTRAINT "extracted_facts_definition_id_fkey" FOREIGN KEY ("definition_id") REFERENCES "fact_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_facts" ADD CONSTRAINT "extracted_facts_replaces_fact_id_fkey" FOREIGN KEY ("replaces_fact_id") REFERENCES "extracted_facts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_facts" ADD CONSTRAINT "extracted_facts_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extracted_facts" ADD CONSTRAINT "extracted_facts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_extraction_events" ADD CONSTRAINT "document_extraction_events_extraction_id_fkey" FOREIGN KEY ("extraction_id") REFERENCES "document_extractions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_extraction_events" ADD CONSTRAINT "document_extraction_events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
