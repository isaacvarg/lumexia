-- CreateTable
CREATE TABLE "api_uploads" (
    "id" TEXT NOT NULL,
    "api_key_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "file_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_uploads_token_hash_key" ON "api_uploads"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "api_uploads_file_id_key" ON "api_uploads"("file_id");

-- CreateIndex
CREATE INDEX "api_uploads_api_key_id_idx" ON "api_uploads"("api_key_id");

-- AddForeignKey
ALTER TABLE "api_uploads" ADD CONSTRAINT "api_uploads_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_uploads" ADD CONSTRAINT "api_uploads_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
