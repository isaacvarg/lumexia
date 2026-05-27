'use client'

import { ItemAlias } from "@/actions/inventory/aliases/getByItem";
import { SingleItem } from "@/actions/inventory/getOneItem";
import { ItemNote } from "@/actions/inventory/items/notes/getAllByItem";
import { useItemActions, useItemSelection } from "@/store/itemSlice";
import { useEffect } from "react";
import { ItemActivity } from "../../_actions/basics/getActivity";
import { Inventory } from "@/actions/inventory/getInventory";
import { ItemInventoryAudits } from "../../_actions/inventory/getAudits";
import { DashboardItemPurchaseOrder } from "../../_actions/purchasing/getItemPurchaseOrders";
import { PricingExamination } from "@/actions/accounting/examinations/getAllByItem";
import { ItemPricingData } from "@/actions/accounting/pricing/getItemPricingData";
import { ItemUsage } from "../../_actions/production/getUsage";
import { ItemActiveMbpr } from "../../_actions/production/getActiveMbpr";
import { ItemBpr } from "../../_actions/production/getBprs";
import { ItemFile } from "../../_actions/files/getAllItemFiles";
import { QcItemParameter } from "@/actions/quality/qc/parameters/getAllByItem";
import { QcRecordExpanded } from "@/actions/quality/qc/records/getAllByItem";
import { DiscreteConversion } from "@/actions/inventory/items/discreteConversions/getAll";
import { ReorderingRule } from "@/actions/inventory/reorderingRules/get";
import { QcMeasurementRow } from "../../_actions/quality/getMeasurements";

type StateSetterProps = {
  activity: ItemActivity[],
  aliases: ItemAlias[]
  item: SingleItem | null
  inventory: Inventory | null,
  notes: ItemNote[],
  audits: ItemInventoryAudits,
  purchaseOrders: DashboardItemPurchaseOrder[],
  examinations: PricingExamination[],
  pricingData: ItemPricingData,
  usage: ItemUsage,
  activeMbpr: ItemActiveMbpr | null,
  bprs: ItemBpr[],
  files: ItemFile[],
  qcItemParameters: QcItemParameter[]
  qcRecords: QcRecordExpanded[]
  qcMeasurements: QcMeasurementRow[]
  discreteConversions: DiscreteConversion[]
  reorderingRule: ReorderingRule
}


const StateSetter = ({
  activity,
  aliases,
  inventory,
  item,
  notes,
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
}: StateSetterProps) => {

  // state actions
  const {
    setActivity,
    setActiveMbpr,
    setAliases,
    setAudits,
    setBprs,
    setExaminations,
    setItem,
    setFiles,
    setInventory,
    setNotes,
    setPricingData,
    setPurchaseOrders,
    setUsage,
    getOptions,
    setQcItemParameters,
    getFilteredPurchaseOrders,
    setQcRecords,
    setQcMeasurements,
    setCurrentTab,
    setSelectedAlias,
    setLotsViewMode,
    setPurchasingFilterMode,
    setQualityTemplateViewMode,
    setSelectedLot,
    setDiscreteConversions,
    setReorderingRule,
  } = useItemActions();

  // current state
  const {
    options,
    purchasingFilterMode,
    filterPurchaseOrdersYear,
  } = useItemSelection()

  useEffect(() => {
    setItem(item)

    // clear everything else
    setCurrentTab('basics');
    setSelectedAlias(null);
    setLotsViewMode('table');
    setPurchasingFilterMode('yearToDate');
    setQualityTemplateViewMode('view');
    setSelectedLot(null);


  }, [item, setItem])

  // get options only if the state is empty 
  // saves server calls
  useEffect(() => {

    const isEmpty = Object.values(options).every(arr => arr.length === 0);
    if (isEmpty) {
      getOptions();
    }

    // set states based off item 
    setActivity(activity);
    setAliases(aliases);
    setAudits(audits);
    setExaminations(examinations);
    setInventory(inventory);
    setNotes(notes);
    setPricingData(pricingData);
    setPurchaseOrders(purchaseOrders);
    setUsage(usage);
    setBprs(bprs);
    setActiveMbpr(activeMbpr);
    setFiles(files);
    setQcItemParameters(qcItemParameters)
    setQcRecords(qcRecords)
    setQcMeasurements(qcMeasurements)
    setDiscreteConversions(discreteConversions)
    setReorderingRule(reorderingRule)

  }, [item, options, getOptions, setActivity, activity, setAliases, aliases, setAudits, audits, setExaminations, examinations, setInventory, inventory, setNotes, notes, setPricingData, pricingData, setPurchaseOrders, purchaseOrders, setUsage, usage, setBprs, bprs, setActiveMbpr, activeMbpr, setFiles, files, qcItemParameters, setQcItemParameters, qcRecords, setQcRecords, qcMeasurements, setQcMeasurements, discreteConversions, setDiscreteConversions, reorderingRule, setReorderingRule,]);

  useEffect(() => {
    getFilteredPurchaseOrders();
  }, [purchasingFilterMode, filterPurchaseOrdersYear, getFilteredPurchaseOrders])


  return false;
}

export default StateSetter
