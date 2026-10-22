-- AlterTable
ALTER TABLE "users" ADD COLUMN     "description" TEXT,
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'human';

-- The seeded Lumexia user runs scheduled jobs and never signs in. Legacy instances gave it a random id,
-- so match it by name; instances without one are left alone.
UPDATE "users" SET "kind" = 'system' WHERE "name" = 'Lumexia';
