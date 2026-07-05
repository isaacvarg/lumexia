'use client'
import ScanPanel from "./ScanPanel"
import ItemView from "./ItemView"
import StatusPanel from "./StatusPanel"
import ActionsPanel from "./ActionsPanel"
import { useDiscrepancySelection } from "@/store/discrepancySlice"

const Main = () => {
    const { mode } = useDiscrepancySelection()

    if (mode !== 'item') return false

    return (

        <div className="flex flex-col gap-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatusPanel />
                <ActionsPanel />
                <ScanPanel />

            </div>

            <ItemView />
        </div>

    )
}

export default Main
