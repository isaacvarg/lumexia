"use client";
import { useRouter } from "next/navigation";
import { DateTime } from "luxon";
import { TbEdit, TbFlask, TbNote, TbPaperclip, TbRulerMeasure } from "react-icons/tb";
import Card from "@/components/Card";
import useDialog from "@/hooks/useDialog";
import { researchActions } from "@/actions/research";
import { ExperimentVariantWithMaterials } from "@/actions/research/variants/getAllByExperiment";
import { ExperimentSampleRow } from "@/actions/research/samples/getAllByExperiment";
import { Uom } from "@/actions/inventory/getAllUom";
import { dateFormatWithTime } from "@/configs/data/dateFormatString";
import DeleteConfirm from "../variants/DeleteConfirm";
import AddSampleDialog from "./AddSampleDialog";
import EditSampleDialog from "./EditSampleDialog";
import { SampleFocusedMode } from "./SampleFocusedView";
import PrintLabelButton from "./printing/PrintLabelButton";
import CopyForLlmButton from "../shared/CopyForLlmButton";

type Props = {
  experimentId: string;
  experimentReferenceCode: number;
  primarySubject: string;
  variant: ExperimentVariantWithMaterials;
  samples: ExperimentSampleRow[];
  uoms: Uom[];
  onFocus: (sampleId: string, mode: SampleFocusedMode) => void;
};

const formatSampleRef = (code: number) => `S-${String(code).padStart(2, "0")}`;

const VariantSamplesCard = ({
  experimentId,
  experimentReferenceCode,
  primarySubject,
  variant,
  samples,
  uoms,
  onFocus,
}: Props) => {
  const { showDialog } = useDialog();
  const defaultLabel = `Batch ${samples.length + 1}`;

  return (
    <Card.Root>
      <div className="flex items-center justify-between">
        <h3 className="font-poppins text-2xl font-semibold text-base-content">
          {variant.label}
        </h3>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => showDialog(`addSample-${variant.id}`)}
        >
          + Add Sample
        </button>
      </div>

      <div className="mt-2">
        {samples.length === 0 ? (
          <p className="italic text-base-content/50 font-poppins">
            No samples yet for this variant.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="w-24">Reference</th>
                <th>Label</th>
                <th className="w-32">Size</th>
                <th className="w-64">Prepared</th>
                <th className="w-72">Actions</th>
                <th className="w-28"></th>
              </tr>
            </thead>
            <tbody>
              {samples.map((s) => (
                <SampleRow
                  key={s.id}
                  sample={s}
                  variantLabel={variant.label}
                  experimentReferenceCode={experimentReferenceCode}
                  primarySubject={primarySubject}
                  onFocus={onFocus}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddSampleDialog
        experimentId={experimentId}
        variantId={variant.id}
        defaultLabel={defaultLabel}
        uoms={uoms}
      />

      {samples.map((s) => (
        <EditSampleDialog key={`edit-${s.id}`} sample={s} uoms={uoms} />
      ))}
    </Card.Root>
  );
};

type SampleRowProps = {
  sample: ExperimentSampleRow;
  variantLabel: string;
  experimentReferenceCode: number;
  primarySubject: string;
  onFocus: (sampleId: string, mode: SampleFocusedMode) => void;
};

const SampleRow = ({
  sample,
  variantLabel,
  experimentReferenceCode,
  primarySubject,
  onFocus,
}: SampleRowProps) => {
  const router = useRouter();
  const { showDialog } = useDialog();

  const handleDelete = async () => {
    await researchActions.samples.delete({ id: sample.id });
    router.refresh();
  };

  const sizeText =
    sample.size != null && sample.uom
      ? `${sample.size} ${sample.uom.abbreviation}`
      : "—";

  const preparedText = sample.preparedAt
    ? `Prepared ${DateTime.fromJSDate(sample.preparedAt).toFormat(dateFormatWithTime)}`
    : "Not prepared";

  return (
    <tr>
      <td className="font-poppins font-medium">{formatSampleRef(sample.referenceCode)}</td>
      <td className="font-poppins">{sample.label}</td>
      <td className="font-poppins">{sizeText}</td>
      <td>
        <span
          className={`inline-block whitespace-nowrap px-2 py-0.5 rounded text-sm font-medium ${
            sample.preparedAt
              ? "bg-success/30 text-base-content"
              : "bg-base-300 text-base-content/70"
          }`}
        >
          {preparedText}
        </span>
      </td>
      <td>
        <div className="flex gap-1">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onFocus(sample.id, "preparation")}
          >
            <TbFlask /> Prepare
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onFocus(sample.id, "measurement")}
            aria-label="Measure sample"
          >
            <TbRulerMeasure /> Measure
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onFocus(sample.id, "notes")}
            aria-label="Sample notes"
          >
            <TbNote /> Notes
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onFocus(sample.id, "files")}
            aria-label="Sample files"
          >
            <TbPaperclip /> Files
          </button>
          <PrintLabelButton
            sample={sample}
            variantLabel={variantLabel}
            experimentReferenceCode={experimentReferenceCode}
            primarySubject={primarySubject}
          />
          <CopyForLlmButton
            tooltip="Copy this sample for an LLM"
            getText={() => researchActions.llmContext.getSampleContext(sample.id)}
          />
        </div>
      </td>
      <td>
        <div className="flex gap-1 justify-end">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => showDialog(`editSample-${sample.id}`)}
            aria-label="Edit sample details"
          >
            <TbEdit />
          </button>
          <DeleteConfirm onConfirm={handleDelete} label="" />
        </div>
      </td>
    </tr>
  );
};

export default VariantSamplesCard;
