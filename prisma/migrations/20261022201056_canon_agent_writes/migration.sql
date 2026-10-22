-- AlterTable
ALTER TABLE "alias_types" ADD COLUMN     "is_unique" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "api_idempotency_keys" (
    "id" TEXT NOT NULL,
    "api_key_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "tool" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "response" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_idempotency_keys_api_key_id_key_key" ON "api_idempotency_keys"("api_key_id", "key");

-- AddForeignKey
ALTER TABLE "api_idempotency_keys" ADD CONSTRAINT "api_idempotency_keys_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed the new canon event type (static record; id = staticRecordId("canonEventTypes", "evidenceAdded"))
INSERT INTO "canon_event_types" ("id", "name", "description", "updated_at") VALUES
  ('094ce4c1-08d2-57d6-9b97-f4bf2dabb4d1', 'Evidence Added', 'Evidence was added to an open change request.', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
