"use client";

import { useCallback, useEffect, useState } from "react";
import Card from "@/components/Card";
import { qualityActions } from "@/actions/quality";
import { researchActions } from "@/actions/research";
import { QcParameter } from "@/actions/quality/qc/parameters/getAll";
import { SampleMeasurementRow } from "@/actions/research/measurements/getAllBySample";
import { ExperimentSampleRow } from "@/actions/research/samples/getAllByExperiment";
import SampleSelectedParameter from "./SampleSelectedParameter";

type Props = {
  sample: ExperimentSampleRow;
};

const SampleMeasurementBody = ({ sample }: Props) => {
  const [parameters, setParameters] = useState<QcParameter[]>([]);
  const [measurements, setMeasurements] = useState<SampleMeasurementRow[]>([]);
  const [selectedParameterId, setSelectedParameterId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const reloadMeasurements = useCallback(async () => {
    const m = await researchActions.measurements.getAllBySample(sample.id);
    setMeasurements(m);
  }, [sample.id]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [params, m] = await Promise.all([
        qualityActions.qc.parameters.getAll("wet"),
        researchActions.measurements.getAllBySample(sample.id),
      ]);
      if (!active) return;
      setParameters(params);
      setMeasurements(m);
      setSelectedParameterId((prev) => prev ?? params[0]?.id ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [sample.id]);

  if (loading) {
    return (
      <Card.Root>
        <p className="font-poppins text-base-content/60">Loading parameters…</p>
      </Card.Root>
    );
  }

  if (parameters.length === 0) {
    return (
      <Card.Root>
        <p className="font-poppins text-lg text-base-content/60 italic">
          No wet parameters have been defined. Create a parameter with “wet
          parameter” enabled in Quality → QC → Parameters first.
        </p>
      </Card.Root>
    );
  }

  const selectedParameter =
    parameters.find((p) => p.id === selectedParameterId) ?? parameters[0];

  return (
    <div className="grid grid-cols-3 gap-6 items-start">
      <Card.Root>
        <div className="flex flex-col gap-1">
          {parameters.map((p) => {
            const runCount = measurements.filter(
              (m) => m.qcParameterId === p.id,
            ).length;
            const isSelected = p.id === selectedParameter.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedParameterId(p.id)}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-left ${
                  isSelected
                    ? "bg-primary/15 text-base-content"
                    : "hover:bg-base-200/60 text-base-content/80"
                }`}
              >
                <span className="font-medium">{p.name}</span>
                {runCount > 0 && (
                  <span className="badge badge-sm badge-ghost">{runCount}</span>
                )}
              </button>
            );
          })}
        </div>
      </Card.Root>

      <SampleSelectedParameter
        sampleId={sample.id}
        parameter={selectedParameter}
        measurements={measurements}
        onChanged={reloadMeasurements}
      />
    </div>
  );
};

export default SampleMeasurementBody;
