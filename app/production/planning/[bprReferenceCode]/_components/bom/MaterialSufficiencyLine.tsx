"use client"
import React from 'react'
import { toFracitonalDigits } from '@/utils/data/toFractionalDigits'
import useDialog from '@/hooks/useDialog'
import { BprBomItemInventory } from '@/actions/inventory/inventory/getAllByBom'
import { TbX } from 'react-icons/tb'
import { LuCheck, LuTriangleAlert, LuX } from 'react-icons/lu'
import Image from 'next/image'
import { useBprDetailsActions } from '@/store/bprDetailsSlice'
import { inventoryTypes } from '@/configs/staticRecords/inventoryTypes'

const classes = {
  bg: {
    insufficient: 'bg-error/30',
    warning: 'bg-warning/30',
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
    <span className='text-2xl text-error'><TbX /></span>
  )
}

const MaterialSufficiencyLine = ({ material, isDraft }: { material: BprBomItemInventory, isDraft: boolean }) => {

  const { showDialog } = useDialog()
  const { setSelectedBomItem } = useBprDetailsActions()

  const isConsumable = material.bom.item.inventoryTypeId === inventoryTypes.notTracked;
  const available = isConsumable ? 'Not Tracked' : toFracitonalDigits.weight(material.totalQuantityAvailable);
  const softAvailability = isConsumable ? 'Not Tracked' : toFracitonalDigits.weight(material.totalQuantitySoftAvailability);

  const isAvailableSufficient = material.totalQuantityAvailable >= material.quantity;
  const isSoftSufficient = isConsumable || material.totalQuantitySoftAvailability >= material.quantity;
  const bgClasses: keyof typeof classes.bg = (!isAvailableSufficient && !isConsumable)
    ? 'insufficient'
    : !isSoftSufficient
      ? 'warning'
      : 'sufficient'
  const hasStagings = material.BprStaging.length !== 0
  const stagings = hasStagings ? material.BprStaging[0] : null
  const primaryVerification = stagings ? stagings.BprStagingVerification[0] : null;
  const secondaryVerification = stagings ? stagings.BprStagingVerification[1] : null;

  const handleClick = () => {
    setSelectedBomItem(material)
    showDialog(`allocation${material.id}`)
  }

  return (
    <tr className={`${classes.bg[bgClasses]} hover:bg-base-200 hover:cursor-pointer`} onClick={() => handleClick()}>
      <th>{material.bom.identifier}</th>
      <td>{material.bom.item.name}</td>

      <td>{toFracitonalDigits.weight(material.quantity)}</td>

      <td>{isConsumable ? 'Not Tracked' : available}</td>
      <td>{toFracitonalDigits.weight(material.totalQuantitySoftAllocated)}</td>
      <td>{softAvailability}</td>
      <td>
        {!isAvailableSufficient && !isConsumable
          ? <LuX className="text-error w-6 h-6" />
          : !isSoftSufficient
            ? <LuTriangleAlert className="text-warning w-6 h-6" />
            : <LuCheck className="text-success w-6 h-6" />
        }
      </td>
      {!isDraft && (stagings?.pulledByUser ? <td><UserIcon image={stagings.pulledByUser.image || ''} name={stagings.pulledByUser.name || ''} /></td> : <td><RedX /></td>)}
      {!isDraft && (primaryVerification ? <td><UserIcon image={primaryVerification.user.image || ''} name={primaryVerification.user.name || ''} /></td> : <td><RedX /></td>)}
      {!isDraft && (secondaryVerification ? <td><UserIcon image={secondaryVerification.user.image || ''} name={secondaryVerification.user.name || ''} /></td> : <td><RedX /></td>)}
    </tr>
  )
}

export default MaterialSufficiencyLine
