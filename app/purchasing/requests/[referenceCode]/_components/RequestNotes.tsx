'use client'

import { NoteTypeInputs } from '@/components/Notes/CreateNoteTypeForm'
import { NoteInputs } from '@/components/Notes/NotesAddMode'
import NotesManager from '@/components/Notes/NotesManager'
import { NotesManagerHeight } from '@/components/Notes/ViewMode'
import { useRouter } from 'next/navigation'
import { RequestNoteType } from '../_functions/getNoteTypes'
import { RequestNote } from '../_functions/getRequestNotes'
import { createRequestNote } from '../_functions/createRequestNote'
import { createRequestNoteType } from '../_functions/createRequestNoteType'
import SectionTitle from '@/components/Text/SectionTitle'
import Card from '@/components/Card'

const RequestNotes = ({ notes, noteTypes, requestId, maxHeight = 'small' }: {
  notes: RequestNote[]
  noteTypes: RequestNoteType[]
  requestId: string
  maxHeight?: NotesManagerHeight
}) => {
  const router = useRouter()

  const handleNoteAdd = async (data: NoteInputs) => {
    await createRequestNote(requestId, data.content, data.noteTypeId, data.fileIds)
    router.refresh()
  }

  const handleNoteTypeAdd = async (data: NoteTypeInputs) => {
    await createRequestNoteType(data)
    router.refresh()
  }

  return (
    <div className='flex flex-col gap-2'>
      <SectionTitle>Notes</SectionTitle>
      <Card.Root shadow="none"  >

        <NotesManager<RequestNote, RequestNoteType>
          notes={notes}
          noteTypes={noteTypes}
          onNoteAdd={handleNoteAdd}
          onNoteTypeAdd={handleNoteTypeAdd}
          maxHeight={maxHeight}
          style="flat"
          noteStyle="elevated"
          showTitle={false}
        />
      </Card.Root>
    </div>
  )
}

export default RequestNotes
