import { qualityActions } from "@/actions/quality"
import { getLotsByItem } from "@/actions/auxiliary/getLotsByItem"
import prisma from "@/lib/prisma"
import BulkEntryForm from "./_components/BulkEntryForm"
import HelperSetter from "@/components/Helper/HelperSetter"

type Props = {
  params: { itemName: string }
}

const BulkEntryPage = async ({ params }: Props) => {
  const itemName = decodeURIComponent(params.itemName)

  const item = await prisma.item.findFirstOrThrow({
    where: { name: itemName },
    include: {
      itemType: true,
      procurementType: true,
      inventoryType: true,
      inventoryUom: true,
    }
  })

  const [examinationTypes, qcItemParameters, lots] = await Promise.all([
    qualityActions.qc.examinationTypes.getAll(),
    qualityActions.qc.itemParameters.getByItem(item.id),
    getLotsByItem(item.id),
  ])

  return (
    <div className="flex flex-col gap-6 p-6">
      <HelperSetter section="qc-examinations" />
      <div className="flex flex-col gap-1">
        <h1 className="font-poppins text-3xl font-semibold text-base-content">Bulk Entry</h1>
        <p className="font-poppins text-lg text-base-content/70">{item.name}</p>
      </div>

      <BulkEntryForm
        examinationTypes={examinationTypes}
        qcItemParameters={qcItemParameters}
        lots={lots}
        item={item}
      />
    </div>
  )
}

export default BulkEntryPage
