'use client'
import Card from "@/components/Card"
import SectionTitle from "@/components/Text/SectionTitle"
import { Uom } from "@/actions/inventory/getAllUom"
import { deleteUnitOfMeasurement } from "@/app/inventory/_actions/deleteUnitOfMeasurement"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { TbEdit, TbPlus, TbTrash } from "react-icons/tb"
import UomForm from "./UomForm"
import DeletionErrorAlert from "./shared/DeletionErrorAlert"

const UnitsOfMeasurement = ({ uoms }: { uoms: Uom[] }) => {

  const router = useRouter();
  const [isEdit, setIsEdit] = useState(false);
  const [selected, setSelected] = useState<Uom | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const result = await deleteUnitOfMeasurement(id);
    if (!result.success) {
      setDeleteError(result.error);
      return;
    }
    router.refresh();
  };

  const handleEdit = (uom: Uom) => {
    setSelected(uom);
    setIsEdit(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <SectionTitle>Units of Measurement</SectionTitle>

        <button onClick={() => { setSelected(null); setIsEdit(true); }} className="btn btn-secondary">
          <TbPlus className="size-4" />
        </button>
      </div>

      <Card.Root>
        {isEdit && (
          <UomForm selected={selected} setSelected={setSelected} setIsEdit={setIsEdit} />
        )}

        {!isEdit && (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Abbreviation</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {uoms.map((uom) => (
                  <tr key={uom.id}>
                    <td>{uom.name}</td>
                    <td>{uom.abbreviation}</td>
                    <td className="flex gap-2 justify-end">
                      <button onClick={() => handleEdit(uom)} className="btn btn-ghost btn-accent" aria-label={`Edit ${uom.name}`}>
                        <TbEdit className="size-4" />
                      </button>
                      <button onClick={() => handleDelete(uom.id)} className="btn btn-ghost btn-error" aria-label={`Delete ${uom.name}`}>
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

      <DeletionErrorAlert
        identifier="uomDeletionError"
        error={deleteError}
        onClose={() => setDeleteError(null)}
      />
    </div>
  )
}

export default UnitsOfMeasurement
