-- Audit log for BPR status changes. Captures both the automated transitions
-- driven by lib/bpr/transitions.ts (kind = 'automated', event set) and human
-- overrides via StatusDialog (kind = 'manual', userId + reason set).

CREATE TABLE "bpr_status_transitions" (
    "id" TEXT NOT NULL,
    "bpr_id" TEXT NOT NULL,
    "from_status_id" TEXT NOT NULL,
    "to_status_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "event" TEXT,
    "user_id" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bpr_status_transitions_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "bpr_status_transitions"
    ADD CONSTRAINT "bpr_status_transitions_bpr_id_fkey"
    FOREIGN KEY ("bpr_id") REFERENCES "batch_production_records"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bpr_status_transitions"
    ADD CONSTRAINT "bpr_status_transitions_from_status_id_fkey"
    FOREIGN KEY ("from_status_id") REFERENCES "bpr_statuses"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bpr_status_transitions"
    ADD CONSTRAINT "bpr_status_transitions_to_status_id_fkey"
    FOREIGN KEY ("to_status_id") REFERENCES "bpr_statuses"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "bpr_status_transitions"
    ADD CONSTRAINT "bpr_status_transitions_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
