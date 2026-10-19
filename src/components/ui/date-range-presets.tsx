import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { clampDateRange, ymdToday } from '@/lib/dateRange'

export interface DateRangePresetsProps {
  onRangeChange: (from: string, to: string) => void
  /** Giới hạn độ dài khoảng (ví dụ 31 ngày cho thống kê / giao dịch). Bỏ qua nếu không truyền. */
  maxSpanDays?: number
  className?: string
  size?: 'default' | 'sm'
}

export function DateRangePresets({
  onRangeChange,
  maxSpanDays,
  className,
  size = 'sm',
}: DateRangePresetsProps) {
  const apply = (from: string, to: string) => {
    if (maxSpanDays !== undefined) {
      const c = clampDateRange(from, to, maxSpanDays)
      onRangeChange(c.from, c.to)
      return
    }
    const t1 = new Date(from + 'T12:00:00')
    const t2 = new Date(to + 'T12:00:00')
    if (Number.isNaN(t1.getTime()) || Number.isNaN(t2.getTime())) {
      const t = ymdToday()
      onRangeChange(t, t)
      return
    }
    if (from <= to) onRangeChange(from, to)
    else onRangeChange(to, from)
  }

  const today = ymdToday()

  const thisWeek = () => {
    const now = new Date()
    apply(
      format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd')
    )
  }

  const thisMonth = () => {
    const now = new Date()
    apply(
      format(startOfMonth(now), 'yyyy-MM-dd'),
      format(endOfMonth(now), 'yyyy-MM-dd')
    )
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-xs text-muted-foreground mr-1">Nhanh:</span>
      <Button type="button" variant="secondary" size={size} onClick={() => apply(today, today)}>
        Hôm nay
      </Button>
      <Button type="button" variant="secondary" size={size} onClick={thisWeek}>
        Tuần này
      </Button>
      <Button type="button" variant="secondary" size={size} onClick={thisMonth}>
        Tháng này
      </Button>
    </div>
  )
}
