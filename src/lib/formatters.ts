import { parseISO } from 'date-fns'

const HCM_TZ = 'Asia/Ho_Chi_Minh'

const toSafeNumber = (value: number | string | null | undefined): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }
  if (typeof value === 'string') {
    const normalized = value.trim().replace(/,/g, '')
    if (normalized === '') return 0
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export function formatCurrency(amount: number | string | null | undefined): string {
  const n = toSafeNumber(amount)
  const formatted = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n)
  return `${formatted} credit`
}

/** Parse API datetime: ISO (incl. +07:00 / Z) or legacy naive UTC `Y-m-d H:i:s`. */
function parseApiDate(value: string): Date | null {
  const s = value.trim()
  if (!s) return null
  let d = parseISO(s)
  if (!Number.isNaN(d.getTime())) return d
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) {
    d = parseISO(s.replace(' ', 'T') + 'Z')
    if (!Number.isNaN(d.getTime())) return d
  }
  return null
}

function formatInHcm(d: Date, withTime: boolean): string {
  const ymd = new Intl.DateTimeFormat('sv-SE', {
    timeZone: HCM_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
  const [y, m, day] = ymd.split('-')
  if (!withTime) {
    return `${day}/${m}/${y}`
  }
  const hm = new Intl.DateTimeFormat('sv-SE', {
    timeZone: HCM_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
  const [hh, mm] = hm.split(':')
  return `${day}/${m}/${y} ${hh}:${mm}`
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseApiDate(date) : date
  if (!d || Number.isNaN(d.getTime())) return '-'
  return formatInHcm(d, true)
}

export function formatDateOnly(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? parseApiDate(date) : date
  if (!d || Number.isNaN(d.getTime())) return '-'
  return formatInHcm(d, false)
}

export function formatNumber(num: number | string | null | undefined): string {
  return new Intl.NumberFormat('vi-VN').format(toSafeNumber(num))
}

export function formatSignedProfit(value: number | string | null | undefined): {
  text: string
  className: string
} {
  const n = toSafeNumber(value)
  const formatted = formatCurrency(Math.abs(n))
  if (n > 0) {
    return { text: `+${formatted}`, className: 'text-emerald-600' }
  }
  if (n < 0) {
    return { text: `-${formatted}`, className: 'text-destructive' }
  }
  return { text: formatted, className: '' }
}
