'use client'
import inventoryTypeActions from "@/actions/inventory/inventoryTypeActions"
import Card from "@/components/Card"
import { useAppForm } from "@/components/Form2"
import SectionTitle from "@/components/Text/SectionTitle"
import { InventoryType } from "@prisma/client"
import { useRouter } from "next/navigation"

const InventoryTypes = ({ inventoryTypes }: { inventoryTypes: InventoryType[] }) => {


  const tracked = inventoryTypes.find(it => it.isTracked);
  const consumbalbe = inventoryTypes.find(it => !it.isTracked);
  const router = useRouter()

  const form = useAppForm({
    defaultValues: {
      tracked: tracked?.name,
      consumable: consumbalbe?.name,
    },
    onSubmit: async ({ value }) => {
      if (!tracked || !consumbalbe) return;
      await inventoryTypeActions.update({ id: tracked.id }, { name: value.tracked });
      await inventoryTypeActions.update({ id: consumbalbe.id }, { name: value.consumable });
      router.refresh()
      form.reset()
    }
  }
  )


  return (
    <div className="flex flex-col gap-4">
      <SectionTitle>Inventory Types</SectionTitle>

      <Card.Root>
        <p className="font-poppins text-xl text-base-content">The names of each type can be modified, but the application is limited to these types.</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >

          <form.AppField
            name="tracked"
          >
            {(field) => <field.TextField
              label="Tracked"
              description="Meticulously monitored via quantity and lot traceability"
            />}
          </form.AppField>


          <form.AppField
            name="consumable"
          >
            {(field) => <field.TextField label="Not Tracked" />}
          </form.AppField>


          <div>
            <form.AppForm>
              <form.SubmitButton />
            </form.AppForm>
          </div>

        </form>
      </Card.Root>

    </div>
  )
}

export default InventoryTypes
