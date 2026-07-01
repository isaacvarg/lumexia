import { DateTime } from "luxon"

export type SpanDisplay = 'chips' | 'compact' | 'timeline'

export const SPAN_DISPLAY_CONFIG_NAME = 'compoundingSpanDisplay'
export const DEFAULT_SPAN_DISPLAY: SpanDisplay = 'chips'

export const isSpanDisplay = (value: string | undefined | null): value is SpanDisplay =>
  value === 'chips' || value === 'compact' || value === 'timeline'

type ScheduledBpr = {
  scheduledForStart: Date | null
  scheduledForEnd: Date | null
}

export type WeekDay = {
  day: string
  bg: string
  date: string
}

// Whether a BPR's scheduled window covers the given day (start <= day <= end;
// open-ended BPRs cover every day from their start onward).
export const coversDate = (bpr: ScheduledBpr, dateISO: string): boolean => {
  if (!bpr.scheduledForStart) return false
  const date = DateTime.fromISO(dateISO).startOf('day')
  const start = DateTime.fromJSDate(bpr.scheduledForStart).startOf('day')
  if (date < start) return false
  if (bpr.scheduledForEnd) {
    const end = DateTime.fromJSDate(bpr.scheduledForEnd).startOf('day')
    if (date > end) return false
  }
  return true
}

// Whether the given day is the BPR's scheduled start day.
export const isStartDate = (bpr: ScheduledBpr, dateISO: string): boolean => {
  if (!bpr.scheduledForStart) return false
  const date = DateTime.fromISO(dateISO).startOf('day')
  const start = DateTime.fromJSDate(bpr.scheduledForStart).startOf('day')
  return date.equals(start)
}

// The first/last day-column indices (within the given week) that a BPR covers,
// clamped to the week. Returns null when the BPR falls outside this week entirely.
export const getSpanRange = (
  bpr: ScheduledBpr,
  days: WeekDay[],
): { startIdx: number; endIdx: number } | null => {
  const indices = days
    .map((d, i) => (coversDate(bpr, d.date) ? i : -1))
    .filter(i => i >= 0)
  if (indices.length === 0) return null
  return { startIdx: indices[0], endIdx: indices[indices.length - 1] }
}
