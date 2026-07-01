'use client'
import { Equipment } from '@/actions/facility/equipment/getAllEquipment';
import Card from '@/components/Card';
import DataTable from '@/components/DataTable';
import { Filter } from '@/types/filter';
import { toFacetFilter } from '@/utils/data/toFacetFilter';
import React, { useState } from 'react'
import { EquipmentTableColumns } from './EquipmentTableColumns';
import useDialog from '@/hooks/useDialog';
import { EquipmentType } from '@/actions/facility/equipmentType/getAllEquipmentTypes';
import NewEquipmentForm from './NewEquipmentForm';


const EquipmentTable = ({ equipment, equipmentTypes }: { equipment: Equipment[], equipmentTypes: EquipmentType[] }) => {

  const { showDialog } = useDialog()
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment>();
  const filters: Filter[] = [
    {
      columnName: "equipmentType.id",
      filterLabel: "Type",
      options: toFacetFilter(equipment, "equipmentType.id", "equipmentType.name"),
    },
  ];



  return (
    <Card.Root>
      <NewEquipmentForm equipmentTypes={equipmentTypes} selectedEquipment={selectedEquipment} />
      <div className='flex justify-between items-center'>
        <Card.Title>Equipment</Card.Title>

        <button className='btn btn-neutral' onClick={() => showDialog('addEquipment')}>Add Equipment</button>
      </div>
      <DataTable.Default
        tableStateName='equipment'
        columns={EquipmentTableColumns}
        data={equipment}
        filters={filters}
        onRowClick={(row) => {
          setSelectedEquipment(row.original)
          showDialog('addEquipment')
        }}

      />
    </Card.Root>

  )
}

export default EquipmentTable
