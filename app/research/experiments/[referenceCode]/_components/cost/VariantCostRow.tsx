"use client";
import { useState } from "react";
import { TbChevronDown, TbChevronRight } from "react-icons/tb";
import { VariantCostProjection } from "@/actions/research/cost/getProjections";

type Props = {
  variant: VariantCostProjection;
  lastExamCostPerLb: number | null;
};

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const fmtPerLb = (n: number) => `${fmtMoney(n)}/lb`;

const VariantCostRow = ({ variant, lastExamCostPerLb }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const deltaBadge = () => {
    if (variant.delta == null) return <span className="text-base-content/40">—</span>;
    const up = variant.delta > 0;
    const cls = up ? "badge-error" : "badge-success";
    const sign = up ? "+" : "";
    return (
      <span className={`badge ${cls} badge-sm`}>
        {sign}
        {fmtMoney(variant.delta)}/lb
      </span>
    );
  };

  return (
    <>
      <tr
        className="cursor-pointer hover:bg-base-200/50"
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="w-8">
          {expanded ? <TbChevronDown /> : <TbChevronRight />}
        </td>
        <td className="font-poppins font-medium">
          {variant.label}
          {variant.missingPriceCount > 0 && (
            <span className="badge badge-warning badge-sm ml-2">
              {variant.missingPriceCount} unpriced
            </span>
          )}
        </td>
        <td className="font-poppins">{fmtPerLb(variant.bomCostPerLb)}</td>
        <td className="font-poppins font-semibold">
          {fmtPerLb(variant.projectedCostPerLb)}
        </td>
        <td>{deltaBadge()}</td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={5} className="bg-base-200/30">
            <div className="flex flex-col gap-4 p-2">
              <div>
                <h5 className="font-poppins font-semibold text-base-content/70 mb-1">
                  BOM breakdown
                </h5>
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th className="text-right">Unit cost</th>
                      <th className="text-right">Concentration</th>
                      <th className="text-right">$/lb contribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variant.materials.map((m) => (
                      <tr key={m.id}>
                        <td className="font-poppins">{m.itemName}</td>
                        <td className="text-right font-poppins">
                          {m.hasPrice && m.unitCostPerLb != null ? (
                            fmtPerLb(m.unitCostPerLb)
                          ) : (
                            <span className="badge badge-warning badge-sm">no price</span>
                          )}
                        </td>
                        <td className="text-right font-poppins">
                          {m.concentrationPercent.toFixed(2).replace(/\.?0+$/, "")}%
                        </td>
                        <td className="text-right font-poppins">
                          {m.hasPrice ? fmtMoney(m.contribution) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-right font-poppins font-semibold">
                        BOM cost
                      </td>
                      <td className="text-right font-poppins font-semibold">
                        {fmtPerLb(variant.bomCostPerLb)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {variant.perBatch.length > 0 && (
                <div>
                  <h5 className="font-poppins font-semibold text-base-content/70 mb-1">
                    Projected cost per batch
                  </h5>
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Batch size</th>
                        <th className="text-right">BOM cost</th>
                        <th className="text-right">Projected (w/ overhead)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variant.perBatch.map((b) => (
                        <tr key={b.batchSizeId}>
                          <td className="font-poppins">
                            {b.label}{" "}
                            <span className="text-base-content/50">
                              ({b.quantityLb} lb)
                            </span>
                          </td>
                          <td className="text-right font-poppins">{fmtMoney(b.bomCost)}</td>
                          <td className="text-right font-poppins font-semibold">
                            {fmtMoney(b.projectedCost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default VariantCostRow;
