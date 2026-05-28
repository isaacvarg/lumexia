"use client";
import { TbCopy, TbPlus } from "react-icons/tb";
import Card from "@/components/Card";
import useDialog from "@/hooks/useDialog";
import { ExperimentVariantWithMaterials } from "@/actions/research/variants/getAllByExperiment";
import { Item } from "@/actions/inventory/getAllItems";
import { MbprByItem } from "@/actions/production/getMbprsByItem";
import VariantCard from "./VariantCard";
import AddVariantDialog from "./AddVariantDialog";
import AddAnalogDialog from "./AddAnalogDialog";

type Props = {
  experimentId: string;
  variants: ExperimentVariantWithMaterials[];
  items: Item[];
  mbprs: MbprByItem[];
};

const Variants = ({ experimentId, variants, items, mbprs }: Props) => {
  const { showDialog } = useDialog();
  const showAnalog = mbprs.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-poppins text-xl font-semibold text-base-content">
          Variants
        </h2>
        <div className="flex gap-2">
          {showAnalog && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => showDialog("addAnalog")}
            >
              <TbCopy /> Add Analog
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => showDialog("addVariant")}
          >
            <TbPlus /> Add Variant
          </button>
        </div>
      </div>

      {variants.length === 0 ? (
        <Card.Root>
          <p className="font-poppins text-lg text-base-content/60 italic">
            No variants yet — add one to start designing formulations.
          </p>
        </Card.Root>
      ) : (
        <div className="flex flex-col gap-4">
          {variants.map((v) => (
            <VariantCard key={v.id} variant={v} items={items} />
          ))}
        </div>
      )}

      <AddVariantDialog experimentId={experimentId} />
      {showAnalog && <AddAnalogDialog experimentId={experimentId} mbprs={mbprs} />}
    </div>
  );
};

export default Variants;
