import { format } from 'date-fns'

export const MAX_STATS_RANGE_DAYS = 31

export function ymdToday(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Ensure from <= to and span <= maxDays (inclusive). */
export function clampDateRange(
  from: string,
  to: string,
  maxDays: number = MAX_STATS_RANGE_DAYS
): { from: string; to: string } {
  let a = from
  let b = to
  if (!a && !b) {
    const t = ymdToday()
    return { from: t, to: t }
  }
  if (!a) a = b
  if (!b) b = a

  const t1 = new Date(a + 'T12:00:00')
  const t2 = new Date(b + 'T12:00:00')
  if (Number.isNaN(t1.getTime()) || Number.isNaN(t2.getTime())) {
    const t = ymdToday()
    return { from: t, to: t }
  }
  if (t1 > t2) {
    ;[a, b] = [b, a]
  }
  const start = new Date(a + 'T12:00:00')
  const end = new Date(b + 'T12:00:00')
  const maxMs = (maxDays - 1) * 86400000
  if (end.getTime() - start.getTime() > maxMs) {
    const capped = new Date(start.getTime() + maxMs)
    b = format(capped, 'yyyy-MM-dd')
  }
  return { from: a, to: b }
}
