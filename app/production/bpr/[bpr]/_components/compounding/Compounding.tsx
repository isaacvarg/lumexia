import { useProductionSelection } from "@/store/productionSlice"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import StepList from "./StepList"
import StepDetails from "./StepDetails"
import { bprStatuses } from "@/configs/staticRecords/bprStatuses"
import CompoundingHeader from "./CompoundingHeader"
import { createActivityLog } from "@/utils/auxiliary/createActivityLog"
import { advanceBpr } from "@/lib/bpr/transitions"

const stagingMaterials = bprStatuses.stagingMaterials

const Compounding = () => {
  const { bpr, selectedStep } = useProductionSelection()
  const isReadyForCompounding = bpr?.bprStatusId === stagingMaterials
  const router = useRouter()


  useEffect(() => {
    const updateBpr = async () => {
      if (!bpr) return;
      await advanceBpr(bpr.id, 'stagingCompleted')
      await createActivityLog('modifyBprStatus', 'bpr', bpr.id, { context: `BPR #${bpr.referenceCode} transitioned from staging materials to compounding` })
      router.refresh()
    }

    if (isReadyForCompounding) {
      updateBpr()
    }
  }, [bpr, router])


  return (
    <div className="flex flex-col gap-6">
      <CompoundingHeader />
      {!selectedStep && <StepList />}
      {selectedStep && <StepDetails />}
    </div>

  )
}

export default Compounding
