"use client";
import Card from "@/components/Card";
import { useAppForm } from "@/components/Form2";
import { researchActions } from "@/actions/research";
import { SingleExperiment } from "@/actions/research/getOneExperiment";
import { ExperimentGroup } from "@/actions/research/getAllExperimentGroups";
import { ExperimentStatus } from "@/actions/research/getAllExperimentStatuses";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TbEdit, TbX } from "react-icons/tb";

type Props = {
  experiment: SingleExperiment;
  groups: ExperimentGroup[];
  statuses: ExperimentStatus[];
};

const BasicDetailsPanel = ({ experiment, groups, statuses }: Props) => {
  const router = useRouter();
  const [isEdit, setIsEdit] = useState(false);

  const statusOptions = statuses.map((s) => ({ label: s.name, value: s.id }));
  const groupOptions = [
    { label: "No group", value: "" },
    ...groups.map((g) => ({ label: g.label, value: g.id })),
  ];

  const form = useAppForm({
    defaultValues: {
      objective: experiment.objective ?? "",
      hypothesis: experiment.hypothesis ?? "",
      statusId: experiment.statusId,
      experimentGroupId: experiment.experimentGroupId ?? "",
    },
    onSubmit: async ({ value }) => {
      await researchActions.experiments.update({
        id: experiment.id,
        objective: value.objective,
        hypothesis: value.hypothesis,
        statusId: value.statusId,
        experimentGroupId: value.experimentGroupId || null,
      });
      setIsEdit(false);
      router.refresh();
    },
  });

  return (
    <Card.Root>
      <div className="flex items-center justify-between">
        <Card.Title>Basic Details</Card.Title>
        <button
          className="btn btn-circle btn-ghost"
          onClick={() => setIsEdit((v) => !v)}
          aria-label={isEdit ? "Cancel edit" : "Edit basic details"}
        >
          {isEdit ? <TbX className="text-xl" /> : <TbEdit className="text-xl" />}
        </button>
      </div>

      {!isEdit ? (
        <div className="flex flex-col gap-y-4">
          <Field label="Objective" value={experiment.objective} />
          <Field label="Hypothesis" value={experiment.hypothesis} />
          <Field
            label="Status"
            value={experiment.status.name}
            badgeStyle={{
              backgroundColor: experiment.status.bgColor,
              color: experiment.status.textColor,
            }}
          />
          <Field label="Group" value={experiment.experimentGroup?.label ?? null} />
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-y-4"
        >
          <form.AppField name="objective">
            {(field) => <field.TextAreaField label="Objective" />}
          </form.AppField>
          <form.AppField name="hypothesis">
            {(field) => <field.TextAreaField label="Hypothesis" />}
          </form.AppField>
          <form.AppField name="statusId">
            {(field) => <field.SelectField label="Status" options={statusOptions} />}
          </form.AppField>
          <form.AppField name="experimentGroupId">
            {(field) => <field.SelectField label="Group" options={groupOptions} />}
          </form.AppField>
          <div>
            <form.AppForm>
              <form.SubmitButton />
            </form.AppForm>
          </div>
        </form>
      )}
    </Card.Root>
  );
};

type FieldProps = {
  label: string;
  value: string | null;
  badgeStyle?: React.CSSProperties;
};

const Field = ({ label, value, badgeStyle }: FieldProps) => {
  return (
    <div className="flex flex-col gap-y-1">
      <span className="font-poppins text-sm uppercase tracking-wide text-base-content/60">
        {label}
      </span>
      {value ? (
        badgeStyle ? (
          <span
            className="self-start px-2 py-0.5 rounded text-base font-medium"
            style={badgeStyle}
          >
            {value}
          </span>
        ) : (
          <span className="font-poppins text-lg text-base-content whitespace-pre-wrap">
            {value}
          </span>
        )
      ) : (
        <span className="font-poppins text-lg italic text-base-content/40">
          Not set
        </span>
      )}
    </div>
  );
};

export default BasicDetailsPanel;
