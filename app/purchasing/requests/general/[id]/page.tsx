import PageWrapper from "@/components/App/PageWrapper"
import { getGeneralRequest } from "../_actions/getGeneralRequest"
import { getAllGeneralRequestStatuses } from "../_actions/getAllGeneralRequestStatuses"
import StatusPanel from "./_components/StatusPanel"
import BasicsPanel from "./_components/BasicsPanel"
import { getAllGeneralRequestNoteTypes } from "../_actions/getAllGeneralRequestNoteTypes"
import NotesPanel from "../_components/NotesPanel"
import FilesPanel from "../_components/FilesPanel"
import { getAllRequestLinks } from "../_actions/getAllRequestLinks"
import CreatePanel from "./_components/CreatePanel"
import { getAllItemTypes } from "@/actions/inventory/itemTypes/getAll"

const GeneralRequestPage = async ({ searchParams }: { searchParams: { id: string } }) => {

    const request = await getGeneralRequest(searchParams.id)
    const statuses = await getAllGeneralRequestStatuses();
    const noteTypes = await getAllGeneralRequestNoteTypes();
    const links = await getAllRequestLinks(searchParams.id);
    const itemTypes = await getAllItemTypes();

    return (
        <PageWrapper pageTitle={'General Request'} >

            <div className="flex items-center px-40 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">

                    <BasicsPanel title={request.title} user={request.user} createdAt={request.createdAt} />
                    <StatusPanel requestId={request.id} status={request.status} statuses={statuses} />
                    <CreatePanel requestId={request.id} generalRequestReferenceCode={request.referenceCode} links={links} itemTypes={itemTypes} />
                    <NotesPanel requestId={request.id} noteTypes={noteTypes} notes={request.notes} />
                    <FilesPanel requestId={request.id} files={request.transformedFiles} />


                </div>
            </div>
        </PageWrapper>
    )
}

export default GeneralRequestPage
