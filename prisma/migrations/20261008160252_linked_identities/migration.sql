-- CreateTable
CREATE TABLE "linked_identities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "external_id" TEXT NOT NULL,
    "api_key_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linked_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_link_codes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "code_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_link_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "linked_identities_user_id_idx" ON "linked_identities"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "linked_identities_channel_external_id_key" ON "linked_identities"("channel", "external_id");

-- CreateIndex
CREATE UNIQUE INDEX "identity_link_codes_code_hash_key" ON "identity_link_codes"("code_hash");

-- CreateIndex
CREATE INDEX "identity_link_codes_user_id_idx" ON "identity_link_codes"("user_id");

-- AddForeignKey
ALTER TABLE "linked_identities" ADD CONSTRAINT "linked_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linked_identities" ADD CONSTRAINT "linked_identities_api_key_id_fkey" FOREIGN KEY ("api_key_id") REFERENCES "api_keys"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_link_codes" ADD CONSTRAINT "identity_link_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
