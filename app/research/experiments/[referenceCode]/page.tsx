import { notFound } from "next/navigation";
import { researchActions } from "@/actions/research";
import { inventoryActions } from "@/actions/inventory";
import { getMbprsByItem } from "@/actions/production/getMbprsByItem";
import { procurementTypes } from "@/configs/staticRecords/procurementTypes";
import Header from "./_components/Header";
import TabSelector from "./_components/shared/TabSelector";
import TabsContainer from "./_components/shared/TabsContainer";
import ExperimentHelper from "./_components/shared/ExperimentHelper";

type PageProps = {
  params: { referenceCode: string };
  searchParams: { id?: string; sampleId?: string };
};

const ExperimentDetailPage = async ({ searchParams }: PageProps) => {
  const id = searchParams.id;
  if (!id) return notFound();
  const initialSampleId = searchParams.sampleId;

  const [
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
  ] = await Promise.all([
    researchActions.experiments.getOne(id),
    researchActions.experimentGroups.getAll(),
    researchActions.experimentStatuses.getAll(),
    researchActions.variants.getAllByExperiment(id),
    inventoryActions.items.getAll(),
    researchActions.samples.getAllByExperiment(id),
    inventoryActions.uom.getAll(),
    researchActions.experimentNoteTypes.getAll(),
    researchActions.experimentNotes.getAllByExperiment(id),
    researchActions.experimentFiles.getAllByExperiment(id),
    researchActions.experimentNotes.getAggregatedFeed(id),
    researchActions.experimentFiles.getAggregatedList(id),
  ]);

  if (!experiment) return notFound();

  const mbprs =
    experiment.primarySubject.procurementTypeId === procurementTypes.produced
      ? await getMbprsByItem(experiment.primarySubject.id)
      : [];

  return (
    <div className="p-6 flex flex-col gap-6">
      <Header
        experiment={experiment}
        variants={variants}
        samples={samples}
        noteEntries={aggregatedNotes}
      />
      <ExperimentHelper />
      <TabSelector />
      <TabsContainer
        experiment={experiment}
        groups={groups}
        statuses={statuses}
        variants={variants}
        items={items}
        mbprs={mbprs}
        samples={samples}
        uoms={uoms}
        noteTypes={noteTypes}
        experimentNotes={experimentNotes}
        experimentFiles={experimentFiles}
        aggregatedNotes={aggregatedNotes}
        aggregatedFiles={aggregatedFiles}
        initialSampleId={initialSampleId}
      />
    </div>
  );
};

export default ExperimentDetailPage;
