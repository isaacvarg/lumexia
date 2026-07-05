'use client'
import { useDiscrepancySelection } from "@/store/discrepancySlice"
import ActionsPanel from "./ActionsPanel"
import AuditItemTable from "./AuditItemTable"
import ViewModeStateSetter from "./ViewModeStateSetter"
import ProgressChart from "./ProgressChart"
import AuditStatusPanel from "./AuditStatusPanel"

const ViewMode = () => {
    const { mode } = useDiscrepancySelection()

    if (mode !== 'view') return false
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            <ViewModeStateSetter />

            <ActionsPanel />
            <ProgressChart />
            <AuditStatusPanel />


            <AuditItemTable />

        </div>
    )
}

export default ViewMode
