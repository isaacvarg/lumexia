"use client";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import NotesManager from "@/components/Notes/NotesManager";
import { NoteInputs } from "@/components/Notes/NotesAddMode";
import { NoteTypeInputs } from "@/components/Notes/CreateNoteTypeForm";
import { getUserId } from "@/actions/users/getUserId";
import { researchActions } from "@/actions/research";
import { ExperimentSampleRow } from "@/actions/research/samples/getAllByExperiment";
import { ExperimentNoteTypeRow } from "@/actions/research/experimentNoteTypes/getAll";
import { SampleNoteRow } from "@/actions/research/sampleNotes/getAllBySample";

type Props = {
  sample: ExperimentSampleRow;
  notes: SampleNoteRow[];
  noteTypes: ExperimentNoteTypeRow[];
};

const SampleNotesPanel = ({ sample, notes, noteTypes }: Props) => {
  const router = useRouter();

  const handleNoteAdd = async (data: NoteInputs) => {
    const userId = await getUserId();
    const { fileIds, ...rest } = data;
    await researchActions.sampleNotes.create(
      { ...rest, sampleId: sample.id, userId },
      fileIds,
    );
    router.refresh();
  };

  const handleNoteTypeAdd = async (data: NoteTypeInputs) => {
    await researchActions.experimentNoteTypes.create(data);
    router.refresh();
  };

  const handleDelete = async (note: SampleNoteRow) => {
    await researchActions.sampleNotes.delete({ id: note.id });
    router.refresh();
  };

  return (
    <Card.Root>
      <NotesManager<SampleNoteRow, ExperimentNoteTypeRow>
        notes={notes}
        noteTypes={noteTypes}
        onNoteAdd={handleNoteAdd}
        onNoteTypeAdd={handleNoteTypeAdd}
        onDelete={handleDelete}
      />
    </Card.Root>
  );
};

export default SampleNotesPanel;
