"use client"

import { Mbpr } from "@/actions/production/mbpr/getOneMbpr"
import Card from "@/components/Card"
import { TextUtils } from "@/utils/text"
import SetActiveSizeDialog from "./SetActiveSizeDialog"
import useDialog from "@/hooks/useDialog"

const BatchSizesPanel = ({ sizes }: { sizes: Mbpr['BatchSize'] }) => {

    const { showDialog } = useDialog()

    return (
        <Card.Root>
            <SetActiveSizeDialog sizes={sizes} />
            <div className="flex justify-between items-center">

                <Card.Title>Batch Sizes</Card.Title>
                <button onClick={() => showDialog("selectActiveBatchSize")} className="btn btn-accent">Set Active Size</button>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {sizes.map((size) => (
                    <div key={size.id} className="card card-compact bg-base-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                        <div className="card-body">
                            <h2 className="card-title font-poppins">{size.quantity} lbs</h2>
                            <div className="card-actions">
                                <div
                                    style={{ backgroundColor: size.recordStatus.bgColor, color: size.recordStatus.textColor }}
                                    className="badge font-semibold py-3 px-4"
                                >
                                    {TextUtils.properCase(size.recordStatus.name)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </Card.Root>
    )
}

export default BatchSizesPanel
