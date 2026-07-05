import React, { useEffect, useState } from 'react'
import ActionButton from '@/components/ActionButton'
import useDialog from '@/hooks/useDialog'
import { TbPlus } from 'react-icons/tb'
import AddItemDialog from './AddItemDialog'
import { getItems } from '../../../_functions/getItems'
import { ItemDataForSearch } from '../../ItemSearch'
import { getBomMaterials } from '../../../_functions/getBomMaterials'
import useProductionWizard from '@/hooks/useProductionWizard'
import MaterialCard, { ExBillOfMaterials } from './MaterialCard'
import Layout from '@/components/Layout'
import Text from '@/components/Text'

const MaterialsPanel = () => {

  const [materials, setMaterials] = useState<ItemDataForSearch[]>([])
  const [stepBomMaterials, setStepBomMaterials] = useState<ExBillOfMaterials[]>([])
  const { showDialog } = useDialog();
  const { selectedBatchStep, revalidateTrigger } = useProductionWizard()



  useEffect(() => {

    const getData = async () => {
      const data = await getItems()
      setMaterials(data)
    }

    getData();

  }, [])

  useEffect(() => {

    const getData = async () => {

      if (!selectedBatchStep) {
        throw new Error('Batch step not selected');
      }

      const data = await getBomMaterials(selectedBatchStep.id)
      setStepBomMaterials(data);
    }

    getData();

  }, [selectedBatchStep, revalidateTrigger])

  return (
    <div className='p-4 bg-cararra-50 rounded-lg h-full flex flex-col gap-y-4'>
      <AddItemDialog items={materials} />

      <Layout.Row>
        <Text.SectionTitle size='small'>Materials</Text.SectionTitle>
        <ActionButton onClick={() => showDialog('AddBomItemDialog')}><TbPlus /></ActionButton>
      </Layout.Row>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
        {stepBomMaterials.map((material: ExBillOfMaterials) => {
          return <MaterialCard key={material.id} material={material} />
        })}
      </div>
    </div>
  )
}

export default MaterialsPanel
