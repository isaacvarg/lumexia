'use client'

import DataTable from "@/components/DataTable";
import { dateFormatString } from "@/configs/data/dateFormatString";
import { useItemSelection } from "@/store/itemSlice";
import { Filter } from "@/types/filter";
import { FacetOptions } from "@/types/facetOption";
import { createColumnHelper } from "@tanstack/react-table";
import { DateTime } from "luxon";
import { useMemo, useState } from "react";
import { QcMeasurementRow } from "../../_actions/quality/getMeasurements";

type Props = {
  onRowClick: (row: { original: QcMeasurementRow }) => void;
};

const MeasurementsByParameter = ({ onRowClick }: Props) => {
  const { qcMeasurements } = useItemSelection();
  const [selectedId, setSelectedId] = useState<string>('');

  const parameterOptions = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; count: number }>();
    for (const row of qcMeasurements) {
      const id = row.qcItemParameter.id;
      const existing = seen.get(id);
      if (existing) {
        existing.count += 1;
      } else {
        seen.set(id, { id, name: row.qcItemParameter.parameter.name, count: 1 });
      }
    }
    return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [qcMeasurements]);

  const rows = useMemo(
    () => qcMeasurements.filter(m => m.qcItemParameterId === selectedId),
    [qcMeasurements, selectedId],
  );

  const selectedParameter = useMemo(
    () => qcMeasurements.find(m => m.qcItemParameterId === selectedId)?.qcItemParameter,
    [qcMeasurements, selectedId],
  );

  const inputDefinitions = selectedParameter?.parameter.inputDefinitions ?? [];

  const columns = useMemo(() => {
    const helper = createColumnHelper<QcMeasurementRow>();
    const uom = selectedParameter?.parameter.uom ?? '';

    const base = [
      helper.accessor('qcRecord.examinedLot.lotNumber', {
        id: 'lotNumber',
        header: 'Lot',
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      }),
      helper.accessor('runNumber', {
        id: 'runNumber',
        header: 'Run',
      }),
      helper.accessor('value', {
        id: 'value',
        header: 'Value',
        cell: (row) => uom ? `${row.row.original.value} ${uom}` : row.row.original.value,
      }),
    ];

    const inputCols = inputDefinitions.map((def) =>
      helper.accessor(
        (row) =>
          row.parameterInputResults.find(r => r.parameterInputDefinitionId === def.id)?.value ?? '',
        {
          id: `input_${def.id}`,
          header: def.unit ? `${def.label} (${def.unit})` : def.label,
          filterFn: (row, id, value) => value.includes(row.getValue(id)),
        },
      ),
    );

    const tail = [
      helper.accessor('qcRecord.conductedBy.name', {
        id: 'conductedBy',
        header: 'Conducted by',
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      }),
      helper.accessor('createdAt', {
        id: 'createdAt',
        header: 'Date',
        cell: (row) => DateTime.fromJSDate(row.row.original.createdAt).toFormat(dateFormatString),
      }),
    ];

    return [...base, ...inputCols, ...tail];
  }, [inputDefinitions, selectedParameter]);

  const filters: Filter[] = useMemo(() => {
    if (!selectedId) return [];

    const lotOptions: FacetOptions[] = Array.from(
      new Map(
        rows.map(r => [
          r.qcRecord.examinedLot.lotNumber,
          { value: r.qcRecord.examinedLot.lotNumber, label: r.qcRecord.examinedLot.lotNumber },
        ]),
      ).values(),
    );

    const inputFilters: Filter[] = inputDefinitions.map((def) => {
      const optionsMap = new Map<string, FacetOptions>();
      for (const row of rows) {
        const v = row.parameterInputResults.find(r => r.parameterInputDefinitionId === def.id)?.value;
        if (v != null && v !== '' && !optionsMap.has(v)) {
          optionsMap.set(v, { value: v, label: def.unit ? `${v} ${def.unit}` : v });
        }
      }
      return {
        columnName: `input_${def.id}`,
        filterLabel: def.label,
        options: Array.from(optionsMap.values()),
      };
    });

    return [
      { columnName: 'lotNumber', filterLabel: 'Lot', options: lotOptions },
      ...inputFilters,
    ];
  }, [rows, inputDefinitions, selectedId]);

  if (qcMeasurements.length === 0) {
    return (
      <div className="text-base-content/60 italic py-6">No measurements yet for this item.</div>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {parameterOptions.map((opt) => {
          const isActive = selectedId === opt.id;
          return (
            <button
              key={opt.id}
              className={`btn-lg btn ${isActive ? 'btn-secondary' : 'btn-soft'} flex w-full justify-between`}
              onClick={() => setSelectedId(isActive ? '' : opt.id)}
            >
              <span>{opt.name}</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-info text-xs font-semibold text-info-content">
                {opt.count}
              </div>
            </button>
          );
        })}
      </div>

      {!selectedId && (
        <div className="text-base-content/60 italic py-6">
          Select a parameter to view its results.
        </div>
      )}

      {selectedId && (
        <DataTable.Default
          data={rows}
          columns={columns}
          filters={filters}
          onRowClick={onRowClick}
          tableStateName="itemMeasurementsByParameter"
          searchBg="elevated"
        />
      )}
    </div>
  );
};

export default MeasurementsByParameter;
