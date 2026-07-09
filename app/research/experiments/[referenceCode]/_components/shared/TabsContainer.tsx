"use client";
import { useEffect } from "react";
import { useTabSelection, useTabActions } from "@/store/tabSlice";
import { motion, AnimatePresence } from "framer-motion";
import { SingleExperiment } from "@/actions/research/getOneExperiment";
import { ExperimentGroup } from "@/actions/research/getAllExperimentGroups";
import { ExperimentStatus } from "@/actions/research/getAllExperimentStatuses";
import { ExperimentVariantWithMaterials } from "@/actions/research/variants/getAllByExperiment";
import { Item } from "@/actions/inventory/getAllItems";
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
import Cost from "../cost/Cost";
import Notes from "../notes/Notes";
import Files from "../files/Files";

type TabsContainerProps = {
  experiment: SingleExperiment;
  groups: ExperimentGroup[];
  statuses: ExperimentStatus[];
  variants: ExperimentVariantWithMaterials[];
  items: Item[];
  samples: ExperimentSampleRow[];
  uoms: Uom[];
  noteTypes: ExperimentNoteTypeRow[];
  experimentNotes: ExperimentNoteRow[];
  experimentFiles: ExperimentFileRow[];
  aggregatedNotes: AggregatedNoteEntry[];
  aggregatedFiles: AggregatedFileEntry[];
  initialSampleId?: string;
};

const TabsContainer = ({
  experiment,
  groups,
  statuses,
  variants,
  items,
  samples,
  uoms,
  noteTypes,
  experimentNotes,
  experimentFiles,
  aggregatedNotes,
  aggregatedFiles,
  initialSampleId,
}: TabsContainerProps) => {
  const { activeTab } = useTabSelection();
  const { setActiveTab } = useTabActions();
  const currentTab = activeTab["experimentDetails"] ?? "basics";

  // When arriving via a scanned sample QR, jump straight to the Samples tab; Samples
  // itself seeds the focused view from initialSampleId.
  useEffect(() => {
    if (initialSampleId) setActiveTab("experimentDetails", "samples");
  }, [initialSampleId, setActiveTab]);

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
          />
        )}
        {currentTab === "samples" && (
          <Samples
            experimentId={experiment.id}
            experimentReferenceCode={experiment.referenceCode}
            primarySubject={experiment.primarySubject.name}
            variants={variants}
            samples={samples}
            uoms={uoms}
            noteTypes={noteTypes}
            initialSampleId={initialSampleId}
          />
        )}
        {currentTab === "cost" && <Cost experimentId={experiment.id} />}
        {currentTab === "notes" && <Notes entries={aggregatedNotes} />}
        {currentTab === "files" && <Files entries={aggregatedFiles} />}
      </motion.div>
    </AnimatePresence>
  );
};

export default TabsContainer;
