import { inventoryActions } from "@/actions/inventory";
import StateSetter from "./_components/state/StateSetter";
import TitleRow from "./_components/shared/TitleRow";
import TabSelector from "./_components/shared/TabSelector";
import TabsContainer from "./_components/shared/TabsContainer";
import { getItemActivity } from "./_actions/basics/getActivity";
import { getInventory } from "@/actions/inventory/getInventory";
import { getAudits } from "./_actions/inventory/getAudits";
import { getItemPurchaseOrders } from "./_actions/purchasing/getItemPurchaseOrders";
import { accountingActions } from "@/actions/accounting";
import { getItemPricingData } from "@/actions/accounting/pricing/getItemPricingData";
import { getBomUsage } from "./_actions/production/getUsage";
import { getActiveMbpr } from "./_actions/production/getActiveMbpr";
import { getBprs } from "./_actions/production/getBprs";
import { getAllItemFiles } from "./_actions/files/getAllItemFiles";
import { qualityActions } from "@/actions/quality";
import { getReorderingRule } from "@/actions/inventory/reorderingRules/get";
import { getItemMeasurements } from "./_actions/quality/getMeasurements";
import DangerZoneButton from "./_components/shared/DangerZoneButton";
import ItemHelper from "./_components/shared/ItemHelper";

const ItemDetails = async ({ searchParams }: { searchParams: { id: string } }) => {

  // all the data fetching
  const item = await inventoryActions.items.getOne(searchParams.id)
  const [
    aliases,
    notes,
    activity,
    inventory,
    audits,
    purchaseOrders,
    examinations,
    pricingData,
    usage,
    activeMbpr,
    bprs,
    files,
    qcItemParameters,
    qcRecords,
    qcMeasurements,
    discreteConversions,
    reorderingRule,
  ] = await Promise.all([
    await inventoryActions.aliases.getByItem(item.id),
    await inventoryActions.items.notes.getAllByItem(item.id),
    await getItemActivity(item.id),
    await getInventory(item.id),
    await getAudits(item.id),
    await getItemPurchaseOrders(item.id),
    await accountingActions.examinations.getAllByItem(item.id),
    await getItemPricingData(item.id),
    await getBomUsage(item.id),
    await getActiveMbpr(item.id),
    await getBprs(item.id),
    await getAllItemFiles(item.id),
    await qualityActions.qc.itemParameters.getByItem(item.id),
    await qualityActions.qc.records.getAllByItem(item.id),
    await getItemMeasurements(item.id),
    await inventoryActions.items.discreteConversions.getAll(item.id),
    await getReorderingRule(item.id),
  ])


  return (
    <div className="flex flex-col gap-y-6">

      <StateSetter
        item={item}
        aliases={aliases}
        notes={notes}
        activity={activity}
        inventory={inventory}
        audits={audits}
        purchaseOrders={purchaseOrders}
        usage={usage}
        examinations={examinations}
        pricingData={pricingData}
        activeMbpr={activeMbpr}
        bprs={bprs}
        files={files}
        qcItemParameters={qcItemParameters}
        qcRecords={qcRecords}
        qcMeasurements={qcMeasurements}
        discreteConversions={discreteConversions}
        reorderingRule={reorderingRule}
      />

      <ItemHelper />

      <TitleRow />

      <TabSelector />

      <TabsContainer />

      <DangerZoneButton />

    </div>
  )
}

export default ItemDetails; 
