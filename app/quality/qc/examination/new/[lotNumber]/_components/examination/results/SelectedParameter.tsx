import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import { useQcExaminationActions, useQcExaminationSelection } from "@/store/qcExaminationSlice"
import { formatSpecification } from "@/utils/qc/formatSpecification"
import { useEffect, useState } from "react"
import ParameterInput from "./ParameterInput"

const SelectedParameter = () => {

  const { selectedItemParameter, itemParameters, results, selectedExaminationType, qcRecord } = useQcExaminationSelection()
  const { setSelectedItemParameter } = useQcExaminationActions()
  const [isAddingRun, setIsAddingRun] = useState(false)

  useEffect(() => {
    if (!selectedItemParameter && itemParameters.length > 0) {
      setSelectedItemParameter(itemParameters[0])
    }
  }, [selectedItemParameter, setSelectedItemParameter, itemParameters])

  useEffect(() => {
    setIsAddingRun(false)
  }, [selectedItemParameter?.id])

  const examinationTypeId = selectedExaminationType?.id ?? qcRecord?.examinationTypeId
  const runs = selectedItemParameter ? results.get(selectedItemParameter.id) ?? [] : []
  const nextRunNumber = (runs[runs.length - 1]?.runNumber ?? 0) + 1
  const specs = selectedItemParameter?.specifications.filter(
    (s) => !examinationTypeId || s.examinationTypeId === examinationTypeId,
  ) ?? []
  const inputDefs = selectedItemParameter?.parameter.inputDefinitions ?? []

  return (
    <div className="flex flex-col gap-6 col-span-1 sm:col-span-2">
      <SectionTitle>{selectedItemParameter?.parameter.name || 'Please select a parameter'}</SectionTitle>

      <div className="flex flex-col gap-6">

        <Card.Root>
          <SectionTitle size="small">Specification</SectionTitle>

          {specs.length === 0 ? (
            <p className="font-medium text-xl text-base-content font-poppins">A specification has not yet been set for this product.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {specs.map((spec) => {
                const conditions = spec.itemSpecificationInputs
                  .map((si) => {
                    const def = inputDefs.find((d) => d.id === si.parameterInputDefinitionId)
                    return `${def?.name ?? ''} ${si.value}${def?.unit ? ` ${def.unit}` : ''}`.trim()
                  })
                  .join(', ')
                return (
                  <div key={spec.id} className="flex items-center gap-3 bg-base-200/40 rounded-xl px-3 py-2">
                    <div className="flex-1 flex flex-col">
                      <div className="font-medium text-base-content">{spec.name || '(unnamed)'}</div>
                      <div className="text-sm text-base-content/60">
                        {formatSpecification(spec, selectedItemParameter?.parameter.dataTypeId)}
                        {conditions && <span className="ml-2">· {conditions}</span>}
                      </div>
                    </div>
                    {spec.displayOnCoa && (
                      <span className="badge badge-sm badge-info">CoA</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Card.Root>

        {runs.map(run => (
          <Card.Root key={run.id}>
            <ParameterInput run={run} runLabel={`Run ${run.runNumber}`} specs={specs} />
          </Card.Root>
        ))}

        {(runs.length === 0 || isAddingRun) && selectedItemParameter && (
          <Card.Root>
            <ParameterInput runLabel={`Run ${nextRunNumber}`} specs={specs} />
          </Card.Root>
        )}

        {runs.length > 0 && !isAddingRun && selectedItemParameter && (
          <button
            type="button"
            onClick={() => setIsAddingRun(true)}
            className="btn btn-primary btn-outline self-start"
          >
            Add run
          </button>
        )}

      </div>

    </div>
  )
}

export default SelectedParameter
