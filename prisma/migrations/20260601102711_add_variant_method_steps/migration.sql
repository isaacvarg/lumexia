-- CreateTable
CREATE TABLE "experiment_variant_method_steps" (
    "id" TEXT NOT NULL,
    "experiment_variant_id" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "phase" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_variant_method_steps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "experiment_variant_method_steps" ADD CONSTRAINT "experiment_variant_method_steps_experiment_variant_id_fkey" FOREIGN KEY ("experiment_variant_id") REFERENCES "experiment_variants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
