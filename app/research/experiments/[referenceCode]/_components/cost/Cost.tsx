"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Card from "@/components/Card";
import { researchActions } from "@/actions/research";
import { VariantCostProjections } from "@/actions/research/cost/getProjections";
import VariantCostRow from "./VariantCostRow";

type Props = {
  experimentId: string;
};

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const Cost = ({ experimentId }: Props) => {
  const [data, setData] = useState<VariantCostProjections | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await researchActions.cost.getProjections(experimentId);
      if (!active) return;
      setData(result);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [experimentId]);

  if (loading) {
    return (
      <Card.Root>
        <p className="font-poppins text-base-content/60">Calculating projected costs…</p>
      </Card.Root>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-poppins text-xl font-semibold text-base-content">
          Projected Cost
        </h2>
        <span className="font-poppins text-sm text-base-content/60">
          {data.lastExamCostPerLb != null
            ? `Last pricing examination: ${fmtMoney(data.lastExamCostPerLb)}/lb`
            : "No prior pricing examination for this product"}
        </span>
      </div>

      {data.batchSizes.length === 0 && (
        <Card.Root>
          <p className="font-poppins text-base-content/70 italic">
            No default batch sizes configured.{" "}
            <Link href="/research/settings" className="link link-primary">
              Configure them in Research Settings
            </Link>{" "}
            to see projected per-batch costs.
          </p>
        </Card.Root>
      )}

      {data.variants.length === 0 ? (
        <Card.Root>
          <p className="font-poppins text-lg text-base-content/60 italic">
            No variants yet — add formulations on the Variants tab to project costs.
          </p>
        </Card.Root>
      ) : (
        <Card.Root>
          <table className="table">
            <thead>
              <tr>
                <th className="w-8"></th>
                <th>Variant</th>
                <th>BOM cost</th>
                <th>Projected cost</th>
                <th>vs Last Exam</th>
              </tr>
            </thead>
            <tbody>
              {data.variants.map((v) => (
                <VariantCostRow
                  key={v.id}
                  variant={v}
                  lastExamCostPerLb={data.lastExamCostPerLb}
                />
              ))}
            </tbody>
          </table>
          <p className="font-poppins text-xs text-base-content/50 mt-2">
            Projected = BOM × (1 + {data.settings.overheadPercent}% overhead) +{" "}
            {fmtMoney(data.settings.overheadPerLb)}/lb. Click a variant to expand.
          </p>
        </Card.Root>
      )}
    </div>
  );
};

export default Cost;
