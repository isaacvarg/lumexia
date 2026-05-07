-- DropForeignKey
ALTER TABLE "bpr_bills_of_materials" DROP CONSTRAINT "bpr_bills_of_materials_added_by_user_id_fkey";

-- DropForeignKey
ALTER TABLE "bpr_status_transitions" DROP CONSTRAINT "bpr_status_transitions_user_id_fkey";

-- AddForeignKey
ALTER TABLE "bpr_bills_of_materials" ADD CONSTRAINT "bpr_bills_of_materials_added_by_user_id_fkey" FOREIGN KEY ("added_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bpr_status_transitions" ADD CONSTRAINT "bpr_status_transitions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
