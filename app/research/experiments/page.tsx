import React from "react";
import Table from "./_components/Table";
import CreateExperiment from "./_components/CreateExperiment";
import { researchActions } from "@/actions/research";

const ExperimentsPage = async () => {
  const experiments = await researchActions.experiments.getAll();

  if (!experiments) {
    return <div className="skeleton w-20 h-20" />;
  }

  return (
    <div className="bg-base-200 rounded-xl px-6">
      <Table experiments={experiments} />
      <CreateExperiment />
    </div>
  );
};

export default ExperimentsPage;
