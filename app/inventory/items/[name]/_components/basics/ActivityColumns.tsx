import { createColumnHelper } from "@tanstack/react-table";
import { ItemActivity } from "../../_actions/basics/getActivity";
import UserIcon from "@/components/UI/UserIcon";
import { DateTime } from "luxon";
import { dateFormatString } from "@/configs/data/dateFormatString";


const columnHelper = createColumnHelper<ItemActivity>();



export const activityColumns = [
  columnHelper.accessor('user.id', {
    id: 'user',
    header: 'User',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: (row) => {
      return (
        <div className="flex gap-x-2">
          <UserIcon kind={row.row.original.user.kind} image={row.row.original.user.image || ''} name={row.row.original.user.name || ''} />
          <p className="">{row.row.original.user.name}</p>

        </div>
      )
    }
  }),
  columnHelper.accessor('action', {
    id: 'action',
    header: 'Action',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),
  columnHelper.accessor('createdAt', {
    header: 'Timestamp',
    cell: (row) => DateTime.fromJSDate(row.row.original.createdAt).toFormat(dateFormatString),
  }),
  columnHelper.accessor('details', {
    header: 'Details',
    cell: (row) => {
      const details = row.row.original.details as any

      return details.context
    }
  })

]
