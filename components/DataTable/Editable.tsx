import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FooterCell } from "./FooterCell";
import { PoFlattenedOrderItems } from "@/app/purchasing/purchase-orders/[purchaseOrder]/_functions/flattenOrderItems";

type EditableProps = {
  data: any;
  columns: any;
  onRowClick: (row: any) => void;
  onRowUpdate: (row: any) => void;
  onRowDelete: (row: any) => void;
  onRowAdd: () => void;
};

const Editable = ({
  data,
  columns,
  onRowClick,
  onRowUpdate,
  onRowDelete,
  onRowAdd,
}: EditableProps) => {
  const [editedRows, setEditedRows] = useState<any>({});
  const [tableData, setTableData] = useState<any[]>([...data]);
  const [originalData, setOriginalData] = useState<any[]>([...data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex: number, columnId: string, value: any) => {
        setTableData((old) =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex],
                [columnId]: value,
              };
            }
            return row;
          })
        );
      },
      editedRows,
      setEditedRows,
      revertData: (rowIndex: number, revert: boolean) => {
        if (revert) {
          setTableData((old) =>
            old.map((row, index) =>
              index === rowIndex ? originalData[rowIndex] : row
            )
          );
        } else {
          onRowUpdate(tableData[rowIndex]);
        }
      },
      addRow: () => {

       onRowAdd();

      },
      removeRow: (rowIndex: number) => {
        const setter = (old: PoFlattenedOrderItems) =>
          old.filter((_row: any, index: number) => index !== rowIndex);
        setTableData(setter);
        setOriginalData(setter);

        onRowDelete(tableData[rowIndex]);
      },
    },
  });
  return (
    <div className="flex flex-col gap-y-6">
      <div className="w-full overflow-x-auto">
        <table className="min-w-full text-left text-base md:text-lg font-light">
          <thead className="border-b font-medium dark:border-neutral-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                onClick={() => {editedRows[row.id] ? null : onRowClick(row) }}
                key={row.id}
                className="border-b dark:border-neutral-500"
              >
                {row.getVisibleCells().map((cell) => (
                  <td className="py-4" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>
                <FooterCell table={table} />
              </th>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default Editable;
