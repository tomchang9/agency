import { Badge } from '@/components/ui/badge'

const LABELS: Record<string, string> = {
  waiting: 'Chờ',
  betting: 'Đang cược',
  processing: 'Đang xử lý',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  rollback: 'Huỷ phiên',
}

function variantForStatus(
  status: string
): 'default' | 'secondary' | 'success' | 'destructive' | 'warning' {
  if (status === 'completed') return 'success'
  if (status === 'cancelled' || status === 'rollback') return 'destructive'
  if (status === 'betting' || status === 'processing') return 'warning'
  return 'secondary'
}

/** Badge styling aligned with Giao Dịch (completed → success, pending-like → secondary, etc.). */
export function GameSessionStatusBadge({ status }: { status: string }) {
  const st = status ?? ''
  return (
    <Badge variant={variantForStatus(st)} className="w-fit shrink-0 self-start whitespace-nowrap">
      {LABELS[st] ?? st}
    </Badge>
  )
}
