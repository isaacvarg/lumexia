import Form from "@/components/Form"
import { Dispatch, SetStateAction, useState } from "react"
import { useForm } from "react-hook-form"
import { TagSelectOptions } from '@/components/Form/TagSelect'
import { useRouter } from "next/navigation"
import { NoteType } from "@/types/note"
import { FileResponseData } from "@/app/api/upload/route"
import NoteAttachments from "./NoteAttachments"

export type NoteInputs = {
  noteTypeId: string,
  content: string,
  fileIds: string[],
}

interface AddModeProps<TNoteType extends NoteType> {
  setMode: Dispatch<SetStateAction<'view' | 'addNote' | 'addType'>>
  noteTypes: TNoteType[]
  onNoteAdd: (note: NoteInputs) => void;
}

const NotesAddMode = <TNoteType extends NoteType>({ setMode, noteTypes, onNoteAdd }: AddModeProps<TNoteType>) => {

  const form = useForm<NoteInputs>({ defaultValues: { content: '', noteTypeId: noteTypes[0]?.id || '', fileIds: [] } })
  const router = useRouter()
  const [attachments, setAttachments] = useState<FileResponseData[]>([])

  const typeOptions: TagSelectOptions[] = noteTypes.map((type) => {
    return { value: type.id, label: type.name, bgColor: type.bgColor, textColor: type.textColor }
  });

  const handleSubmit = (data: NoteInputs) => {
    onNoteAdd({ ...data, fileIds: attachments.map(a => a.fileId) });
    router.refresh();
    setMode('view');
  }

  const handleCancel = () => {
    setMode("view");
    form.reset()
    setAttachments([])
  }

  const handleAddNewType = () => {
    setMode('addType')
  }

  const handleAttachmentAdd = (file: FileResponseData) => {
    setAttachments(prev => [...prev, file])
  }

  const handleAttachmentRemove = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <Form.Root form={form} onSubmit={handleSubmit}>

      <Form.TagSelect form={form} fieldName="noteTypeId" onAddNew={handleAddNewType} label="Type" options={typeOptions} />

      <Form.Text form={form} fieldName="content" label="Content" required />

      <NoteAttachments
        attachments={attachments}
        onAdd={handleAttachmentAdd}
        onRemove={handleAttachmentRemove}
      />

      <div className='flex flex-row justify-end gap-x-2'>
        <button type='button' className='btn btn-warning' onClick={() => handleCancel()}>Cancel</button>
        <button className='btn btn-success' type='submit'>Submit</button>
      </div>

    </Form.Root>
  )
}

export default NotesAddMode
