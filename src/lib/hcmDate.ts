/** Calendar dates (Y-m-d) in Asia/Ho_Chi_Minh — align with backend agency game APIs. */

const HCM = 'Asia/Ho_Chi_Minh'

export function hcmTodayYmd(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: HCM,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function hcmYmdFromDate(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: HCM,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

/** Noon HCM as UTC instant (VN has no DST). */
function noonUtcForYmdHcm(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return new Date(NaN)
  return new Date(Date.UTC(y, m - 1, d, 5, 0, 0))
}

/** ISO weekday: Mon=1 … Sun=7 in HCM for instant `d`. */
function isoWeekdayHcm(d: Date): number {
  const short = new Intl.DateTimeFormat('en-US', {
    timeZone: HCM,
    weekday: 'short',
  }).format(d)
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  }
  return map[short] ?? 1
}

export function hcmWeekRangeYmd(): { from: string; to: string } {
  const today = hcmTodayYmd()
  let cur = noonUtcForYmdHcm(today)
  if (Number.isNaN(cur.getTime())) return { from: today, to: today }
  let dow = isoWeekdayHcm(cur)
  while (dow !== 1) {
    cur.setUTCDate(cur.getUTCDate() - 1)
    dow = isoWeekdayHcm(cur)
  }
  const from = hcmYmdFromDate(cur)
  const sun = new Date(cur)
  sun.setUTCDate(sun.getUTCDate() + 6)
  return { from, to: hcmYmdFromDate(sun) }
}

export function hcmMonthRangeYmd(): { from: string; to: string } {
  const today = hcmTodayYmd()
  const [ys, ms] = today.split('-')
  const y = Number(ys)
  const m = Number(ms)
  if (!y || !m) return { from: today, to: today }
  const from = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-01`
  const last = new Date(Date.UTC(y, m, 0))
  const lastDay = String(last.getUTCDate()).padStart(2, '0')
  const to = `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${lastDay}`
  return { from, to }
}

export function diffDaysInclusiveYmd(from: string, to: string): number {
  const a = noonUtcForYmdHcm(from)
  const b = noonUtcForYmdHcm(to)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0
  return Math.floor((b.getTime() - a.getTime()) / 86400000) + 1
}

export const MAX_SESSION_FILTER_DAYS = 31

export function assertMaxRangeYmd(
  from: string,
  to: string,
  maxDays: number = MAX_SESSION_FILTER_DAYS
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return 'Ngày không hợp lệ'
  }
  if (from > to) return 'Từ ngày không được sau đến ngày'
  if (diffDaysInclusiveYmd(from, to) > maxDays) {
    return `Khoảng lọc tối đa ${maxDays} ngày`
  }
  return null
}
