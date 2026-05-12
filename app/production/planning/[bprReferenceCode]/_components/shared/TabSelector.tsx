'use client'
import { useBprDetailsSelection } from "@/store/bprDetailsSlice";
import TabButton from "./TabButton";


// define the tabs
export type BprTab = 'basics' | 'steps' | 'quality' | 'notes' | 'activity'

const TabSelector = () => {

  const { bpr } = useBprDetailsSelection()


  const tabs: BprTab[] = ['basics', 'steps', 'quality', 'notes', 'activity',];

  if (!bpr) {
    return <Skeleton />
  }

  return (
    <div className="flex items-center justify-start gap-x-6">

      {tabs.map(tab => <TabButton key={tab} tab={tab} />)}
    </div>
  )
}

const Skeleton = () => {
  return (
    <div className="flex items-center justify-start gap-x-6">
      <button className="skeleton btn w-40"></button>
      <button className="skeleton btn w-40"></button>
      <button className="skeleton btn w-40"></button>
      <button className="skeleton btn w-40"></button>
    </div>
  )
}

export default TabSelector
