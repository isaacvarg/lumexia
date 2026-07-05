import React from 'react'
import InventoryTypes from './InventoryTypes'
import ProcurementTypes from './ProcurementTypes'
import AliasTypes from './AliasTypes'
import ItemTypes from './ItemTypes'
import FileTypes from './FileTypes'

type Props = {
  inventoryTypes: React.ComponentProps<typeof InventoryTypes>['inventoryTypes']
  itemTypes: React.ComponentProps<typeof ItemTypes>['itemTypes']
  aliasTypes: React.ComponentProps<typeof AliasTypes>['aliasTypes']
  fileTypes: React.ComponentProps<typeof FileTypes>['fileTypes']
}

const InventoryConfiguration = ({ inventoryTypes, itemTypes, aliasTypes, fileTypes }: Props) => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
      <InventoryTypes inventoryTypes={inventoryTypes} />
      <ProcurementTypes />
      <AliasTypes aliasTypes={aliasTypes} />

      <ItemTypes itemTypes={itemTypes} />

      <FileTypes fileTypes={fileTypes} />
    </div>
  )
}

export default InventoryConfiguration
