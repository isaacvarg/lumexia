"use client";
import { useRouter } from "next/navigation";
import { useAppForm } from "@/components/Form2";
import Card from "@/components/Card";
import SectionTitle from "@/components/Text/SectionTitle";
import { researchActions } from "@/actions/research";
import { CostSettings } from "@/actions/research/costSettings/get";

type Props = {
  settings: CostSettings;
};

const OverheadForm = ({ settings }: Props) => {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      overheadPercent: settings.overheadPercent,
      overheadPerLb: settings.overheadPerLb,
    },
    onSubmit: async ({ value }) => {
      await researchActions.costSettings.update({
        overheadPercent: Number(value.overheadPercent) || 0,
        overheadPerLb: Number(value.overheadPerLb) || 0,
      });
      router.refresh();
    },
  });

  return (
    <Card.Root>
      <SectionTitle>Overhead</SectionTitle>
      <p className="font-poppins text-base-content/60">
        Applied to every variant&apos;s projected cost:
        <span className="font-medium">
          {" "}
          projected $/lb = BOM $/lb × (1 + overhead %) + overhead $/lb
        </span>
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4 mt-2 max-w-md"
      >
        <form.AppField name="overheadPercent">
          {(field) => <field.NumberField label="Overhead (% of BOM cost)" />}
        </form.AppField>
        <form.AppField name="overheadPerLb">
          {(field) => <field.NumberField label="Overhead ($ per lb)" />}
        </form.AppField>
        <div>
          <form.AppForm>
            <form.SubmitButton />
          </form.AppForm>
        </div>
      </form>
    </Card.Root>
  );
};

export default OverheadForm;
