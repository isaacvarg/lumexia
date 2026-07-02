"use client";

import { useTabSelection } from "@/store/tabSlice";
import { Experiment } from "@/actions/research/getAllExperiments";
import { ExperimentGroupWithExperiments } from "@/actions/research/getExperimentGroupsWithExperiments";
import Table from "../Table";
import GroupsTab from "../groups/GroupsTab";

type Props = {
  experiments: Experiment[];
  groups: ExperimentGroupWithExperiments[];
};

const TabsContainer = ({ experiments, groups }: Props) => {
  const { activeTab } = useTabSelection();
  const currentTab = activeTab.researchExperiments ?? "experiments";

  return (
    <>
      {currentTab === "experiments" && <Table experiments={experiments} />}
      {currentTab === "groups" && <GroupsTab groups={groups} />}
    </>
  );
};

export default TabsContainer;
