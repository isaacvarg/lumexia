'use client'
import { useState } from "react"
import ActionsPanel from "./ActionsPanel"
import InfoPanel from "./InfoPanel"
import TitlePanel from "./TitlePanel"
import { GeneralRequestNote } from "../_actions/getAllGeneralRequestNotes"
import { GeneralRequestNoteType } from "../_actions/getAllGeneralRequestNoteTypes"
import NotesPanel from "./NotesPanel"
import FilesPanel from "./FilesPanel"
import { GeneralRequestFile } from "../_actions/getAllGeneralRequestFiles"

type RequestMainProps = {
    notes: GeneralRequestNote[],
    noteTypes: GeneralRequestNoteType[]
    files: GeneralRequestFile[]
    requestId: string
}

const RequestMain = ({ notes, noteTypes, files, requestId }: RequestMainProps) => {

    const [title, setTitle] = useState<string>('');

    return (
        <div className="flex items-center px-40">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">

                <ActionsPanel requestId={requestId} title={title} />

                <InfoPanel />

                <TitlePanel onChange={setTitle} value={title} />

                <FilesPanel files={files} requestId={requestId} />

                <NotesPanel notes={notes} noteTypes={noteTypes} requestId={requestId} />

            </div>
        </div>
    )
}

export default RequestMain
