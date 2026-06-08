import Card from "@/components/Card"
import { useItemSelection } from "@/store/itemSlice"
import { recordStatuses } from "@/configs/staticRecords/recordStatuses"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"

const ActiveMbprBom = () => {

  const { activeMbpr } = useItemSelection()


  if (!activeMbpr) return false;

  const activeSize = activeMbpr.BatchSize.find(bz => bz.recordStatusId === recordStatuses.active)

  if (!activeSize) return false;

  return (
    <Card.Root span={2}>
      <Card.Title>Bill of Materials</Card.Title>
      <div className="overflow-x-auto overflow-y-auto max-h-[500px]">
        <table className="table table-zebra">
          {/* head */}
          <thead>
            <tr>
              <th>#</th>
              <th>Phase</th>
              <th>Item Name</th>
              <th>{`% w/w`}</th>
              <th>Amount (lb)</th>
            </tr>
          </thead>
          <tbody>
            {activeMbpr?.BillOfMaterial.sort((a, b) => parseInt(a.identifier) - parseInt(b.identifier)).map(b => {

              const amount = (b.concentration * 0.01) * activeSize.quantity
              return (
                <tr key={b.id}>

                  <td>{b.identifier}</td>
                  <td>{b?.step?.phase || ''}</td>
                  <td>{b?.item?.name || ''}</td>
                  <td>{toFracitonalDigits.weight(b.concentration)}</td>
                  <td>{toFracitonalDigits.weight(amount)}</td>
                </tr>
              )
            })}

          </tbody>
        </table>
      </div>

    </Card.Root>
  )
}

export default ActiveMbprBom
