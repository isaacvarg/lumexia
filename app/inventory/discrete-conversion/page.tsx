import { inventoryActions } from "@/actions/inventory"
import prisma from "@/lib/prisma"
import ConversionForm from "./_components/ConversionForm"
import PageTitle from "@/components/Text/PageTitle"

const DiscreteConversionForm = async ({ searchParams }: { searchParams: { itemId: string, supplierId: string, purchasedUomId: string } }) => {

  const { itemId, supplierId, purchasedUomId } = searchParams
  console.log('itemId:', itemId)
  console.log('supplierId:', supplierId)
  console.log('purchasedUomId:', purchasedUomId)

  const uoms = await inventoryActions.uom.getAll();
  const supplier = await prisma.supplier.findUnique({ where: { id: supplierId } });
  const item = await inventoryActions.items.getOne(itemId);
  const uomsMap = new Map(uoms.map(u => [u.id, u]));
  const uomA = uomsMap.get(item.inventoryUomId)
  const uomB = uomsMap.get(purchasedUomId)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
      <div className="flex col-span-1 sm:col-span-2 flex-col gap-6 ">
        <PageTitle>New Discrete Conversion</PageTitle>

        {(uomA && uomB && supplier) && (
          <ConversionForm inventoryUom={uomA} supplierUom={uomB} item={item} supplier={supplier} />
        )}
      </div>

      <div className="flex flex-col gap-8">
        <PageTitle color="soft">Why</PageTitle>
        <p className="font-poppins text-xl font-normal text-base-content/80">
          A discrete conversion is a conversion factor between two units of measurement that are distinct for a particular combination of supplier, item, and units of measurement.
        </p>

        <p className="font-poppins text-xl font-normal text-base-content/80">
          This is often necessary for when a non SI (International System of Units) or standard Imperial units are used, such as tote, box, bag.
        </p>

      </div>

    </div>
  )

}

export default DiscreteConversionForm 
