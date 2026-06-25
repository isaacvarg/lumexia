"use client"
import { revalidatePage } from '@/actions/app/revalidatePage'
import supplierPaymentMethodActions from '@/actions/purchasing/supplierPaymentMethods'
import ActionButton from '@/components/ActionButton'
import { SupplierPaymentMethod } from '@/types/supplierPaymentMethod'
import { createActivityLog } from '@/utils/auxiliary/createActivityLog'
import React from 'react'

const DeletePaymentMethod = ({method} : {method: SupplierPaymentMethod}) => {
    const handleClick = async () => {
        await supplierPaymentMethodActions.deleteOne({id: method.id}); 
        await createActivityLog('deleteSupplierPaymentMethod', 'supplier', method.supplierId, {
            context: `Payment Method ${method.paymentMethod.methodName} - ${method.paymentMethod.identifier} was removed from supplier`
        })
        revalidatePage('/purchasing/suppliers/[name]')
    } 
  return (
    <div><ActionButton onClick={handleClick}>X</ActionButton></div>
  )
}

export default DeletePaymentMethod