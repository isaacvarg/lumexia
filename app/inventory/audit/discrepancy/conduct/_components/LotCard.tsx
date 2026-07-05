import { useState } from "react"
import { DiscrepancyItem } from "../_actions/getDiscrepancyItem"
import { TbDeviceFloppy } from "react-icons/tb";
import validator from "validator";
import { useDiscrepancyActions, useDiscrepancySelection } from "@/store/discrepancySlice";

const LotCard = ({ lot }: { lot: DiscrepancyItem['lots'][number] }) => {
    const [isAdjust, setIsAdjust] = useState(false)
    const [newQuantity, setNewQuantity] = useState<string>('');
    const { adjustLotQuantity  } = useDiscrepancyActions()
    const { isAdjustmentLoading } = useDiscrepancySelection()

    const handleAdjustment = (value: string) => {
        const isNumber = validator.isFloat(value);

        if (value === "") {
            setNewQuantity("")
        }

        if (!isNumber) return;

        setNewQuantity((value))
    }

    const handleSaveAdjustment = async () => {
        if(isAdjustmentLoading) return;
        setIsAdjust(false)
        adjustLotQuantity(lot.id, parseFloat(newQuantity), lot.totalQuantityOnHand)
    }

    const handleDeplete = async () => {
        if(isAdjustmentLoading) return;
        adjustLotQuantity(lot.id, 0, lot.totalQuantityOnHand);
    }


    return (
        <div
            className="bg-blue-100 rounded-xl p-6 flex flex-col gap-y-2">
            <h1 className="font-sans font-semibold text-lg tracking-wider">
                {lot.lotNumber}
            </h1>

            
            <h1 className="font-sans font-semibold text-lg tracking-wider">
                {lot.totalQuantityOnHand}
            </h1>


            {!isAdjust ? (
                isAdjustmentLoading ? (
                    <button className="btn skeleton">Loading. . . </button>
                ) : (
                    <div className="flex flex-col gap-y-2">
                        <button className="btn bg-blue-400 hover:bg-blue-400/80" onClick={() => setIsAdjust(true)}>
                            Adjust
                        </button>
                        <button className="btn bg-red-400 hover:bg-red-400/80" onClick={handleDeplete}>
                            Deplete
                        </button>
                    </div>
                )
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <input className="bg-blue-200 rounded-xl px-4 focus:outline-none py-3 col-span-1 sm:col-span-2 lg:col-span-3" value={newQuantity} onChange={(e) => handleAdjustment(e.target.value)} />
                    <button className="btn bg-blue-400 hover:bg-blue-400/80" onClick={() => handleSaveAdjustment()}>
                        <TbDeviceFloppy />
                    </button>
                </div>
            )
            }


        </div >

    )
}

export default LotCard
