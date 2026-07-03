import React from 'react'
import { getRequest } from './_functions/getRequest';
import BasicDetailsPanel from './_components/BasicDetailsPanel';
import { getLinkedBatches } from './_functions/getLinkedBatches';
import LinkedBatchesPanel from './_components/LinkedBatchesPanel';
import SelectBprDialog from './_components/SelectBprDialog';
import { getLinkableBprs } from './_functions/getLinkableBprs';
import LinkedPosPanel from './_components/LinkedPosPanel';
import { getLinkedPos } from './_functions/getLinkedPos';
import { getLinkablePos } from './_functions/getLinkablePos';
import SelectPoDialog from './_components/SelectPoDialog';
import InventoryPanel from './_components/InventoryPanel';
import { getLinkedPosAmount } from './_functions/getLinkedPoAmounts';
import { getLinkedBprsAmounts } from './_functions/getLinkedBprAmounts';
import { getRequestStatuses } from './_functions/getRequestStatuses';
import NewPurchaseOrderDialog from './_components/NewPurchaseOrderDialog';
import { getSuppliers } from './_functions/getSuppliers';
import RequestDetailsPageTitle from './_components/PageTitle';
import RequestNotes from './_components/RequestNotes';
import { getNoteTypes } from './_functions/getNoteTypes';
import { getRequestNotes } from './_functions/getRequestNotes';
import { getRequestPriorities } from './_functions/getRequestPriorities';
import { getSupplierTags } from './_functions/getSupplierTags';
import HelperSetter from '@/components/Helper/HelperSetter';

type RequestDetailsProps = {
  searchParams: {
    id: string;
  };
};


const RequestDetailsPage = async ({ searchParams }: RequestDetailsProps) => {

  const request = await getRequest(searchParams.id)
  const linkedBprs = await getLinkedBatches(searchParams.id)
  const linkedPos = await getLinkedPos(searchParams.id, request.itemId)
  const linkableBprs = await getLinkableBprs(request.itemId);
  const linkablePos = await getLinkablePos(request.itemId);
  const linkedPoAmounts = await getLinkedPosAmount(linkedPos.map((po) => po.poId), request.itemId)
  const linkedBprAmounts = await getLinkedBprsAmounts(linkedBprs.map((bpr) => bpr.bprId), request.itemId)
  const requestStatuses = await getRequestStatuses();
  const requestPriorities = await getRequestPriorities();
  const suppliers = await getSuppliers();
  const noteTypes = await getNoteTypes()
  const requestNotes = await getRequestNotes(request.id)
  const supplierTags = await getSupplierTags(request.id);



  if (!request) {
    return null
  }

  return (
    <div className='flex flex-col gap-y-4'>

      <SelectBprDialog requestId={request.id} linkableBprs={linkableBprs} />
      <SelectPoDialog requestId={request.id} linkablePos={linkablePos} />
      <NewPurchaseOrderDialog requestId={request.id} suppliers={suppliers} linkablePOs={linkablePos} itemId={request.itemId} />
      <HelperSetter section="request-details" />
      <RequestDetailsPageTitle request={request} />

      <div className='grid grid-cols-2 gap-8'>

        <BasicDetailsPanel
          suppliers={suppliers}
          supplierTags={supplierTags}
          requestingUser={request.requestingUser.name ?? ""}
          statusName={request.status.name ?? ""}
          priorityName={request.priority.name}
          requestDate={request.createdAt}
          requestId={request.id}
          allStatuses={requestStatuses}
          allPriorities={requestPriorities}
          statusId={request.statusId}
          priorityId={request.priorityId}
          expectedDateStart={request.expectedDateStart}
          expectedDateEnd={request.expectedDateEnd}
        />

        <RequestNotes notes={requestNotes} noteTypes={noteTypes} requestId={request.id} />

        <LinkedBatchesPanel bprs={linkedBprs} linkedBprAmounts={linkedBprAmounts} />

        <LinkedPosPanel pos={linkedPos} linkedPosAmounts={linkedPoAmounts} />

        <InventoryPanel notes={requestNotes} noteTypes={noteTypes} requestId={searchParams.id} itemId={request.itemId} />

      </div>


    </div>
  )
}

export default RequestDetailsPage
