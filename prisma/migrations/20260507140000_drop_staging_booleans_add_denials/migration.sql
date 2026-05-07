-- Drop the duplicate-truth verification booleans on bpr_stagings. Staging
-- verification state is captured by bpr_stagings.bpr_staging_status_id and
-- bpr_staging_verifications already; the booleans were a third source.
ALTER TABLE "bpr_stagings" DROP COLUMN "is_primary_verified";
ALTER TABLE "bpr_stagings" DROP COLUMN "is_secondary_verified";

-- Add bpr_staging_denials as the symmetric event log to bpr_staging_verifications.
-- Captures who denied a staging, during which round, and why -- replaces the
-- currently-discarded `note` argument to handleSingleStagingDeny.
CREATE TABLE "bpr_staging_denials" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bpr_staging_id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'primary',
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bpr_staging_denials_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "bpr_staging_denials"
    ADD CONSTRAINT "bpr_staging_denials_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bpr_staging_denials"
    ADD CONSTRAINT "bpr_staging_denials_bpr_staging_id_fkey"
    FOREIGN KEY ("bpr_staging_id") REFERENCES "bpr_stagings"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
