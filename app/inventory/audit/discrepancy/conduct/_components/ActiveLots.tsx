'use client'

import SectionTitle from "@/components/Text/SectionTitle"
import { DiscrepancyItem } from "../_actions/getDiscrepancyItem"
import { useDiscrepancyActions, useDiscrepancySelection } from "@/store/discrepancySlice"
import { useEffect, useState } from "react"
import LotCard from "./LotCard"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import ConfirmationButton from "@/components/Buttons/ConfirmationButton"
import { handleZeroDepletions } from "../_actions/handleZeroDepletions"
import { handleDiscrepancyAuditAdjustment } from "../_actions/handleDiscrepencyAuditAdjustment"
import { Panels } from "@/components/Panels"
import GenerateLotButton from "./GenerateLotButton"


const ActiveLots = () => {

  const { item, itemLots } = useDiscrepancySelection()
  const { zeroDepletions } = useDiscrepancyActions()
  const [onHandLots, setOnHandLots] = useState<DiscrepancyItem['lots']>([])
  const [totalQuantity, setTotalQuantity] = useState<number>(0)
  const [inactiveLots, setInactiveLots] = useState<DiscrepancyItem['lots']>([])
  const [inactiveLotsTotal, setInactiveLotsTotal] = useState<number>(0);

  const handleZeroAllDepletions = async () => {
    if (!item) throw new Error('Cannot Zero without Item')
    await handleZeroDepletions(inactiveLots, item.id)
    zeroDepletions(inactiveLots.map(l => l.id))
  }

  const onDepleteAll = async () => {

    if (!item) throw new Error('Cannot Zero without Item')

    await Promise.all(onHandLots.map(async (lot) => {
      const res = await handleDiscrepancyAuditAdjustment(item.id, 0, lot.totalQuantityOnHand, lot.id);
      return res;
    }));

  }


  useEffect(() => {

    if (!item) return;

    const onHandLots = itemLots.filter(lot => lot.totalQuantityOnHand > 0);
    const inactiveLots = itemLots.filter(lot => lot.totalQuantityOnHand <= 0);

    const total = onHandLots.reduce((acc, curr) => acc + curr.totalQuantityOnHand, 0)
    const inactiveLotsTotal = inactiveLots.reduce((acc, curr) => acc + curr.totalQuantityOnHand, 0)

    setOnHandLots(onHandLots)
    setInactiveLots(inactiveLots);
    setTotalQuantity(total);
    setInactiveLotsTotal(inactiveLotsTotal)



  }, [itemLots, item],)


  return (
    <Panels.Root>
      <div className="flex flex-col gap-y-6">


        <SectionTitle size="small">Lots</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6  border-b border-neutral-200 pb-6">


          <div className="flex flex-col gap-y-2 bg-lilac-100  rounded-xl items-center p-8 ">
            <h2 className="font-poppins text-md uppercase text-base-content font-medium">On Hand</h2>
            <h1 className="font-sans text-xl font-semibold  text-neutral-700">
              {onHandLots.length} Lots
            </h1>

            <h1 className="font-sans text-xl font-semibold  text-neutral-700">{toFracitonalDigits.weight(totalQuantity)} (lbs)</h1>
          </div>



          <div className="flex flex-col gap-y-2 bg-lilac-100  rounded-xl items-center p-8 ">
            <h2 className="font-poppins text-md uppercase text-base-content font-medium">Depleted Hand</h2>
            <h1 className="font-sans text-xl font-semibold  text-neutral-700">
              {inactiveLots.length} Lots
            </h1>

            <h1 className="font-sans text-xl font-semibold  text-neutral-700">{toFracitonalDigits.weight(inactiveLotsTotal)} (lbs)</h1>
          </div>

          <div className="flex flex-col gap-y-2 bg-lilac-100  rounded-xl items-center p-8 ">

            <h2 className="font-poppins text-md uppercase text-base-content font-medium">Actions</h2>


            {inactiveLotsTotal !== 0 && <ConfirmationButton onConfirmation={() => handleZeroAllDepletions()} label="Zero All Depleted" />}

            <ConfirmationButton onConfirmation={() => onDepleteAll()} label="Deplete All" />


            <GenerateLotButton />


          </div>

        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {onHandLots.map(lot => <LotCard key={lot.id} lot={lot} />)}

        </div>


      </div>
    </Panels.Root>
  )
}

export default ActiveLots
