'use client'
import TabButton from "./TabButton";
import { useItemSelection } from "@/store/itemSlice";
import { procurementTypes } from "@/configs/staticRecords/procurementTypes";

// get static
const { produced } = procurementTypes;

// define the tabs
export type ItemTab = 'basics' | 'inventory' | 'purchasing' | 'pricing' | 'production' | 'rnd' | 'quality' | 'files' | 'danger';

const TabSelector = () => {

  const { item } = useItemSelection()
  const isProduced = item?.procurementTypeId === produced;


  const tabs: ItemTab[] = ['basics', 'inventory', 'pricing', 'production', 'rnd', 'quality', 'files',];

  // produced items do not need purchased tab
  if (!isProduced) {
    tabs.splice(2, 0, 'purchasing')
  }

  if (!item) {
    return <Skeleton />
  }

  return (
    <div className="flex flex-wrap items-center gap-3">

      {tabs.map(tab => <TabButton key={tab} tab={tab} />)}
    </div>
  )
}

const Skeleton = () => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button className="skeleton btn w-40"></button>
      <button className="skeleton btn w-40"></button>
      <button className="skeleton btn w-40"></button>
      <button className="skeleton btn w-40"></button>
    </div>
  )
}

export default TabSelector
