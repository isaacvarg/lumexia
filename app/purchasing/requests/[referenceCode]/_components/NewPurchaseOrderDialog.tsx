"use client"
import Dialog from "@/components/Dialog"
import { RequestSupplier } from "../_functions/getSuppliers"
import { LinkablePo } from "../_functions/getLinkablePos"
import { useEffect, useMemo, useRef, useState } from "react"
import { TbSearch } from "react-icons/tb"
import { createNewPO } from "../_functions/createNewPO"
import useDialog from "@/hooks/useDialog"
import Fuse from "fuse.js"

type NewPurchaseOrderDialogProps = {
  suppliers: RequestSupplier[]
  requestId: string
  itemId: string
  linkablePOs: LinkablePo[]
}

const NewPurchaseOrderDialog = ({ suppliers, requestId, itemId, linkablePOs }: NewPurchaseOrderDialogProps) => {

  const { resetDialogContext } = useDialog()
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [queryResults, setQueryResults] = useState<RequestSupplier[]>([])

  const searcher = useMemo(() => {
    const searchOptions = {
      keys: [
        'name'
      ]
    }
    return new Fuse(suppliers, searchOptions)
  }, [suppliers])

  const uniqueSuggestedSuppliers = linkablePOs
    .map((po) => po.purchaseOrders.supplier) // Extract the supplier object
    .filter((value, index, self) =>
      index === self.findIndex((t) => t.id === value.id) // Ensure uniqueness by supplier id
    );


  const handleSubmit = async (supplierId: string) => {
    await createNewPO(supplierId, itemId, requestId);
    resetDialogContext()

  }



  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      const searchResults = searcher.search(searchInput);
      const mappedResults = searchResults.map((s) => s.item);
      setQueryResults(mappedResults);
    }, 500);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchInput, searcher]);



  return (
    <Dialog.Root identifier="newPOFromRequest">
      <Dialog.Title>Add a New Purchase Order</Dialog.Title>

      <div className="flex flex-col gap-y-8 h-[400px]">
        <div className="flex flex-col gap-y-4">
          <span className="text-xl font-poppins text-base-content">Suggested</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {uniqueSuggestedSuppliers.map((supplier) => {
              return (
                <div
                  onClick={() => handleSubmit(supplier.id)}
                  key={supplier.id}
                  className="rounded-xl bg-secondary/50 py-2 px-4 text-lg  font-medium  text-secondary-content font-poppins hover:cursor-pointer hover:bg-secondary/30">
                  {supplier.name}
                </div>
              )
            })}
          </div>
        </div>


        <div className="flex flex-col gap-y-4">
          <span className="text-xl font-poppins text-base-content">Search</span>

          <label className="input input-bordered flex items-center gap-2 w-full">
            <input type="text" className="grow" placeholder="Name of supplier" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            <span className="text-2xl"><TbSearch /></span>
          </label>



          <ul className="flex flex-col gap-y-2 max-h-40 overflow-y-auto">

            {queryResults.map((result) => {
              return (
                <li key={result.id} className="font-poppins text-lg  bg-primary/50 rounded-xl py-2 px-4 hover:cursor-pointer hover:bg-primary/30" onClick={() => handleSubmit(result.id)}>
                  <span>{result.name}</span>
                </li>

              )
            })}

          </ul>

        </div>


      </div>

    </Dialog.Root>
  )
}

export default NewPurchaseOrderDialog
