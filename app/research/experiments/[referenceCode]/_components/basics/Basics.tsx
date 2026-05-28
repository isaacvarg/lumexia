"use client";
import { SingleExperiment } from "@/actions/research/getOneExperiment";
import { ExperimentGroup } from "@/actions/research/getAllExperimentGroups";
import { ExperimentStatus } from "@/actions/research/getAllExperimentStatuses";
import { ExperimentNoteRow } from "@/actions/research/experimentNotes/getAllByExperiment";
import { ExperimentNoteTypeRow } from "@/actions/research/experimentNoteTypes/getAll";
import { ExperimentFileRow } from "@/actions/research/experimentFiles/getAllByExperiment";
import BasicDetailsPanel from "./BasicDetailsPanel";
import ExperimentNotesPanel from "./ExperimentNotesPanel";
import ExperimentFilesPanel from "./ExperimentFilesPanel";

type BasicsProps = {
  experiment: SingleExperiment;
  groups: ExperimentGroup[];
  statuses: ExperimentStatus[];
  notes: ExperimentNoteRow[];
  files: ExperimentFileRow[];
  noteTypes: ExperimentNoteTypeRow[];
};

const Basics = ({ experiment, groups, statuses, notes, files, noteTypes }: BasicsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BasicDetailsPanel experiment={experiment} groups={groups} statuses={statuses} />
      <ExperimentFilesPanel experimentId={experiment.id} files={files} />
      <ExperimentNotesPanel
        experimentId={experiment.id}
        notes={notes}
        noteTypes={noteTypes}
      />
    </div>
  );
};

export default Basics;
