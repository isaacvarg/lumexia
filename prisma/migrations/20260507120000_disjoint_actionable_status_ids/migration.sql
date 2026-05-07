-- Disjoint UUIDs on bpr_step_actionable_statuses so they no longer collide with
-- bpr_batch_step_statuses ids. Also rename the "Compounding" row to "In Progress"
-- so its name doesn't shadow the batch step's "Fulfill Step" semantics.
--
-- The FK bpr_step_actionables.status_id uses ON UPDATE CASCADE, so updating the
-- primary key on bpr_step_actionable_statuses propagates to the FK column
-- automatically.

UPDATE "bpr_step_actionable_statuses"
SET "name" = 'In Progress', "description" = 'In progress'
WHERE "id" = '0639c02a-8062-463d-b7df-c47ddd9b4582';

UPDATE "bpr_step_actionable_statuses" SET "id" = '3f92229d-a155-4ff5-9f91-aef88362c588' WHERE "id" = '1a8e6443-43a1-4531-9ee2-00156b86e7d8';
UPDATE "bpr_step_actionable_statuses" SET "id" = 'a9abc151-7e33-45e3-9892-eccc4745e74e' WHERE "id" = '8be63277-c4e4-4263-9665-005113941418';
UPDATE "bpr_step_actionable_statuses" SET "id" = '5bf4e9db-6252-4185-8a25-d3f5d14b1495' WHERE "id" = 'bec61e3f-87f0-485b-813f-65a8bd8103df';
UPDATE "bpr_step_actionable_statuses" SET "id" = '6cf7cb71-d4cd-4694-8412-f5979a743ec1' WHERE "id" = '0639c02a-8062-463d-b7df-c47ddd9b4582';
UPDATE "bpr_step_actionable_statuses" SET "id" = '9e9730e1-410b-43eb-990e-bcdeee8a0616' WHERE "id" = '8dd8cfcc-533a-48e6-a1e6-acb6acea0991';
