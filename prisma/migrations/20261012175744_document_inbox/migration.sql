-- CreateTable
CREATE TABLE "inbox_messages" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "thread_id" TEXT,
    "source_url" TEXT,
    "sender_email" TEXT,
    "sender_name" TEXT,
    "subject" TEXT,
    "body" TEXT,
    "received_at" TIMESTAMP(3),
    "supplier_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbox_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbox_documents" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "md5" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "suggestion" JSONB,
    "suggested_at" TIMESTAMP(3),
    "checked_at" TIMESTAMP(3),
    "checked_by_id" TEXT,
    "dismissed_at" TIMESTAMP(3),
    "dismissed_by_id" TEXT,
    "dismiss_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbox_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbox_filings" (
    "id" TEXT NOT NULL,
    "inbox_document_id" TEXT NOT NULL,
    "item_file_id" TEXT,
    "po_accounting_file_id" TEXT,
    "replaced_item_file_ids" TEXT[],
    "via" TEXT NOT NULL,
    "reason" TEXT,
    "filed_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inbox_filings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inbox_messages_source_source_id_key" ON "inbox_messages"("source", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "inbox_documents_file_id_key" ON "inbox_documents"("file_id");

-- CreateIndex
CREATE INDEX "inbox_documents_status_idx" ON "inbox_documents"("status");

-- CreateIndex
CREATE INDEX "inbox_documents_md5_idx" ON "inbox_documents"("md5");

-- CreateIndex
CREATE UNIQUE INDEX "inbox_documents_message_id_md5_key" ON "inbox_documents"("message_id", "md5");

-- CreateIndex
CREATE UNIQUE INDEX "inbox_filings_item_file_id_key" ON "inbox_filings"("item_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "inbox_filings_po_accounting_file_id_key" ON "inbox_filings"("po_accounting_file_id");

-- CreateIndex
CREATE INDEX "inbox_filings_inbox_document_id_idx" ON "inbox_filings"("inbox_document_id");

-- AddForeignKey
ALTER TABLE "inbox_messages" ADD CONSTRAINT "inbox_messages_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox_messages" ADD CONSTRAINT "inbox_messages_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox_documents" ADD CONSTRAINT "inbox_documents_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "inbox_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox_documents" ADD CONSTRAINT "inbox_documents_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox_documents" ADD CONSTRAINT "inbox_documents_checked_by_id_fkey" FOREIGN KEY ("checked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox_documents" ADD CONSTRAINT "inbox_documents_dismissed_by_id_fkey" FOREIGN KEY ("dismissed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox_filings" ADD CONSTRAINT "inbox_filings_inbox_document_id_fkey" FOREIGN KEY ("inbox_document_id") REFERENCES "inbox_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox_filings" ADD CONSTRAINT "inbox_filings_item_file_id_fkey" FOREIGN KEY ("item_file_id") REFERENCES "item_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox_filings" ADD CONSTRAINT "inbox_filings_po_accounting_file_id_fkey" FOREIGN KEY ("po_accounting_file_id") REFERENCES "po_accounting_files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox_filings" ADD CONSTRAINT "inbox_filings_filed_by_id_fkey" FOREIGN KEY ("filed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
