-- AlterTable
ALTER TABLE "item_files" ADD COLUMN     "purchase_order_id" TEXT,
ADD COLUMN     "supplier_lot_number" TEXT;

-- AlterTable
ALTER TABLE "lots" ADD COLUMN     "expires_at" TIMESTAMP(3),
ADD COLUMN     "manufactured_at" TIMESTAMP(3),
ADD COLUMN     "receipt_line_id" TEXT,
ADD COLUMN     "supplier_lot_number" TEXT;

-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "received_by_id" TEXT NOT NULL,
    "packing_slip_number" TEXT,
    "carrier" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_lines" (
    "id" TEXT NOT NULL,
    "receipt_id" TEXT NOT NULL,
    "purchase_order_item_id" TEXT NOT NULL,
    "open_quantity" DOUBLE PRECISION NOT NULL,
    "received_quantity" DOUBLE PRECISION NOT NULL,
    "checks" JSONB NOT NULL,
    "has_issue" BOOLEAN NOT NULL DEFAULT false,
    "issue_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipt_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_files" (
    "id" TEXT NOT NULL,
    "receipt_id" TEXT NOT NULL,
    "receipt_line_id" TEXT,
    "file_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "receipt_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "receipts_purchase_order_id_idx" ON "receipts"("purchase_order_id");

-- CreateIndex
CREATE INDEX "receipt_lines_receipt_id_idx" ON "receipt_lines"("receipt_id");

-- CreateIndex
CREATE INDEX "receipt_files_receipt_id_idx" ON "receipt_files"("receipt_id");

-- CreateIndex
CREATE INDEX "item_files_supplier_lot_number_idx" ON "item_files"("supplier_lot_number");

-- CreateIndex
CREATE INDEX "lots_receipt_line_id_idx" ON "lots"("receipt_line_id");

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_receipt_line_id_fkey" FOREIGN KEY ("receipt_line_id") REFERENCES "receipt_lines"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_received_by_id_fkey" FOREIGN KEY ("received_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_lines" ADD CONSTRAINT "receipt_lines_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_lines" ADD CONSTRAINT "receipt_lines_purchase_order_item_id_fkey" FOREIGN KEY ("purchase_order_item_id") REFERENCES "purchase_order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_files" ADD CONSTRAINT "receipt_files_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_files" ADD CONSTRAINT "receipt_files_receipt_line_id_fkey" FOREIGN KEY ("receipt_line_id") REFERENCES "receipt_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_files" ADD CONSTRAINT "receipt_files_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_files" ADD CONSTRAINT "item_files_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
