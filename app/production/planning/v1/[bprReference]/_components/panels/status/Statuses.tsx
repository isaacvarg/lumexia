'use client'
import { Panels } from "@/components/Panels"
import Separator from "@/components/Separator/Separator"
import Text from "@/components/Text"
import useDialog from "@/hooks/useDialog"
import { usePlanningDashboardSelection } from "@/store/planningDashboardSlice"
import ChangeStatusDialog from "./ChangeStatusDialog"

const Statuses = () => {

    const { bpr } = usePlanningDashboardSelection()
    const { showDialog } = useDialog()

    const handleStatusClick = () => {
        showDialog('changeBprStatus')
    }

    return (
        <Panels.Root gap="noGap">

            <ChangeStatusDialog />
            <Text.SectionTitle size="small">Status</Text.SectionTitle>


            <div
                onClick={() => handleStatusClick()}
                style={{ backgroundColor: bpr?.status.bgColor }}
                className="flex flex-col h-full items-center justify-center px-4 py-2 rounded-xl col-span-1 sm:col-span-2 hover:!bg-lilac-300 hover:cursor-pointer"
            >
                <p style={{ color: bpr?.status.textColor }} className=" font-poppins text-3xl font-semibold">
                    {bpr?.status.name || 'None'}
                </p>
            </div>








        </Panels.Root>

    )

}

export default Statuses
