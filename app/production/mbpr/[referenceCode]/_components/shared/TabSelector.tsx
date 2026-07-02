'use client'
import { useMbprDetailsSelection } from "@/store/mbprDetailsSlice";
import TabButton from "./TabButton";

export type MbprTab = 'overview' | 'instructions' | 'notes' | 'activity' | 'rnd'

const TabSelector = () => {

  const { mbpr } = useMbprDetailsSelection()

  const tabs: MbprTab[] = ['overview', 'instructions', 'notes', 'activity', 'rnd'];

  if (!mbpr) {
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
