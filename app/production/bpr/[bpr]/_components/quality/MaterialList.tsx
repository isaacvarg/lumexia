import SectionTitle from "@/components/Text/SectionTitle"
import { useProductionSelection } from "@/store/productionSlice"
import MaterialButton from "../shared/MaterialButton"
import Card from "@/components/Card"
import { bprBomLineStatuses } from "@/configs/staticRecords/bprBomLineStatuses"

const MaterialList = () => {

  const { bom, qualityMode } = useProductionSelection()
  const sorted = bom.sort((a, b) => parseInt(a.bom.identifier) - parseInt(b.bom.identifier));
  const staged = qualityMode === 'primary' ?
    bom.filter(item => item.statusId === bprBomLineStatuses.staged) :
    bom.filter(item => item.statusId === bprBomLineStatuses.primaryVerified);

  const verified = qualityMode === 'primary' ?
    sorted.filter(item => item.statusId === bprBomLineStatuses.primaryVerified) :
    sorted.filter(item => item.statusId === bprBomLineStatuses.secondaryVerified);

  return (
    <div className="flex flex-col gap-6 col-span-2">
      <div className="flex flex-col gap-4">
        <SectionTitle >{qualityMode === 'primary' ? 'To Verify' : 'To Secondary Verify'}</SectionTitle>
        <Card.Root>
          {staged.length === 0 && <p className={"text-base-content text-lg text-medium"}>None</p>}
          <div className="grid grid-cols-1 gap-4">
            {staged.map(item => <MaterialButton key={item.id} material={item} />)}

          </div>

          <SectionTitle size="small">{qualityMode === 'primary' ? 'Verified' : 'Twice Verified'}</SectionTitle>
          <div className="grid grid-cols-1 gap-4">
            {verified.map(item => <MaterialButton key={item.id} material={item} />)}
          </div>


        </Card.Root>

      </div>

      <div className="flex flex-col gap-4">

        <SectionTitle >{qualityMode === 'primary' ? 'Verified' : 'Twice Verified'}</SectionTitle>
        <Card.Root>

          <div className="grid grid-cols-1 gap-4">
            {verified.map(item => <MaterialButton key={item.id} material={item} />)}
          </div>


        </Card.Root>

      </div>


    </div>
  )
}

export default MaterialList
