'use client'
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import { inventoryActions } from "@/actions/inventory"
import { Uom } from "@/actions/inventory/getAllUom"
import { UomConversion } from "@/actions/inventory/uomConversions/getAll"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TbEdit, TbPlus, TbTrash } from "react-icons/tb"
import UomConversionForm from "./UomConversionForm"

const UomConversions = ({ uoms, conversions }: { uoms: Uom[], conversions: UomConversion[] }) => {

  const router = useRouter();
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState<UomConversion | null>(null);

  const handleDelete = async (id: string) => {
    await inventoryActions.uomConversions.delete(id);
    router.refresh();
  };

  const handleEdit = (conversion: UomConversion) => {
    setSelected(conversion);
    setIsEdit(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <SectionTitle>Conversions</SectionTitle>

        <button onClick={() => { setSelected(null); setIsEdit(true); }} className="btn btn-secondary">
          <TbPlus className="size-4" />
        </button>
      </div>

      <Card.Root>
        {isEdit && (
          <UomConversionForm uoms={uoms} selected={selected} setSelected={setSelected} setIsEdit={setIsEdit} />
        )}

        {!isEdit && (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Conversion</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((c) => (
                  <tr key={c.id}>
                    <td>{`1 ${c.uomA.name}`}</td>
                    <td>{`= ${c.conversionFactor} ${c.uomB.name}`}</td>
                    <td className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(c)} className="btn btn-ghost btn-accent" aria-label={`Edit conversion ${c.uomA.name} to ${c.uomB.name}`}>
                        <TbEdit className="size-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="btn btn-ghost btn-error" aria-label={`Delete conversion ${c.uomA.name} to ${c.uomB.name}`}>
                        <TbTrash className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card.Root>
    </div>
  )
}

export default UomConversions
