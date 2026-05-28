"use client";
import { useTabSelection } from "@/store/tabSlice";
import { motion, AnimatePresence } from "framer-motion";
import { SingleExperiment } from "@/actions/research/getOneExperiment";
import { ExperimentGroup } from "@/actions/research/getAllExperimentGroups";
import { ExperimentStatus } from "@/actions/research/getAllExperimentStatuses";
import { ExperimentVariantWithMaterials } from "@/actions/research/variants/getAllByExperiment";
import { Item } from "@/actions/inventory/getAllItems";
import { MbprByItem } from "@/actions/production/getMbprsByItem";
import { ExperimentSampleRow } from "@/actions/research/samples/getAllByExperiment";
import { Uom } from "@/actions/inventory/getAllUom";
import { ExperimentNoteTypeRow } from "@/actions/research/experimentNoteTypes/getAll";
import { ExperimentNoteRow } from "@/actions/research/experimentNotes/getAllByExperiment";
import { ExperimentFileRow } from "@/actions/research/experimentFiles/getAllByExperiment";
import { AggregatedNoteEntry } from "@/actions/research/experimentNotes/getAggregatedFeed";
import { AggregatedFileEntry } from "@/actions/research/experimentFiles/getAggregatedList";
import Basics from "../basics/Basics";
import Variants from "../variants/Variants";
import Samples from "../samples/Samples";
import Notes from "../notes/Notes";
import Files from "../files/Files";

type TabsContainerProps = {
  experiment: SingleExperiment;
  groups: ExperimentGroup[];
  statuses: ExperimentStatus[];
  variants: ExperimentVariantWithMaterials[];
  items: Item[];
  mbprs: MbprByItem[];
  samples: ExperimentSampleRow[];
  uoms: Uom[];
  noteTypes: ExperimentNoteTypeRow[];
  experimentNotes: ExperimentNoteRow[];
  experimentFiles: ExperimentFileRow[];
  aggregatedNotes: AggregatedNoteEntry[];
  aggregatedFiles: AggregatedFileEntry[];
};

const TabsContainer = ({
  experiment,
  groups,
  statuses,
  variants,
  items,
  mbprs,
  samples,
  uoms,
  noteTypes,
  experimentNotes,
  experimentFiles,
  aggregatedNotes,
  aggregatedFiles,
}: TabsContainerProps) => {
  const { activeTab } = useTabSelection();
  const currentTab = activeTab["experimentDetails"] ?? "basics";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {currentTab === "basics" && (
          <Basics
            experiment={experiment}
            groups={groups}
            statuses={statuses}
            notes={experimentNotes}
            files={experimentFiles}
            noteTypes={noteTypes}
          />
        )}
        {currentTab === "variants" && (
          <Variants
            experimentId={experiment.id}
            variants={variants}
            items={items}
            mbprs={mbprs}
          />
        )}
        {currentTab === "samples" && (
          <Samples
            experimentId={experiment.id}
            variants={variants}
            samples={samples}
            uoms={uoms}
            noteTypes={noteTypes}
          />
        )}
        {currentTab === "notes" && <Notes entries={aggregatedNotes} />}
        {currentTab === "files" && <Files entries={aggregatedFiles} />}
      </motion.div>
    </AnimatePresence>
  );
};

export default TabsContainer;
