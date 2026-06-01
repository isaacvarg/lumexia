-- CreateTable
CREATE TABLE "experiment_cost_batch_sizes" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "quantity_lb" DOUBLE PRECISION NOT NULL,
    "sequence" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_cost_batch_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_cost_settings" (
    "id" TEXT NOT NULL,
    "overhead_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overhead_per_lb" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_cost_settings_pkey" PRIMARY KEY ("id")
);
