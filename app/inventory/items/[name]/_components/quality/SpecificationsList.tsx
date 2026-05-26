import { qualityActions } from "@/actions/quality"
import { QcItemParameter, QcItemSpecificationWithInputs } from "@/actions/quality/qc/parameters/getAllByItem"
import { useItemSelection } from "@/store/itemSlice"
import { formatSpecification } from "@/utils/qc/formatSpecification"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TbPencil, TbPlus, TbTrash } from "react-icons/tb"
import SpecificationForm from "./SpecificationForm"

type Props = {
  itemParameter: QcItemParameter
}

type EditState =
  | { mode: 'create'; examinationTypeId: string }
  | { mode: 'edit'; spec: QcItemSpecificationWithInputs }
  | null

const SpecificationsList = ({ itemParameter }: Props) => {
  const { options } = useItemSelection()
  const router = useRouter()
  const [editState, setEditState] = useState<EditState>(null)

  const handleDelete = async (spec: QcItemSpecificationWithInputs) => {
    await qualityActions.qc.itemSpecifications.delete(spec.id)
    router.refresh()
  }

  const grouped = options.qcExaminationTypes.map((type) => ({
    type,
    specs: itemParameter.specifications.filter((s) => s.examinationTypeId === type.id),
  }))

  const inputDefs = itemParameter.parameter.inputDefinitions

  const renderConditions = (spec: QcItemSpecificationWithInputs) => {
    if (spec.itemSpecificationInputs.length === 0) return null
    return spec.itemSpecificationInputs
      .map((si) => {
        const def = inputDefs.find((d) => d.id === si.parameterInputDefinitionId)
        return `${def?.name ?? ''} ${si.value}${def?.unit ? ` ${def.unit}` : ''}`.trim()
      })
      .join(', ')
  }

  return (
    <div className="flex flex-col gap-4 pl-4 border-l border-base-300">
      <div className="font-medium text-base text-base-content/70">Specifications</div>

      {grouped.map(({ type, specs }) => (
        <div key={type.id} className="flex flex-col gap-2">
          <div className="text-sm font-semibold text-base-content/60 uppercase tracking-wider">
            {type.name}
          </div>

          {specs.map((spec) => {
            const isEditingThis = editState?.mode === 'edit' && editState.spec.id === spec.id
            if (isEditingThis) {
              return (
                <SpecificationForm
                  key={spec.id}
                  itemParameter={itemParameter}
                  spec={spec}
                  onClose={() => setEditState(null)}
                />
              )
            }
            const conditions = renderConditions(spec)
            return (
              <div key={spec.id} className="flex items-center gap-3 bg-base-200/40 rounded-xl px-3 py-2">
                <div className="flex-1 flex flex-col">
                  <div className="font-medium text-base-content">{spec.name || '(unnamed)'}</div>
                  <div className="text-sm text-base-content/60">
                    {formatSpecification(spec)}
                    {conditions && <span className="ml-2">· {conditions}</span>}
                  </div>
                </div>
                {spec.displayOnCoa && (
                  <span className="badge badge-sm badge-info">CoA</span>
                )}
                <button
                  type="button"
                  onClick={() => setEditState({ mode: 'edit', spec })}
                  className="btn btn-ghost btn-sm"
                >
                  <TbPencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(spec)}
                  className="btn btn-ghost btn-sm btn-error"
                >
                  <TbTrash className="size-4" />
                </button>
              </div>
            )
          })}

          {editState?.mode === 'create' && editState.examinationTypeId === type.id ? (
            <SpecificationForm
              itemParameter={itemParameter}
              defaultExaminationTypeId={type.id}
              onClose={() => setEditState(null)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditState({ mode: 'create', examinationTypeId: type.id })}
              className="btn btn-ghost btn-sm self-start"
            >
              <TbPlus className="size-4" /> Add spec
            </button>
          )}
        </div>
      ))}

      {options.qcExaminationTypes.length === 0 && (
        <p className="text-base-content/60 text-sm">
          No examination types configured. Add one before creating specs.
        </p>
      )}
    </div>
  )
}

export default SpecificationsList
