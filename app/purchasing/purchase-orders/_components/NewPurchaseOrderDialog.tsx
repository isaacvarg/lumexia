import supplierActions from '@/actions/purchasing/supplierActions'
import Dialog from '@/components/Dialog'
import React from 'react'
import NewPurchaseOrderForm from './NewPurchaseOrderForm';
import { recordStatuses } from '@/configs/staticRecords/recordStatuses';

const NewPurchaseOrderDialog = async () => {

    const suppliers = await supplierActions.getAll({
        recordStatusId: recordStatuses.active,
    });

  return (
   <Dialog.Root identifier='createPurchaseOrder' >
    <NewPurchaseOrderForm suppliers={suppliers} />
   </Dialog.Root>
  )
}

export default NewPurchaseOrderDialog