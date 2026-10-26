-- CreateTable
CREATE TABLE "canon_data_type_fact_definitions" (
    "data_type_id" TEXT NOT NULL,
    "fact_definition_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "canon_data_type_fact_definitions_pkey" PRIMARY KEY ("data_type_id","fact_definition_id")
);

-- AddForeignKey
ALTER TABLE "canon_data_type_fact_definitions" ADD CONSTRAINT "canon_data_type_fact_definitions_data_type_id_fkey" FOREIGN KEY ("data_type_id") REFERENCES "canon_data_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canon_data_type_fact_definitions" ADD CONSTRAINT "canon_data_type_fact_definitions_fact_definition_id_fkey" FOREIGN KEY ("fact_definition_id") REFERENCES "fact_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
