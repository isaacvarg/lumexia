"use client";
import { useRouter } from "next/navigation";
import { getUserId } from "@/actions/users/getUserId";
import { researchActions } from "@/actions/research";
import { ExperimentNoteRow } from "@/actions/research/experimentNotes/getAllByExperiment";
import { ExperimentNoteTypeRow } from "@/actions/research/experimentNoteTypes/getAll";
import { NoteInputs } from "@/components/Notes/NotesAddMode";
import { NoteTypeInputs } from "@/components/Notes/CreateNoteTypeForm";
import Card from "@/components/Card";
import NotesManager from "@/components/Notes/NotesManager";

type Props = {
  experimentId: string;
  notes: ExperimentNoteRow[];
  noteTypes: ExperimentNoteTypeRow[];
};

const ExperimentNotesPanel = ({ experimentId, notes, noteTypes }: Props) => {
  const router = useRouter();

  const handleNoteAdd = async (data: NoteInputs) => {
    const userId = await getUserId();
    const { fileIds, ...rest } = data;
    await researchActions.experimentNotes.create(
      { ...rest, experimentId, userId },
      fileIds,
    );
    router.refresh();
  };

  const handleNoteTypeAdd = async (data: NoteTypeInputs) => {
    await researchActions.experimentNoteTypes.create(data);
    router.refresh();
  };

  const handleDelete = async (note: ExperimentNoteRow) => {
    await researchActions.experimentNotes.delete({ id: note.id });
    router.refresh();
  };

  return (
    <Card.Root>
      <NotesManager<ExperimentNoteRow, ExperimentNoteTypeRow>
        notes={notes}
        noteTypes={noteTypes}
        onNoteAdd={handleNoteAdd}
        onNoteTypeAdd={handleNoteTypeAdd}
        onDelete={handleDelete}
      />
    </Card.Root>
  );
};

export default ExperimentNotesPanel;
