-- AlterTable
ALTER TABLE "canon_data_types" ADD COLUMN     "group_id" TEXT;

-- CreateTable
CREATE TABLE "canon_data_type_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "canon_data_type_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "canon_data_type_groups_name_key" ON "canon_data_type_groups"("name");

-- AddForeignKey
ALTER TABLE "canon_data_types" ADD CONSTRAINT "canon_data_types_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "canon_data_type_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
