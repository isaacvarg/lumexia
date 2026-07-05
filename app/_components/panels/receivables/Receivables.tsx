'use client'

import { usePurchasingReceivables } from "@/hooks/appQuery/usePurchasingReceivables"
import Panel from "../Panel";
import ReceivableOption from "./ReceivableOption";

const Receivables = () => {

  const { data: pos, isLoading } = usePurchasingReceivables()

  const isComplete = pos?.length === 0;


  if (!pos) {
    return (
      <Panel title="New Requests">
        <div className="grid grid-cols-1 gap-1">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
        </div>
      </Panel>
    )
  }



  return (
    <Panel span={2} title="Receivable POs" titlePath="/receiving">

      {isComplete && <p className="font-poppins text-lg font-medium text-base-content">All done 👍🏽👍🏽🫰🏽🫰🏽</p>}

      {!isComplete && <div className="grid grid-cols-1 gap-1.5 max-h-[250px] overflow-y-auto">
        {pos.map((po) => {
          return (
            <ReceivableOption key={po.id} po={po} />
          )
        })}
      </div>}
    </Panel>


  )
}

export default Receivables
