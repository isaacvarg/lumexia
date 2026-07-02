import React from "react";
import CreateExperiment from "./_components/CreateExperiment";
import ExperimentsScanListener from "./_components/ScanListener";
import TabSelector from "./_components/shared/TabSelector";
import TabsContainer from "./_components/shared/TabsContainer";
import { researchActions } from "@/actions/research";

const ExperimentsPage = async () => {
  const [experiments, groups] = await Promise.all([
    researchActions.experiments.getAll(),
    researchActions.experimentGroups.getAllWithExperiments(),
  ]);

  if (!experiments) {
    return <div className="skeleton w-20 h-20" />;
  }

  return (
    <div className="bg-base-200 rounded-xl px-6">
      <ExperimentsScanListener />
      <TabSelector />
      <TabsContainer experiments={experiments} groups={groups} />
      <CreateExperiment />
    </div>
  );
};

export default ExperimentsPage;
