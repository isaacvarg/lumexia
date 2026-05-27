import { createColumnHelper } from "@tanstack/react-table";
import { DateTime } from "luxon";
import { dateFormatString } from "@/configs/data/dateFormatString";
import { QcMeasurementRow } from "../../_actions/quality/getMeasurements";

const columnHelper = createColumnHelper<QcMeasurementRow>();

export const measurementsColumns = [
  columnHelper.accessor('qcRecord.examinedLot.lotNumber', {
    id: 'lotNumber',
    header: 'Lot',
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  }),
  columnHelper.accessor('qcRecord.examinationType.name', {
    id: 'examinationType',
    header: 'Examination',
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  }),
  columnHelper.accessor('qcItemParameter.parameter.name', {
    id: 'parameter',
    header: 'Parameter',
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  }),
  columnHelper.accessor('runNumber', {
    id: 'runNumber',
    header: 'Run',
  }),
  columnHelper.accessor('value', {
    id: 'value',
    header: 'Value',
    cell: (row) => {
      const { value } = row.row.original;
      const uom = row.row.original.qcItemParameter.parameter.uom;
      return uom ? `${value} ${uom}` : value;
    },
  }),
  columnHelper.display({
    id: 'inputs',
    header: 'Inputs',
    cell: (row) => {
      const inputs = row.row.original.parameterInputResults;
      if (!inputs.length) return <span className="text-base-content/50">—</span>;
      return (
        <div className="flex flex-col gap-y-0.5">
          {inputs.map((input) => (
            <div key={input.id} className="text-sm">
              <span className="text-base-content/70">{input.parameterInputDefinition.label}:</span>{' '}
              <span>
                {input.value}
                {input.parameterInputDefinition.unit ? ` ${input.parameterInputDefinition.unit}` : ''}
              </span>
            </div>
          ))}
        </div>
      );
    },
  }),
  columnHelper.accessor('qcRecord.conductedBy.name', {
    id: 'conductedBy',
    header: 'Conducted by',
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  }),
  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    header: 'Date',
    cell: (row) => DateTime.fromJSDate(row.row.original.createdAt).toFormat(dateFormatString),
  }),
];
