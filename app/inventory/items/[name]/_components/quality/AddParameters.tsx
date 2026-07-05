import { QcTemplate } from "@/actions/quality/qc/templates/getAll"
import SearcherUnmanaged from "@/components/Search/SearcherUnmanaged"
import { useItemActions, useItemSelection } from "@/store/itemSlice"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { handleTemplateCascade } from "../../_actions/quality/handleTemplateCascade"
import { QcParameter } from "@/actions/quality/qc/parameters/getAll"
import { handleSingleParameter } from "../../_actions/quality/handleSingleParameter"
import { procurementTypes } from "@/configs/staticRecords/procurementTypes"

type AddMethods = 'template' | 'single' | 'ai' | null

const modeButtonClass = "btn btn-secondary btn-xl min-h-24"

const AddParameters = () => {

  const router = useRouter()
  const { item, options } = useItemSelection()
  const { setQualityTemplateViewMode } = useItemActions()
  const [step, setStep] = useState<number>(0)
  const [method, setMethod] = useState<AddMethods>(null)
  const [templateInput, setTemplateInput] = useState('');
  const [templateFilter, setTemplateFilter] = useState<QcTemplate[]>([]);
  const [singleInput, setSingleInput] = useState('');
  const [singleFilter, setSingleFilter] = useState<QcParameter[]>([])

  const handleMethodSelect = (method: AddMethods) => {
    setMethod(method);
    setStep(1);
  }

  const handleTemplateComplete = async (template: QcTemplate) => {
    if (!item) throw new Error("Cannot add parameters without Item");
    await handleTemplateCascade(item.id, template)
    router.refresh()
    setQualityTemplateViewMode('view');
  }

  const handleSingleComplete = async (parameter: QcParameter) => {

    if (!item) throw new Error("Cannot add parameters without Item");
    handleSingleParameter(item.id, parameter.id)
    router.refresh()
    setQualityTemplateViewMode('view');
  }

  return (
    <div>
      {/*** select how the parameters will be added   ***/}
      {step === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button onClick={() => handleMethodSelect('template')} className={modeButtonClass}>Template</button>
          <button onClick={() => handleMethodSelect('single')} className={modeButtonClass}>Single</button>
          {item?.procurementTypeId === procurementTypes.purchased && <button onClick={() => handleMethodSelect('ai')} className={modeButtonClass}>AI</button>}
        </div>
      )}

      {(step === 1 && method === 'template') && (<div className="flex flex-col gap-4">
        <SearcherUnmanaged<QcTemplate>
          keys={["name", "abbreviation"]}
          data={options.qcTemplates}
          input={templateInput}
          setInput={setTemplateInput}
          onQueryComplete={setTemplateFilter}
        />

        <div className="grid grid-cols-1 gap-1">
          {templateFilter.map(t => {
            return (
              <div
                className="px-4 py-2 font-medium text-lg text-base-content bg-accent/25 hover:cursor-pointer hover:bg-accent/20"
                key={t.id}
                onClick={() => handleTemplateComplete(t)}
              >
                {t.name}
              </div>
            )
          })}
        </div>

      </div>)}

      {(step === 1 && method === 'single') && (
        <div className="flex flex-col gap-4">
          <SearcherUnmanaged<QcParameter>
            keys={["name", "abbreviation"]}
            data={options.qcParameters}
            input={singleInput}
            setInput={setSingleInput}
            onQueryComplete={setSingleFilter}
          />

          <div className="grid grid-cols-1 gap-1">
            {singleFilter.map(p => {
              return (
                <div
                  className="px-4 py-2 font-medium text-lg text-base-content bg-accent/25 hover:cursor-pointer hover:bg-accent/20"
                  key={p.id}
                  onClick={() => handleSingleComplete(p)}
                >
                  {p.name}
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}

export default AddParameters
