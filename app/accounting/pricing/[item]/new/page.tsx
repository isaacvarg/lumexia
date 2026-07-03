import { inventoryActions } from "@/actions/inventory"
import StateSetter from "./_components/state/StateSetter"
import { procurementTypes } from "@/configs/staticRecords/procurementTypes"
import { accountingActions } from "@/actions/accounting"
import PricingTabs from "./_components/shared/view/PricingTabs"
import Header from "./_components/shared/Header"
import { getTotalCostPerLbPurchased } from "./_calculations/getTotalCostPerLbPurchased"
import { getBomWithPricing } from "./_actions/getBomWithPricing"
import { productionActions } from "@/actions/production"
import { BatchSummations } from "./_actions/getBomPricingSummations"
import { uomUtils } from "@/utils/uom"
import { uom } from "@/configs/staticRecords/unitsOfMeasurement"
import PricingErrorAlert from "./_components/PricingErrorAlert"
import ZeroCostBomAlert from "./_components/ZeroCostBomAlert"
import { detectZeroCostBomItems } from "./_actions/detectZeroCostBomItems"
import HelperSetter from "@/components/Helper/HelperSetter"

type Props = {
  searchParams: {
    id: string
    examId: string
  }
}

const NewPricingExaminationPage = async ({ searchParams }: Props) => {

  try {
    // start
    const item = await inventoryActions.items.getOne(searchParams.id);
    const examId = searchParams.examId
      ? searchParams.examId
      : (await accountingActions.examinations.create(item.id)).id;

    // determine what type of pricing this is
    const isPurchased = item.procurementTypeId === procurementTypes.purchased;

    const activeMbpr = !isPurchased ? await productionActions.mbprs.getActive(item.id) : null

    const [
      purchasedItemPricingData,
      purchasedItemLastPrice,
      packagingItems,
      notes,
      noteTypes,
      producedItemPricingData,
    ] = await Promise.all([
      isPurchased
        ? await accountingActions.pricing.item.getItemPricingData(item.id)
        : Promise.resolve(null),
      isPurchased
        ? await accountingActions.pricing.item.getLastItemPrice(item.id)
        : Promise.resolve(null),
      await accountingActions.consumerContainers.getPackagingItems(),
      await accountingActions.examinations.notes.getAll(examId),
      await accountingActions.examinations.notes.getAllNoteTypes(),
      !isPurchased
        ? await getBomWithPricing(activeMbpr?.id || '')
        : Promise.resolve(null),

    ]);

    // Convert last purchase price to $/lb for display
    // Note: For price conversion, we need the inverse of quantity conversion.
    // If 1 kg = 2.2 lb, then $10/kg = $10/2.2 = $4.54/lb
    // We achieve this by converting 1 lb to the source UOM, then multiplying.
    let lastPriceConvertedToLb: number | null = null;
    if (isPurchased && purchasedItemLastPrice) {
      if (purchasedItemLastPrice.uomId === uom.pounds) {
        lastPriceConvertedToLb = purchasedItemLastPrice.pricePerUnit;
      } else {
        try {
          lastPriceConvertedToLb = purchasedItemLastPrice.pricePerUnit * await uomUtils.convert(
            { id: uom.pounds, isStandard: true },
            1,
            { id: purchasedItemLastPrice.uomId, isStandard: purchasedItemLastPrice.uom.isStandardUom },
            item.id,
            purchasedItemLastPrice.purchaseOrders?.supplierId
          );
        } catch (error: any) {
          const poContext = {
            location: 'lastPriceConvertedToLb',
            purchaseOrderId: purchasedItemLastPrice.purchaseOrders?.id,
            purchaseOrderReferenceCode: purchasedItemLastPrice.purchaseOrders?.referenceCode,
            purchaseOrderItemId: purchasedItemLastPrice.id,
            itemId: item.id,
            itemName: item.name,
            supplierId: purchasedItemLastPrice.purchaseOrders?.supplierId,
            uomId: purchasedItemLastPrice.uomId,
            uomName: purchasedItemLastPrice.uom.name,
            uomIsStandard: purchasedItemLastPrice.uom.isStandardUom,
          };
          throw new Error(`${error.message} | Debug: ${JSON.stringify(poContext)}`);
        }
      }
    }

    const [
      totalCostPerLb,
      finishedProducts,
    ] = await Promise.all([
      isPurchased
        ? await getTotalCostPerLbPurchased(purchasedItemLastPrice, purchasedItemPricingData)
        : Promise.resolve(
          (producedItemPricingData?.isError)
            ? 0
            : (producedItemPricingData as BatchSummations).totalCostPerLb
        ),
      isPurchased
        ? await accountingActions.finishedProducts.getByPurchasedItem(item.id)
        :
        await accountingActions.finishedProducts.getByProducedItem(item.id, producedItemPricingData as any),

    ])

    // Detect zero-cost BOM items for produced items
    const zeroCostBomDetection =
      !isPurchased && producedItemPricingData && !producedItemPricingData.isError
        ? detectZeroCostBomItems(producedItemPricingData as BatchSummations)
        : null;

    return (
      <div className="flex flex-col gap-6">

        <HelperSetter section="accounting-pricing-conduct" />

        {zeroCostBomDetection?.hasZeroCost && (
          <ZeroCostBomAlert
            affectedItems={zeroCostBomDetection.affectedItems}
            examId={examId}
            itemId={item.id}
          />
        )}

        <Header />

        <StateSetter
          item={item}
          examId={examId}
          purchasedItemPricingData={purchasedItemPricingData}
          purchasedItemLastPrice={purchasedItemLastPrice}
          lastPriceConvertedToLb={lastPriceConvertedToLb}
          finishedProducts={finishedProducts}
          totalCostPerLb={totalCostPerLb}
          packagingItems={packagingItems}
          notes={notes}
          noteTypes={noteTypes}
          activeMbpr={activeMbpr}
          producedItemPricingData={producedItemPricingData}
        />

        <PricingTabs />


      </div>
    )
  } catch (error: any) {
    return <PricingErrorAlert error={error.message} />
  }
}

export default NewPricingExaminationPage
