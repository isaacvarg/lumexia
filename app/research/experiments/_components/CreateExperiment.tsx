import React from "react";
import CreateExperimentForm from "./CreateExperimentForm";
import { inventoryActions } from "@/actions/inventory";

const CreateExperiment = async () => {
  const items = await inventoryActions.items.getAll();
  return <CreateExperimentForm items={items} />;
};

export default CreateExperiment;
