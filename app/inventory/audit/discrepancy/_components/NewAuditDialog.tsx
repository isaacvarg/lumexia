'use client'
import Dialog from "@/components/Dialog"
import { ItemType } from "@prisma/client"
import { beginDiscrepancyAuditCascade } from "../_actions/beginDiscrepancyAuditCascade"
import { useState } from "react"
import { Loader } from "@/components/Loading"
import useDialog from "@/hooks/useDialog"

const NewAuditDialog = ({ itemTypes }: { itemTypes: ItemType[] }) => {

  const [isLoading, setIsLoading] = useState(false);
  const { resetDialogContext } = useDialog()

  const handleClick = async (itemTypeId: string | null) => {

    setIsLoading(true)
    try {
      // wait a little to show animation lol 
      await new Promise((resolve) => setTimeout(resolve, 8000));

      if (!itemTypeId) {
        beginDiscrepancyAuditCascade(null)
      }

      if (itemTypeId) {
        beginDiscrepancyAuditCascade(itemTypeId)
      }

    } catch (error) {
      console.error("Failed", error)
    } finally {
      resetDialogContext()
      setIsLoading(false)
    }


  }

  return (
    <Dialog.Root identifier="newDiscrepancyAuditDialog">

      <Dialog.Title>New Discrepancy Audit</Dialog.Title>

      {!isLoading ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <button className="btn btn-neutral btn-soft" onClick={() => handleClick(null)}>All</button>
        {itemTypes.map(it => {
          return (
            <button key={it.id} className="btn btn-neutral btn-soft" onClick={() => handleClick(it.id)}>
              {it.name}
            </button>
          )
        })}

      </div>) : (
        <Loader.Silly isLoading={isLoading} />
      )}
    </Dialog.Root>
  )
}

export default NewAuditDialog
