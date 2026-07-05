import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import useDialog from "@/hooks/useDialog"
import { usePurchasingActions, usePurchasingSelection } from "@/store/purchasingSlice"
import { toFracitonalDigits } from "@/utils/data/toFractionalDigits"
import { getSlug } from "@/utils/general/getSlug"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { TbKeyboard, TbMessageDots, TbQuestionMark } from "react-icons/tb"

const ViewMode = () => {

  const { orderItems, lineItemsMode } = usePurchasingSelection()
  const { setLineItemsMode } = usePurchasingActions()
  const [total, setTotal] = useState(0)
  const { showDialog } = useDialog();
  const router = useRouter();

  useEffect(() => {

    const total = orderItems.reduce((acc, curr) => {
      return acc + (curr.pricePerUnit * curr.quantity)
    }, 0)

    setTotal(total);

  }, [orderItems, lineItemsMode])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center justify-between">

        <SectionTitle>Order Items</SectionTitle>
        <div className="flex gap-1">
          <button onClick={() => showDialog("motions")} className="btn btn-secondary">
            <TbKeyboard className="size-6" />
          </button>
          <button onClick={() => setLineItemsMode('edit')} className="btn btn-secondary">Modify</button>
        </div>
      </div>

      <Card.Root>
        <div>
          <div className="w-full overflow-x-auto"><table className="table table-zebra">
            <thead>
              <tr>
                <th>IID</th>
                <th>Item Name</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>UOM</th>
                <th>Total</th>
              </tr>

            </thead>
            <tbody>

              {orderItems.map(i => {

                const formattedName = getSlug(i.item.name);
                const path = `/inventory/items/${formattedName}?id=${i.item.id}`
                const hasAliases = i.allAliases.length > 0;
                return (
                  <tr
                    key={i.id}
                    className="hover:bg-accent/30 hover:cursor-pointer"
                    onClick={() => router.push(path)}
                  >
                    <td>{i.item.referenceCode}</td>
                    {hasAliases ? (
                      <td>
                        <div className="flex gap-1 items-center">
                          {i.alias ? i.alias : i.item.name}
                          <div className="tooltip tooltip-info z-50">
                            <div className="tooltip-content p-6 z-50">
                              <div className="flex flex-col gap-1">

                                <p>Aliases:</p>

                                {i.allAliases.map(a => <div className="" key={a.id}>{`${a.name}`}</div>)}
                                {i.alias && <div>{i.item.name}</div>}
                              </div>
                            </div>
                            <TbMessageDots className="size-6" />
                          </div>
                        </div></td>
                    ) : <td>
                      {i.alias ? i.alias : i.item.name}
                    </td>}
                    <td>{`$ ${toFracitonalDigits.weight(i.pricePerUnit)}`}</td>
                    <td>{toFracitonalDigits.weight(i.quantity)}</td>
                    <td>{i.uomAbbreviation}</td>
                    <td>{toFracitonalDigits.curreny(i.pricePerUnit * i.quantity)}</td>
                  </tr>
                )
              })}


            </tbody>

          </table></div>

        </div>
      </Card.Root>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        <div />
        <div />

        <div className="flex flex-col gap-4">
          <SectionTitle>Total</SectionTitle>
          <Card.Root>
            <div className="font-poppins text-lg font-medium text-base-content">$ {toFracitonalDigits.curreny(total)}</div>
          </Card.Root>
        </div>

      </div>


    </div>
  )
}

export default ViewMode
