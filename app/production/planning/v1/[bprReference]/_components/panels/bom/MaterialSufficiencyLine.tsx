"use client"
import React from 'react'
import { toFracitonalDigits } from '@/utils/data/toFractionalDigits'
import useDialog from '@/hooks/useDialog'
import { BprBomItemInventory } from '@/actions/inventory/inventory/getAllByBom'
import MaterialAllocationDialog from './MaterialAllocationDialog'
import { usePlanningDashboardActions } from '@/store/planningDashboardSlice'
import { DateTime } from 'luxon'
import { TbX } from 'react-icons/tb'
import { useAppSelection } from '@/store/appSlice'
import Image from 'next/image'
import { inventoryTypes } from '@/configs/staticRecords/inventoryTypes'

const classes = {
  bg: {
    insufficient: 'bg-red-300',
    sufficient: '',
  }
}



const UserIcon = ({ image, name }: { image: string, name: string }) => {
  return (
    <div className="tooltip" data-tip={name}>
      <div className="flex gap-x-4">
        <div className="avatar">
          <div className="w-8 rounded-full">
            <Image src={image} alt={name} width={32} height={32} />
          </div>
        </div>

      </div>

    </div>
  )
}

const RedX = () => {
  return (
    <span className='text-2xl text-red-400'><TbX /></span>
  )
}

const MaterialSufficiencyLine = ({ material, isDraft }: { material: BprBomItemInventory, isDraft: boolean }) => {

  const { showDialog } = useDialog()
  const { setSelectedBomItem } = usePlanningDashboardActions()
  const { user } = useAppSelection()

  const isConsumable = material.bom.item.inventoryTypeId === inventoryTypes.consumable;
  const available = isConsumable ? 'Consumable' : toFracitonalDigits.weight(material.totalQuantityAvailable);

  const isAvailableSufficient = material.totalQuantityAvailable >= material.quantity;
  const bgClasses: keyof typeof classes.bg = user?.roles.isPurchasing ? ((isAvailableSufficient || isConsumable) ? 'sufficient' : 'insufficient') : 'sufficient'
  const hasStagings = material.BprStaging.length !== 0
  const stagings = hasStagings ? material.BprStaging[0] : null
  const primaryVerification = stagings ? stagings.BprStagingVerification[0] : null;
  const secondaryVerification = stagings ? stagings.BprStagingVerification[1] : null;

  const handleClick = () => {
    setSelectedBomItem(material)
    showDialog(`allocation${material.id}`)
  }

  return (
    <tr className={`${classes.bg[bgClasses]} hover:bg-neutral-200 hover:cursor-pointer`} onClick={() => handleClick()}>
      <th>{material.bom.identifier}</th>
      <td>{material.bom.item.name}</td>

      <td>{toFracitonalDigits.weight(material.quantity)}</td>

      {isDraft ? <td>{isConsumable ? 'Consumable' : available}</td> : (user?.roles.isPurchasing ? <td>{isConsumable ? 'Consumable' : available}</td> : null)}
      {isDraft && <td>{isConsumable ? <progress className='progress ' value={100} max={100} /> : <progress className='progress' value={material.totalQuantityAvailable} max={material.quantity}></progress>}</td>}
      {!isDraft && (stagings?.pulledByUser ? <td><UserIcon image={stagings.pulledByUser.image || ''} name={stagings.pulledByUser.name || ''} /></td> : <td><RedX /></td>)}
      {!isDraft && (primaryVerification ? <td><UserIcon image={primaryVerification.user.image || ''} name={primaryVerification.user.name || ''} /></td> : <td><RedX /></td>)}
      {!isDraft && (secondaryVerification ? <td><UserIcon image={secondaryVerification.user.image || ''} name={secondaryVerification.user.name || ''} /></td> : <td><RedX /></td>)}
    </tr>
  )
}

export default MaterialSufficiencyLine
