import React from 'react'
import Table from './_components/Table'
import itemTypeActions from '@/actions/inventory/itemTypeActions'
import itemActions from '@/actions/inventory/items'
import CreateItem from './_components/CreateItem'
import { inventoryActions } from '@/actions/inventory'
import HelperSetter from '@/components/Helper/HelperSetter'


const ItemsPage = async () => {

  const items = await inventoryActions.items.getAll()

  if (!items) {
    return (
      <div className='skeleton w-20 h-20' />
    )
  }


  return (
    <div className='bg-base-200 rounded-xl px-6'>
      <HelperSetter section="items" />

      <Table items={items} />

      <CreateItem />
    </div>
  )
}

export default ItemsPage
