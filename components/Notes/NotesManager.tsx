'use client'
import Text from "@/components/Text";
import { useState } from "react";
import NotesViewMode, { NotesManagerHeight, NotesManagerStyle, NotesNoteStyle } from "./ViewMode";
import { Note, NoteType } from "@/types/note";
import NotesAddMode, { NoteInputs } from "./NotesAddMode";
import CreateNoteTypeForm, { NoteTypeInputs } from "./CreateNoteTypeForm";


interface NotesManagerProps<TNote extends Note, TNoteType extends NoteType> {
  notes: TNote[];
  noteTypes: TNoteType[];
  onNoteAdd: (note: NoteInputs) => Promise<void>;
  onNoteTypeAdd: (noteType: NoteTypeInputs) => Promise<void>;
  onDelete?: (note: TNote) => Promise<void>;
  maxHeight?: NotesManagerHeight
  style?: NotesManagerStyle
  noteStyle?: NotesNoteStyle
  showTitle?: boolean
}

const NotesManager = <TNote extends Note, TNoteType extends NoteType>({ notes, noteTypes, onNoteAdd, onNoteTypeAdd, onDelete, maxHeight = 'small', style = 'base', noteStyle = 'default', showTitle = true }: NotesManagerProps<TNote, TNoteType>) => {

  const [mode, setMode] = useState<'addType' | 'addNote' | 'view'>('view');

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex justify-between items-center">

        {showTitle && <Text.SectionTitle size="small">Notes</Text.SectionTitle>}
        {mode === 'view' && <button onClick={() => setMode('addNote')} className="btn btn-neutral btn-soft">Add Note</button>}
      </div>

      {mode === 'view' && <NotesViewMode<TNote> notes={notes} maxHeight={maxHeight} style={style} noteStyle={noteStyle} onDelete={onDelete} />}

      {mode === 'addNote' && onNoteAdd && <NotesAddMode<TNoteType> onNoteAdd={onNoteAdd} noteTypes={noteTypes} setMode={setMode} />}
      {mode === 'addType' && onNoteTypeAdd && <CreateNoteTypeForm onNoteTypeAdd={onNoteTypeAdd} setMode={setMode} />}

    </div>
  )
}

export default NotesManager
