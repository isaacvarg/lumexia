'use client'
import { usePricingQueue } from "@/hooks/appQuery/usePricingQueue"
import Panel from "../Panel";
import PricingOption from "./PricingOption";
import { usePricingReviews } from "@/hooks/appQuery/usePricingReviews";

const Pricing = () => {

  const { data: exams, isLoading } = usePricingReviews()


  if (!exams || isLoading) {
    return (
      <Panel title="New Requests">
        <div className="grid grid-cols-1 gap-1">
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-full" />
        </div>
      </Panel>
    )
  }

  const isComplete = exams.length === 0;


  return (
    <Panel title="Reviewable Pricing" titlePath="/accounting/pricing">

      {isComplete && <p className="font-poppins text-lg font-medium text-base-content">All done 👍🏽👍🏽🫰🏽🫰🏽</p>}

      {!isComplete && <div className="grid grid-cols-1 gap-1.5 max-h-[250px] overflow-y-auto overflow-x-hidden">
        {exams.map((exam) => {
          return (
            <PricingOption key={exam.id} exam={exam} />
          )
        })}
      </div>}
    </Panel>

  )
}

export default Pricing
