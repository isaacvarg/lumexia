'use client'
import { usePurchasingRequestSelection } from "@/store/purchasingRequestSlice"
import RequestsCalendar from "../RequestsCalendar"

const CalendarTab = () => {
  const { requests } = usePurchasingRequestSelection()

  return (
    <div className="min-h-[calc(100vh-14rem)]">
      <RequestsCalendar requests={requests} />
    </div>
  )
}

export default CalendarTab
