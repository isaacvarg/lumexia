'use client'

import Card from "@/components/Card";
import DataTable from "@/components/DataTable";
import { useItemSelection } from "@/store/itemSlice";
import { Filter } from "@/types/filter";
import { toFacetFilter } from "@/utils/data/toFacetFilter";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { QcMeasurementRow } from "../../_actions/quality/getMeasurements";
import { measurementsColumns } from "./MeasurementsColumns";
import MeasurementsByParameter from "./MeasurementsByParameter";

type ViewMode = 'all' | 'byParameter';

const Measurements = () => {
  const { qcMeasurements } = useItemSelection();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  const filters: Filter[] = [
    {
      columnName: 'lotNumber',
      filterLabel: 'Lot',
      options: toFacetFilter(qcMeasurements, 'qcRecord.examinedLot.lotNumber', 'qcRecord.examinedLot.lotNumber'),
    },
    {
      columnName: 'examinationType',
      filterLabel: 'Examination',
      options: toFacetFilter(qcMeasurements, 'qcRecord.examinationType.name', 'qcRecord.examinationType.name'),
    },
    {
      columnName: 'parameter',
      filterLabel: 'Parameter',
      options: toFacetFilter(qcMeasurements, 'qcItemParameter.parameter.name', 'qcItemParameter.parameter.name'),
    },
    {
      columnName: 'conductedBy',
      filterLabel: 'Conducted by',
      options: toFacetFilter(qcMeasurements, 'qcRecord.conductedBy.id', 'qcRecord.conductedBy.name'),
    },
  ];

  const handleRowClick = (row: { original: QcMeasurementRow }) => {
    router.push(`/quality/qc/examination/${row.original.qcRecord.id}`);
  };

  return (
    <Card.Root span={2}>
      <div className="flex items-center justify-between">
        <Card.Title>Measurements</Card.Title>
        <div className="flex gap-2">
          <button
            className={`btn btn-secondary ${viewMode === 'all' ? '' : 'btn-outline'}`}
            onClick={() => setViewMode('all')}
          >
            All results
          </button>
          <button
            className={`btn btn-secondary ${viewMode === 'byParameter' ? '' : 'btn-outline'}`}
            onClick={() => setViewMode('byParameter')}
          >
            By parameter
          </button>
        </div>
      </div>

      {viewMode === 'all' && (
        <DataTable.Default
          data={qcMeasurements}
          columns={measurementsColumns}
          filters={filters}
          onRowClick={handleRowClick}
          tableStateName="itemMeasurements"
          searchBg="elevated"
        />
      )}

      {viewMode === 'byParameter' && <MeasurementsByParameter onRowClick={handleRowClick} />}
    </Card.Root>
  );
};

export default Measurements;
