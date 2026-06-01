-- CreateTable
CREATE TABLE "experiment_sample_measurements" (
    "id" TEXT NOT NULL,
    "sample_id" TEXT NOT NULL,
    "qc_parameter_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "run_number" INTEGER NOT NULL DEFAULT 1,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_sample_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_sample_measurement_inputs" (
    "id" TEXT NOT NULL,
    "measurement_id" TEXT NOT NULL,
    "parameter_input_definition_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiment_sample_measurement_inputs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "experiment_sample_measurements_sample_id_qc_parameter_id_ru_key" ON "experiment_sample_measurements"("sample_id", "qc_parameter_id", "run_number");

-- AddForeignKey
ALTER TABLE "experiment_sample_measurements" ADD CONSTRAINT "experiment_sample_measurements_sample_id_fkey" FOREIGN KEY ("sample_id") REFERENCES "experiment_samples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_sample_measurements" ADD CONSTRAINT "experiment_sample_measurements_qc_parameter_id_fkey" FOREIGN KEY ("qc_parameter_id") REFERENCES "qc_parameters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_sample_measurements" ADD CONSTRAINT "experiment_sample_measurements_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_sample_measurement_inputs" ADD CONSTRAINT "experiment_sample_measurement_inputs_measurement_id_fkey" FOREIGN KEY ("measurement_id") REFERENCES "experiment_sample_measurements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_sample_measurement_inputs" ADD CONSTRAINT "experiment_sample_measurement_inputs_parameter_input_defin_fkey" FOREIGN KEY ("parameter_input_definition_id") REFERENCES "qc_parameter_input_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
