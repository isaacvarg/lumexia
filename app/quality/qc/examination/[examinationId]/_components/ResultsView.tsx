"use client";

import { QcItemParameter } from "@/actions/quality/qc/parameters/getAllByItem";
import { ExaminationResults } from "@/app/quality/qc/examination/new/[lotNumber]/_actions/getResults";
import Card from "@/components/Card";
import SectionTitle from "@/components/Text/SectionTitle";
import { evaluateSpecification, findMatchingSpec } from "@/utils/qc/evaluateSpecification";
import { formatSpecification } from "@/utils/qc/formatSpecification";
import { formatParameterValue } from "@/utils/qc/formatParameterValue";
import { useState } from "react";

type Props = {
  itemParameters: QcItemParameter[];
  results: Map<string, ExaminationResults[]>;
  examinationTypeId: string;
};

const ResultsView = ({ itemParameters, results, examinationTypeId }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    itemParameters.length > 0 ? itemParameters[0].id : null
  );

  const selected = itemParameters.find((ip) => ip.id === selectedId) || null;
  const selectedRuns = selected ? results.get(selected.id) ?? [] : [];
  const selectedSpecs = selected
    ? selected.specifications.filter((s) => s.examinationTypeId === examinationTypeId)
    : [];
  const inputDefs = selected?.parameter.inputDefinitions ?? [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-12">
      <div className="flex flex-col gap-4">
        <SectionTitle>Parameters</SectionTitle>

        <Card.Root>
          <div className="grid grid-cols-1 gap-2">
            {itemParameters.map((ip) => {
              const isSelected = ip.id === selectedId;
              const runCount = results.get(ip.id)?.length ?? 0;
              return (
                <button
                  key={ip.id}
                  className={`btn ${isSelected ? "btn-accent" : "btn-secondary btn-outline"} ${runCount === 0 ? "btn-ghost opacity-50" : ""}`}
                  onClick={() => setSelectedId(ip.id)}
                >
                  <span>{ip.parameter.name}</span>
                  {runCount > 0 && <span className="badge badge-sm">{runCount}</span>}
                </button>
              );
            })}
          </div>
        </Card.Root>
      </div>

      <div className="flex flex-col gap-6 col-span-1 sm:col-span-2">
        <SectionTitle>
          {selected?.parameter.name || "Please select a parameter"}
        </SectionTitle>

        <div className="flex flex-col gap-6">
          <Card.Root>
            <SectionTitle size="small">Specification</SectionTitle>

            {selectedSpecs.length === 0 ? (
              <p className="font-medium text-xl text-base-content font-poppins">
                A specification has not yet been set for this product.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedSpecs.map((spec) => {
                  const conditions = spec.itemSpecificationInputs
                    .map((si) => {
                      const def = inputDefs.find((d) => d.id === si.parameterInputDefinitionId);
                      return `${def?.name ?? ""} ${si.value}${def?.unit ? ` ${def.unit}` : ""}`.trim();
                    })
                    .join(", ");
                  return (
                    <div key={spec.id} className="flex items-center gap-3 bg-base-200/40 rounded-xl px-3 py-2">
                      <div className="flex-1 flex flex-col">
                        <div className="font-medium text-base-content">{spec.name || "(unnamed)"}</div>
                        <div className="text-sm text-base-content/60">
                          {formatSpecification(spec, selected?.parameter.dataTypeId)}
                          {conditions && <span className="ml-2">· {conditions}</span>}
                        </div>
                      </div>
                      {spec.displayOnCoa && <span className="badge badge-sm badge-info">CoA</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </Card.Root>

          <Card.Root>
            <SectionTitle size="small">Recorded Runs</SectionTitle>

            {selectedRuns.length === 0 ? (
              <p className="font-medium text-xl text-base-content/50 font-poppins">
                No result recorded for this parameter.
              </p>
            ) : (
              <div className="flex flex-col gap-6">
                {selectedRuns.map((run) => {
                  const matchingSpec = findMatchingSpec(selectedSpecs, run);
                  const evalResult = matchingSpec
                    ? evaluateSpecification(run.value, matchingSpec)
                    : null;
                  return (
                    <div key={run.id} className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-base-content">Run {run.runNumber}</span>
                        {!matchingSpec && selectedSpecs.length > 0 && (
                          <span className="badge badge-sm badge-ghost">no matching spec</span>
                        )}
                        {evalResult === "pass" && (
                          <span className="badge badge-sm badge-success">PASS · {formatSpecification(matchingSpec!, selected!.parameter.dataTypeId)}</span>
                        )}
                        {evalResult === "fail" && (
                          <span className="badge badge-sm badge-error">FAIL · {formatSpecification(matchingSpec!, selected!.parameter.dataTypeId)}</span>
                        )}
                        {evalResult === "unknown" && (
                          <span className="badge badge-sm badge-warning">UNKNOWN · {formatSpecification(matchingSpec!, selected!.parameter.dataTypeId)}</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="font-poppins text-sm font-medium text-base-content/60 uppercase">
                          {selected?.parameter.name} ({selected?.parameter.uom})
                        </label>
                        <p className="font-poppins text-xl font-medium bg-base-200/40 rounded-xl px-4 py-3">
                          {formatParameterValue(run.value, selected!.parameter.dataTypeId)}
                        </p>
                      </div>

                      {run.parameterInputResults.map((inputResult) => {
                        const inputDef = inputDefs.find(
                          (def) => def.id === inputResult.parameterInputDefinitionId
                        );
                        return (
                          <div key={inputResult.id} className="flex flex-col gap-1">
                            <label className="font-poppins text-sm font-medium text-base-content/60 uppercase">
                              {inputDef?.name || "Input"}{" "}
                              {inputDef?.unit ? `(${inputDef.unit})` : ""}
                            </label>
                            <p className="font-poppins text-xl font-medium bg-base-200/40 rounded-xl px-4 py-3">
                              {inputResult.value}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </Card.Root>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;
