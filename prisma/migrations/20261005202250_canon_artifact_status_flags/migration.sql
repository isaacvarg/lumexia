-- AlterTable
ALTER TABLE "canon_artifacts" ADD COLUMN     "has_conflict" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "has_unreviewed_change" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_expired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_stale" BOOLEAN NOT NULL DEFAULT false;
