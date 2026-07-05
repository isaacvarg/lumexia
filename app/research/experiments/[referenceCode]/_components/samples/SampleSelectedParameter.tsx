"use client";

import { useEffect, useMemo, useState } from "react";
import Card from "@/components/Card";
import SectionTitle from "@/components/Text/SectionTitle";
import { QcParameter } from "@/actions/quality/qc/parameters/getAll";
import { SampleMeasurementRow } from "@/actions/research/measurements/getAllBySample";
import SampleParameterInput from "./SampleParameterInput";

type Props = {
  sampleId: string;
  parameter: QcParameter;
  measurements: SampleMeasurementRow[];
  onChanged: () => void;
};

const SampleSelectedParameter = ({
  sampleId,
  parameter,
  measurements,
  onChanged,
}: Props) => {
  const [isAddingRun, setIsAddingRun] = useState(false);

  useEffect(() => {
    setIsAddingRun(false);
  }, [parameter.id]);

  const runs = useMemo(
    () =>
      measurements
        .filter((m) => m.qcParameterId === parameter.id)
        .sort((a, b) => a.runNumber - b.runNumber),
    [measurements, parameter.id],
  );
  const nextRunNumber = (runs[runs.length - 1]?.runNumber ?? 0) + 1;

  return (
    <div className="flex flex-col gap-6 col-span-1 sm:col-span-2">
      <SectionTitle>{parameter.name}</SectionTitle>

      <div className="flex flex-col gap-6">
        {runs.map((run) => (
          <Card.Root key={run.id}>
            <SampleParameterInput
              sampleId={sampleId}
              parameter={parameter}
              run={run}
              runLabel={`Run ${run.runNumber}`}
              onChanged={onChanged}
            />
          </Card.Root>
        ))}

        {(runs.length === 0 || isAddingRun) && (
          <Card.Root>
            <SampleParameterInput
              sampleId={sampleId}
              parameter={parameter}
              runLabel={`Run ${nextRunNumber}`}
              onChanged={() => {
                setIsAddingRun(false);
                onChanged();
              }}
            />
          </Card.Root>
        )}

        {runs.length > 0 && !isAddingRun && (
          <button
            type="button"
            onClick={() => setIsAddingRun(true)}
            className="btn btn-primary btn-outline self-start"
          >
            Add run
          </button>
        )}
      </div>
    </div>
  );
};

export default SampleSelectedParameter;
