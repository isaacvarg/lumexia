-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "show_address_on_po" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "address_street1" DROP NOT NULL,
ALTER COLUMN "address_city" DROP NOT NULL,
ALTER COLUMN "address_state" DROP NOT NULL,
ALTER COLUMN "address_zip" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;
