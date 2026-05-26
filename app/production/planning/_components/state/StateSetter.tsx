'use client'
import { BprStatus } from "@/actions/production/bprs/statuses/getAll";
import { AllPlanningBpr } from "@/actions/production/getAllPlanningBprs";
import { PlanningBpr } from "@/actions/production/getPlanningBprs";
import { useBprPlanningActions } from "@/store/bprPlanningSlice";
import { useEffect } from "react";

type Props = {
  bprs: PlanningBpr[]
  allBprs: AllPlanningBpr[]
  statuses: BprStatus[]
}

const StateSetter = ({ bprs, allBprs, statuses }: Props) => {

  const { setBprs, setAllBprs, setStatuses } = useBprPlanningActions()
  useEffect(() => {
    setBprs(bprs)
    setAllBprs(allBprs)
    setStatuses(statuses)

  }, [bprs, allBprs, statuses])

  return false;
}

export default StateSetter
