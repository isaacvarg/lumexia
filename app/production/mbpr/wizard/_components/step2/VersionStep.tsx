"use client"

import { useMbprWizardActions, useMbprWizardSelection } from "@/store/mbprWizardSlice"
import { useEffect, useState } from "react"
import VersionCard from "./VersionCard"
import SectionTitle from "@/components/Text/SectionTitle"
import Text from '@/components/Text'
import { TbPlus } from "react-icons/tb"
import useDialog from "@/hooks/useDialog"
import MbprForm from "./MbprForm"

const VersionStep = () => {
  const { producesItem, step, isLoading, mbprs, selectedMbpr, isRevalidating } = useMbprWizardSelection()
  const [dialogMode, setDialogMode] = useState<"edit" | "create">('create');
  const { getMbprs } = useMbprWizardActions()
  const { showDialog } = useDialog()

  useEffect(() => {
    if (producesItem) {
      getMbprs(producesItem.id)
    }
  }, [producesItem, isRevalidating, getMbprs])

  if (!producesItem) return null

  if (step !== 1) return false


  return (
    <div className="flex flex-col gap-y-6">

      <MbprForm mode={dialogMode} mbpr={selectedMbpr} />

      <div className='text-center'>
        <SectionTitle >MBPR Versions</SectionTitle>

        <Text.Normal>A version is a set of instructions, materials, batch sizes, and other parameters.There can only be one active MBPR for an item at a time.</Text.Normal>
        <Text.Normal>Select which version you wish to modify or create a new version.</Text.Normal>



      </div>


      {isLoading && <div className="skeleton h-32 w-32"></div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <div onClick={() => { showDialog('mbprForm'); setDialogMode('create') }} className="card bg-base-200 shadow-sm hover:shadow-md hover:cursor-pointer transition-shadow border-2 border-dashed border-base-300">
          <div className="card-body items-center justify-center flex-row gap-x-4">
            <TbPlus className="text-3xl" />
            <h2 className="card-title font-poppins">Add New</h2>
          </div>
        </div>

        {mbprs.length !== 0 && (
          mbprs.map((mbpr) => <VersionCard key={mbpr.id} mbpr={mbpr} setDialogMode={setDialogMode} />)
        )}
      </div>

    </div>
  )
}

export default VersionStep
