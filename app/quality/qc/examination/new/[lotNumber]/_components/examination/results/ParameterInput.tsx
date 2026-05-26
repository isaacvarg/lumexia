import { useAppForm } from "@/components/Form2"
import { useQcExaminationSelection } from "@/store/qcExaminationSlice"
import { useMemo } from "react"
import { handleResultUpdate } from "../../../_actions/handleResultUpdate"
import { useRouter } from "next/navigation"
import { handleResultSubmission } from "../../../_actions/handleResultSubmission"
import { handleResultDelete } from "../../../_actions/handleResultDelete"
import { ExaminationResults } from "../../../_actions/getResults"
import { QcItemSpecificationWithInputs } from "@/actions/quality/qc/parameters/getAllByItem"
import { evaluateSpecification, findMatchingSpec } from "@/utils/qc/evaluateSpecification"
import { formatSpecification } from "@/utils/qc/formatSpecification"

export type ParameterInput = {
  value: string,
  inputDefinitions: {
    id: string,
    value: string
    label: string
    resultId: string
  }[]
}

type Props = {
  run?: ExaminationResults
  runLabel: string
  specs?: QcItemSpecificationWithInputs[]
}

const ParameterInput = ({ run, runLabel, specs = [] }: Props) => {
  const { selectedItemParameter, qcRecord } = useQcExaminationSelection()
  const router = useRouter()

  const defaultValues = useMemo(() => {
    const inputDefinitionsData = selectedItemParameter?.parameter.inputDefinitions ?? []
    const resultValue = run?.value ?? ''
    const definitionsValues = inputDefinitionsData.map(def => {
      const inputResult = run?.parameterInputResults.find(res => res.parameterInputDefinitionId === def.id)
      return {
        id: def.id,
        value: inputResult?.value ?? '',
        label: `${def.name} (${def.unit || ''})`,
        resultId: inputResult?.id ?? '',
      }
    })

    return {
      value: resultValue,
      inputDefinitions: definitionsValues,
    }
  }, [selectedItemParameter, run])

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (!qcRecord || !selectedItemParameter) return;

      if (run) {
        await handleResultUpdate(run.id, value as ParameterInput);
      } else {
        await handleResultSubmission(qcRecord.id, selectedItemParameter.parameterId, selectedItemParameter.id, value);
      }
      router.refresh()
      form.reset()
    }
  })

  const onDelete = async () => {
    if (!run) return;
    await handleResultDelete(run.id)
    router.refresh()
  }

  const verdict = useMemo(() => {
    if (!run || specs.length === 0) return null
    const matchingSpec = findMatchingSpec(specs, run)
    if (!matchingSpec) return { kind: 'unmatched' as const }
    const evalResult = evaluateSpecification(run.value, matchingSpec)
    return { kind: 'evaluated' as const, evaluation: evalResult, spec: matchingSpec }
  }, [run, specs])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-base-content">{runLabel}</span>
          {verdict?.kind === 'unmatched' && (
            <span className="badge badge-sm badge-ghost">no matching spec</span>
          )}
          {verdict?.kind === 'evaluated' && verdict.evaluation === 'pass' && (
            <span className="badge badge-sm badge-success">PASS · {formatSpecification(verdict.spec)}</span>
          )}
          {verdict?.kind === 'evaluated' && verdict.evaluation === 'fail' && (
            <span className="badge badge-sm badge-error">FAIL · {formatSpecification(verdict.spec)}</span>
          )}
          {verdict?.kind === 'evaluated' && verdict.evaluation === 'unknown' && (
            <span className="badge badge-sm badge-warning">UNKNOWN · {formatSpecification(verdict.spec)}</span>
          )}
        </div>
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

        <form.AppField
          name="value"
        >
          {(field) => <field.TextField label={`${selectedItemParameter?.parameter.name} (${selectedItemParameter?.parameter.uom})`} />}
        </form.AppField>


        <form.AppField name="inputDefinitions" mode="array">
          {(field) => {
            return (
              <div className="flex flex-col gap-4">
                {field.state.value.map((_, i) => {
                  return (
                    <form.AppField
                      key={`inputDefinitions[${i}].id`}
                      name={`inputDefinitions[${i}].value`} >
                      {(subField) => <subField.TextField label={_.label} />}
                    </form.AppField>

                  )
                })}
              </div>
            )
          }}

        </form.AppField>


        <div>
          <form.AppForm>
            <form.SubmitButton />
          </form.AppForm>
        </div>


      </form>
    </div>
  )
}

export default ParameterInput
