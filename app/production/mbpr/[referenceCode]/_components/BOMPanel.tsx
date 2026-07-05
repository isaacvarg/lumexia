"use client"

import { MbprBom } from "@/actions/production/mbpr/getOneMbpr"
import DataTable from "@/components/DataTable";
import { BOMColumns } from "./BOMColumns";
import Card from "@/components/Card";

const BOMPanel = ({ bom }: { bom: MbprBom[]}) => {



    return (
        <div className="col-span-1 sm:col-span-2">
            <Card.Root>

                <div className="flex flex-col gap-y-8">
                <Card.Title>Bill of Materials</Card.Title>

                    <p className="font-poppins text-lg font-normal">The quantities displayed below are calculated using the active batch size.</p>

                    <DataTable.Default
                        tableStateName='equipment'
                        columns={BOMColumns}
                        data={bom}
                        disableFilters
                        disablePagination
                        onRowClick={(row) => {
                            console.log(row)
                        }}
                        initialSortBy={[{ id: "identifier", desc: false }]}
                    />

                </div>


            </Card.Root>
        </div>
    )
}

export default BOMPanel
