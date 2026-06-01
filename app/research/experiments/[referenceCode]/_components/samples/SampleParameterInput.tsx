"use client";

import { useMemo } from "react";
import { useAppForm } from "@/components/Form2";
import { researchActions } from "@/actions/research";
import { QcParameter } from "@/actions/quality/qc/parameters/getAll";
import { SampleMeasurementRow } from "@/actions/research/measurements/getAllBySample";

export type MeasurementInput = {
  value: string;
  inputDefinitions: {
    id: string;
    value: string;
    label: string;
    resultId: string;
  }[];
};

type Props = {
  sampleId: string;
  parameter: QcParameter;
  run?: SampleMeasurementRow;
  runLabel: string;
  onChanged: () => void;
};

const SampleParameterInput = ({
  sampleId,
  parameter,
  run,
  runLabel,
  onChanged,
}: Props) => {
  const defaultValues = useMemo<MeasurementInput>(() => {
    const definitionsValues = parameter.inputDefinitions.map((def) => {
      const inputResult = run?.inputResults.find(
        (res) => res.parameterInputDefinitionId === def.id,
      );
      return {
        id: def.id,
        value: inputResult?.value ?? "",
        label: `${def.name} (${def.unit || ""})`,
        resultId: inputResult?.id ?? "",
      };
    });

    return {
      value: run?.value ?? "",
      inputDefinitions: definitionsValues,
    };
  }, [parameter, run]);

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (run) {
        await researchActions.measurements.update(run.id, value as MeasurementInput);
      } else {
        await researchActions.measurements.create(
          sampleId,
          parameter.id,
          value as MeasurementInput,
        );
      }
      onChanged();
      form.reset();
    },
  });

  const onDelete = async () => {
    if (!run) return;
    await researchActions.measurements.delete(run.id);
    onChanged();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-base-content">{runLabel}</span>
        {run && (
          <button
            type="button"
            onClick={onDelete}
            className="btn btn-sm btn-error btn-outline"
          >
            Delete
          </button>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <form.AppField name="value">
          {(field) => (
            <field.TextField label={`${parameter.name} (${parameter.uom})`} />
          )}
        </form.AppField>

        <form.AppField name="inputDefinitions" mode="array">
          {(field) => (
            <div className="flex flex-col gap-4">
              {field.state.value.map((def, i) => (
                <form.AppField
                  key={`inputDefinitions[${i}].id`}
                  name={`inputDefinitions[${i}].value`}
                >
                  {(subField) => <subField.TextField label={def.label} />}
                </form.AppField>
              ))}
            </div>
          )}
        </form.AppField>

        <div>
          <form.AppForm>
            <form.SubmitButton />
          </form.AppForm>
        </div>
      </form>
    </div>
  );
};

export default SampleParameterInput;
