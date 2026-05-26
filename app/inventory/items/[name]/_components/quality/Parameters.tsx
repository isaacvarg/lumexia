import SectionTitle from "@/components/Text/SectionTitle"
import { useItemActions, useItemSelection } from "@/store/itemSlice"
import { TbChevronDown, TbChevronRight, TbPlus, TbTrash } from "react-icons/tb"
import AddParameters from "./AddParameters"
import Card from "@/components/Card"
import { QcItemParameter } from "@/actions/quality/qc/parameters/getAllByItem"
import { qualityActions } from "@/actions/quality"
import { useRouter } from "next/navigation"
import { useState } from "react"
import SpecificationsList from "./SpecificationsList"

const Parameters = () => {

  const { qualityTemplateViewMode, qcItemParameters } = useItemSelection()
  const { setQualityTemplateViewMode } = useItemActions()
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleDelete = async (parameter: QcItemParameter) => {
    await qualityActions.qc.itemParameters.delete(parameter.id);
    router.refresh();
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <SectionTitle>Parameters</SectionTitle>
        <button onClick={() => setQualityTemplateViewMode('add')} className="btn btn-secondary btn-outline"> <TbPlus className="size-4" /> </button>
      </div>

      <Card.Root>

        {(qualityTemplateViewMode === 'view' && qcItemParameters.length === 0) && <p>None so far</p>}

        {qualityTemplateViewMode === 'view' && (
          <div className="flex flex-col gap-2">
            {qcItemParameters.map(p => {
              const isExpanded = expandedId === p.id
              return (
                <div key={p.id} className="flex flex-col gap-3 bg-base-300/65 rounded-xl px-4 py-2">
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => toggleExpand(p.id)}
                      className="flex items-center gap-2 font-medium text-xl text-base-content"
                    >
                      {isExpanded ? <TbChevronDown className="size-5" /> : <TbChevronRight className="size-5" />}
                      {p.parameter.name}
                      {p.specifications.length > 0 && (
                        <span className="badge badge-sm">{p.specifications.length}</span>
                      )}
                    </button>
                    <button onClick={() => handleDelete(p)} className="btn btn-ghost btn-error"> <TbTrash className="size-4" /> </button>
                  </div>

                  {isExpanded && <SpecificationsList itemParameter={p} />}
                </div>
              )
            })}
          </div>
        )}


        {qualityTemplateViewMode === 'add' && <AddParameters />}
      </Card.Root >
    </div >
  )
}

export default Parameters
