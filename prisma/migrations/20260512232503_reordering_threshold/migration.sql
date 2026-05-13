-- CreateTable
CREATE TABLE "reordering_rules" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "threshold_quantity" DOUBLE PRECISION NOT NULL,
    "buffer_percent" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "create_audit_request" BOOLEAN NOT NULL DEFAULT false,
    "create_purchasing_request" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reordering_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reordering_rules_item_id_key" ON "reordering_rules"("item_id");

-- AddForeignKey
ALTER TABLE "reordering_rules" ADD CONSTRAINT "reordering_rules_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
