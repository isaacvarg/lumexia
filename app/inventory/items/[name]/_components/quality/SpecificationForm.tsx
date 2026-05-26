import { useAppForm } from "@/components/Form2"
import { qualityActions } from "@/actions/quality"
import { QcItemParameter, QcItemSpecificationWithInputs } from "@/actions/quality/qc/parameters/getAllByItem"
import { useItemSelection } from "@/store/itemSlice"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

type Props = {
  itemParameter: QcItemParameter
  spec?: QcItemSpecificationWithInputs
  defaultExaminationTypeId?: string
  onClose: () => void
}

const SPEC_TYPE_OPTIONS = [
  { label: "Range (min – max)", value: "range" },
  { label: "Max (≤)", value: "max" },
  { label: "Min (≥)", value: "min" },
  { label: "Single value", value: "single" },
]

const SpecificationForm = ({ itemParameter, spec, defaultExaminationTypeId, onClose }: Props) => {
  const { options } = useItemSelection()
  const router = useRouter()
  const inputDefinitions = itemParameter.parameter.inputDefinitions

  const defaultValues = useMemo(() => {
    return {
      name: spec?.name ?? "",
      examinationTypeId: spec?.examinationTypeId ?? defaultExaminationTypeId ?? (options.qcExaminationTypes[0]?.id ?? ""),
      specificationType: spec?.specificationType ?? "range",
      valueA: spec?.valueA ?? "",
      valueB: spec?.valueB ?? "",
      displayOnCoa: spec?.displayOnCoa ?? true,
      inputs: inputDefinitions.map((def) => {
        const existing = spec?.itemSpecificationInputs.find((si) => si.parameterInputDefinitionId === def.id)
        return {
          parameterInputDefinitionId: def.id,
          label: `${def.name}${def.unit ? ` (${def.unit})` : ""}`,
          value: existing?.value ?? "",
        }
      }),
    }
  }, [spec, defaultExaminationTypeId, options.qcExaminationTypes, inputDefinitions])

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const pinnedInputs = value.inputs
        .filter((i) => i.value.trim() !== "")
        .map((i) => ({ parameterInputDefinitionId: i.parameterInputDefinitionId, value: i.value }))

      if (spec) {
        await qualityActions.qc.itemSpecifications.update({
          id: spec.id,
          examinationTypeId: value.examinationTypeId,
          name: value.name,
          specificationType: value.specificationType,
          valueA: value.valueA,
          valueB: value.specificationType === "range" ? value.valueB : null,
          displayOnCoa: value.displayOnCoa,
          inputs: pinnedInputs,
        })
      } else {
        await qualityActions.qc.itemSpecifications.create({
          itemParameterId: itemParameter.id,
          examinationTypeId: value.examinationTypeId,
          name: value.name,
          specificationType: value.specificationType,
          valueA: value.valueA,
          valueB: value.specificationType === "range" ? value.valueB : null,
          displayOnCoa: value.displayOnCoa,
          inputs: pinnedInputs,
        })
      }
      router.refresh()
      onClose()
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-4 bg-base-200/40 rounded-xl p-4"
    >
      <form.AppField name="name">
        {(field) => <field.TextField label="Name" labelClass="soft" />}
      </form.AppField>

      <form.AppField name="examinationTypeId">
        {(field) => (
          <field.SelectField
            label="Examination Type"
            labelClass="soft"
            options={options.qcExaminationTypes.map((t) => ({ label: t.name, value: t.id }))}
          />
        )}
      </form.AppField>

      <form.AppField name="specificationType">
        {(field) => (
          <field.SelectField
            label="Specification Type"
            labelClass="soft"
            options={SPEC_TYPE_OPTIONS}
          />
        )}
      </form.AppField>

      <form.Subscribe selector={(state) => state.values.specificationType}>
        {(specType) => (
          <div className="grid grid-cols-2 gap-4">
            <form.AppField name="valueA">
              {(field) => (
                <field.TextField
                  label={specType === "range" ? "Min" : specType === "single" ? "Value" : "Threshold"}
                  labelClass="soft"
                />
              )}
            </form.AppField>
            {specType === "range" && (
              <form.AppField name="valueB">
                {(field) => <field.TextField label="Max" labelClass="soft" />}
              </form.AppField>
            )}
          </div>
        )}
      </form.Subscribe>

      {inputDefinitions.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-normal text-lg text-base-content/70">Conditions (optional)</span>
          <span className="text-sm text-base-content/50">
            Pin this spec to specific input values. Leave blank to apply regardless.
          </span>
          <form.AppField name="inputs" mode="array">
            {(field) => (
              <div className="flex flex-col gap-3">
                {field.state.value.map((row, i) => (
                  <form.AppField
                    key={row.parameterInputDefinitionId}
                    name={`inputs[${i}].value`}
                  >
                    {(subField) => <subField.TextField label={row.label} labelClass="soft" />}
                  </form.AppField>
                ))}
              </div>
            )}
          </form.AppField>
        </div>
      )}

      <form.AppField name="displayOnCoa">
        {(field) => <field.ToggleField label="Display on Certificate of Analysis" labelClass="soft" />}
      </form.AppField>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
        <form.AppForm>
          <form.SubmitButton />
        </form.AppForm>
      </div>
    </form>
  )
}

export default SpecificationForm
