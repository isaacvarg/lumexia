import { useProductionActions, useProductionSelection } from "@/store/productionSlice"
import { BprBomItem } from "../../_actions/getBprBom"

const MaterialButton = ({ material, isQuality = false }: { material: BprBomItem, isQuality?: boolean }) => {

  const { selectedBomItem } = useProductionSelection()
  const { setSelectedBomItem } = useProductionActions()
  const isSelected = material.id === selectedBomItem?.id || false;

  const handleClick = () => {
    setSelectedBomItem(material);
  }

  return (
    <button onClick={() => handleClick()} className={`btn btn-xl ${isSelected ? 'btn-secondary' : 'btn-secondary btn-soft '} flex justify-start`}>

      <div className="flex gap-4 text-secondary-content ">

        <div className="rounded-xl bg-accent/50 px-3 h-10 min-w-16 shrink-0 flex items-center justify-center whitespace-nowrap text-center">{material.bom.identifier}</div>
        <span> {material.bom.item.name}</span>
      </div>
    </button>
  )
}

export default MaterialButton
