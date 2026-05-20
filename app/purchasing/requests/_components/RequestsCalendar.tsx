import { RequestForDashboard } from '../_functions/getRequests'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import { DateTime } from 'luxon'
import multiMonthPlugin from '@fullcalendar/multimonth'


const RequestsCalendar = ({ requests }: { requests: RequestForDashboard[] }) => {

    const resolveDates = (request: RequestForDashboard) => {
        if (request.expectedDateStart && request.expectedDateEnd) {
            return { start: request.expectedDateStart, end: request.expectedDateEnd }
        }
        const detail = request.pos[0]?.po.purchaseOrderItems[0]?.details[0]
        if (detail?.expectedDateStart && detail?.expectedDateEnd) {
            return { start: detail.expectedDateStart, end: detail.expectedDateEnd }
        }
        return null
    }

    const events = requests
        .map((request) => {
            const dates = resolveDates(request)
            if (!dates) return null
            return {
                title: request.title,
                start: DateTime.fromJSDate(dates.start).toISO(),
                end: DateTime.fromJSDate(dates.end).toISO(),
                url: `/purchasing/requests/${request.referenceCode}?id=${request.id}`,
                extendedProps: { request },
            }
        })
        .filter(Boolean)

    return (
        <div className="requests-calendar">
            <style>{`
                .requests-calendar .fc-daygrid-day-frame { min-height: 7rem; }
                .requests-calendar .fc-event { background: transparent; border: none; padding: 0; }
                .requests-calendar .fc-daygrid-event-harness { margin-top: 2px; }
                .requests-calendar .fc-scrollgrid,
                .requests-calendar .fc-scrollgrid > * > tr > * { border: 0; }
                .requests-calendar .fc .fc-multimonth { border: 0; }
                .requests-calendar .fc .fc-multimonth-month { border: 0; }
            `}</style>
            <FullCalendar
                plugins={[dayGridPlugin, multiMonthPlugin]}
                events={events as any}
                initialView='month'
                height="auto"
                dayMaxEvents={false}
                eventContent={(arg) => {
                    const r = arg.event.extendedProps.request as RequestForDashboard
                    return (
                        <div className='flex flex-col gap-1 rounded-md bg-base-300/60 border border-base-300 p-1 overflow-hidden hover:bg-base-300/80 hover:cursor-pointer'>
                            <div className='text-[10px] font-semibold truncate text-base-content'>{r.item.name}</div>
                            <div className='flex flex-wrap gap-1'>
                                <span className='rounded bg-primary text-primary-content px-1 text-[10px] font-semibold font-poppins'>
                                    {r.referenceCode}
                                </span>
                                <span
                                    style={{ background: r.status.bgColor, color: r.status.textColor }}
                                    className='rounded px-1 text-[10px]'
                                >
                                    {r.status.name}
                                </span>
                            </div>
                        </div>
                    )
                }}
                views={{
                    "multiMonth": {
                        type: 'multiMonth',
                        duration: { months: 6 }
                    },
                    "month": {
                        defaultAllDay: true,
                        displayEventTime: false,
                        type: 'dayGridMonth',
                    }
                }}
                headerToolbar={{
                    right: 'prev,next today',
                    center: 'title',
                    left: 'month,multiMonth'
                }}
                buttonText={{
                    month: 'Month',
                    multiMonth: 'Multi Month'
                }}

            />
        </div>
    )
}

export default RequestsCalendar
