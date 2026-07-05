"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TbCheck, TbEdit, TbRotate } from "react-icons/tb";
import Card from "@/components/Card";
import useDialog from "@/hooks/useDialog";
import { researchActions } from "@/actions/research";
import { ExperimentVariantWithMaterials } from "@/actions/research/variants/getAllByExperiment";
import { ExperimentSampleRow } from "@/actions/research/samples/getAllByExperiment";
import { groupVariantMaterialsByPhase } from "@/utils/general/groupVariantMaterials";
import VariantMethodSection from "../variants/VariantMethodSection";

type Props = {
  sample: ExperimentSampleRow;
  variant: ExperimentVariantWithMaterials;
};

const formatAmount = (n: number) => n.toFixed(3).replace(/\.?0+$/, "");

const SamplePreparationBody = ({ sample, variant }: Props) => {
  const router = useRouter();
  const { showDialog } = useDialog();

  const completedIds = useMemo(
    () => new Set(sample.preparationSteps.map((s) => s.experimentVariantMaterialId)),
    [sample.preparationSteps],
  );

  const { groups, orderedKeys } = useMemo(
    () => groupVariantMaterialsByPhase(variant.materials),
    [variant.materials],
  );

  const hasAnyPhases = orderedKeys.some((k) => k !== null);
  const missingSize = sample.size == null || sample.uomId == null;

  const handleToggle = async (materialId: string) => {
    await researchActions.samples.preparationSteps.toggle({
      sampleId: sample.id,
      experimentVariantMaterialId: materialId,
    });
    router.refresh();
  };

  const handleMarkPrepared = async () => {
    await researchActions.samples.markPrepared({ id: sample.id });
    router.refresh();
  };

  const handleMarkUnprepared = async () => {
    await researchActions.samples.markUnprepared({ id: sample.id });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <Card.Root>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <span className="font-poppins text-sm uppercase tracking-wide text-base-content/60">
              Target size
            </span>
            <span className="font-poppins text-lg">
              {sample.size != null && sample.uom
                ? `${sample.size} ${sample.uom.abbreviation} (${sample.uom.name})`
                : "—"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-poppins text-sm uppercase tracking-wide text-base-content/60">
              Status
            </span>
            <span className="font-poppins text-lg">
              {sample.preparedAt
                ? `Prepared ${new Date(sample.preparedAt).toLocaleDateString()}${sample.preparedBy?.name ? ` by ${sample.preparedBy.name}` : ""}`
                : "Not prepared"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => showDialog(`editSample-${sample.id}`)}
              aria-label="Edit sample details"
            >
              <TbEdit /> Edit details
            </button>
            {sample.preparedAt ? (
              <button
                type="button"
                className="btn btn-warning btn-sm"
                onClick={handleMarkUnprepared}
              >
                <TbRotate /> Mark Not Prepared
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={handleMarkPrepared}
              >
                <TbCheck /> Mark Prepared
              </button>
            )}
          </div>
        </div>
      </Card.Root>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <Card.Root>
          <VariantMethodSection variant={variant} />
        </Card.Root>

        {missingSize ? (
          <Card.Root>
            <p className="font-poppins text-lg text-base-content/70 italic">
              This sample is missing a target size — click <strong>Edit details</strong>{" "}
              above to set it.
            </p>
          </Card.Root>
        ) : variant.materials.length === 0 ? (
          <Card.Root>
            <p className="font-poppins text-lg text-base-content/70 italic">
              The source variant has no materials yet — add some on the Variants tab.
            </p>
          </Card.Root>
        ) : (
          <div className="flex flex-col gap-4">
            {orderedKeys.map((phaseKey) => {
            const materials = groups.get(phaseKey)!;
            return (
              <Card.Root key={phaseKey ?? "__unphased__"}>
                {hasAnyPhases && (
                  <h4 className="font-poppins text-base font-semibold uppercase tracking-wide text-base-content/70 border-b border-base-300 pb-1">
                    {phaseKey ?? "Unphased"}
                  </h4>
                )}
                <div className="w-full overflow-x-auto"><table className="table">
                  <thead>
                    <tr>
                      <th className="w-12"></th>
                      <th>Item</th>
                      <th className="w-32">Concentration</th>
                      <th className="w-40">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((m) => {
                      const amount = sample.size! * m.concentration;
                      const checked = completedIds.has(m.id);
                      return (
                        <tr key={m.id} className={checked ? "opacity-60" : ""}>
                          <td>
                            <input
                              type="checkbox"
                              className="checkbox checkbox-success"
                              checked={checked}
                              onChange={() => handleToggle(m.id)}
                              aria-label={`Toggle ${m.item.name} completed`}
                            />
                          </td>
                          <td className="font-poppins">
                            {checked ? <s>{m.item.name}</s> : m.item.name}
                          </td>
                          <td className="font-poppins">
                            {(m.concentration * 100).toFixed(2).replace(/\.?0+$/, "")}%
                          </td>
                          <td className="font-poppins font-semibold">
                            {formatAmount(amount)} {sample.uom!.abbreviation}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table></div>
              </Card.Root>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SamplePreparationBody;
