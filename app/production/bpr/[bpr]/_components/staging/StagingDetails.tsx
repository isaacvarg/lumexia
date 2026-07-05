import { useProductionSelection } from "@/store/productionSlice"
import Aliases from "./Aliases";
import Amounts from "../shared/Amounts";
import DetailActions from "./DetailActions";
import { Fragment } from "react";
import Notes from "../shared/Notes";
import StagedViewMode from "./StagedViewMode";
import StagedAddMode from "./StagedAddMode";

const StagingDetails = () => {
  const { selectedBomItem, stagingDetailsMode } = useProductionSelection()

  if (!selectedBomItem) return null;

  return (
    <div className="col-span-1 sm:col-span-2 lg:col-span-3" >
      <div className="flex flex-col gap-6">

        {stagingDetailsMode === 'main' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <DetailActions />
            <Aliases />
          </div>
        )}

        {stagingDetailsMode === 'main' && (
          <Fragment>
            <Amounts />
            <StagedViewMode />
          </Fragment>
        )}

        {stagingDetailsMode === 'add' && (
          <StagedAddMode />
        )}

        {stagingDetailsMode === 'note' && (
          <Notes />
        )}
      </div>
    </div>
  )
};

export default StagingDetails;
