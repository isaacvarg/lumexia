'use client'
import { getGroupParametersByExamination } from "@/actions/quality/qc/groups/groupParameters/getByExamination"
import { ExaminationType } from "@/actions/quality/qc/examinationTypes/getAll"
import { QcItemParameter } from "@/actions/quality/qc/parameters/getAllByItem"
import { Item } from "@/actions/inventory/items/getOne"
import { InventoryLot } from "@/actions/auxiliary/getLotsByItem"
import { useStore } from "@tanstack/react-form"
import { useState } from "react"
import { TbTrash } from "react-icons/tb"
import BulkEntryParameterFields from "./BulkEntryParameterFields"

type Props = {
  form: any
  index: number
  examinationTypes: ExaminationType[]
  lots: InventoryLot[]
  item: Item
  qcItemParameters: QcItemParameter[]
}

const BulkEntryRow = ({ form, index, examinationTypes, lots, item, qcItemParameters }: Props) => {
  const [isLoadingParams, setIsLoadingParams] = useState(false)

  const { examinationTypeId, parameterResults } = useStore(
    form.store,
    (state: any) => ({
      examinationTypeId: state.values.rows[index]?.examinationTypeId ?? '',
      parameterResults: state.values.rows[index]?.parameterResults ?? [],
    })
  )

  const handleExamTypeChange = async (typeId: string) => {
    const selected = examinationTypes.find(t => t.id === typeId)
    form.setFieldValue(`rows[${index}].examinationTypeId`, typeId)
    form.setFieldValue(`rows[${index}].examinationType`, selected?.name ?? '')

    if (!typeId) {
      form.setFieldValue(`rows[${index}].parameterResults`, [])
      return
    }

    setIsLoadingParams(true)
    try {
      const groupParams = await getGroupParametersByExamination(typeId, item.id)
      const parameterResultsData = groupParams.flatMap(gp => {
        const itemParam = qcItemParameters.find(ip => ip.parameterId === gp.parameter.id)
        if (!itemParam) return []
        return [{
          parameterId: itemParam.parameter.id,
          parameterName: itemParam.parameter.name,
          itemParameterId: itemParam.id,
          value: '',
          inputDefinitions: itemParam.parameter.inputDefinitions.map((def: any) => ({
            id: def.id,
            name: def.name,
            required: def.required,
            unit: def.unit ?? '',
            value: '',
          })),
        }]
      })
      form.setFieldValue(`rows[${index}].parameterResults`, parameterResultsData)
    } finally {
      setIsLoadingParams(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 bg-base-200 rounded-xl p-4">
      <div className="flex justify-between items-center">
        <span className="font-medium text-base-content">Row {index + 1}</span>
        <button
          type="button"
          className="btn btn-soft btn-error btn-sm"
          onClick={() => form.removeFieldValue('rows', index)}
        >
          <TbTrash className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <form.AppField name={`rows[${index}].lotNumber`}>
          {(field: any) => (
            <div className="flex flex-col gap-2">
              <label className="font-medium text-xl text-base-content">Lot Number</label>
              <input
                list={`lots-datalist-${index}`}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="input w-full input-lg"
                placeholder="Select or type a lot number..."
              />
              <datalist id={`lots-datalist-${index}`}>
                {lots.map(lot => (
                  <option key={lot.id} value={lot.lotNumber} />
                ))}
              </datalist>
            </div>
          )}
        </form.AppField>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-xl text-base-content">Examination Type</label>
          <select
            value={examinationTypeId}
            onChange={(e) => handleExamTypeChange(e.target.value)}
            className="select select-lg w-full"
          >
            <option value="">Select type...</option>
            {examinationTypes.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoadingParams && (
        <div className="flex items-center gap-2 text-base-content/60">
          <span className="loading loading-spinner loading-sm" />
          <span>Loading parameters...</span>
        </div>
      )}

      {!isLoadingParams && parameterResults.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-medium text-base-content/70">Parameters</span>
          {parameterResults.map((_: any, pi: number) => (
            <BulkEntryParameterFields
              key={pi}
              form={form}
              rowIndex={index}
              paramIndex={pi}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BulkEntryRow
