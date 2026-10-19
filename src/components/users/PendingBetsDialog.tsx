import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { RefreshCw } from 'lucide-react'
import { agencyApi } from '@/api/agency'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { UserBet } from '@/types/user'

const REFETCH_INTERVAL_MS = 10_000

interface PendingBetsDialogProps {
  userId: number
  username: string
  pendingCount: number
}

function formatSessionId(sessionId: number | string | null | undefined): string {
  if (sessionId === undefined || sessionId === null) return '—'
  const num = typeof sessionId === 'string' ? parseInt(sessionId, 10) : sessionId
  if (Number.isNaN(num)) return '—'
  return `#${String(num).padStart(6, '0')}`
}

function renderBetType(bet: UserBet) {
  const gt = bet.game_type
  const raw = (bet.bet_type ?? '').toLowerCase().replace(/\s+/g, '_')
  if (gt === 'chicken_fight') {
    if (raw === 'a_win' || raw === 'meron') {
      return <span className="font-medium text-emerald-600">Meron</span>
    }
    if (raw === 'b_win' || raw === 'wala') {
      return <span className="font-medium text-red-600">Wala</span>
    }
  }
  const map: Record<string, string> = {
    tai: 'Tài', xiu: 'Xỉu',
    meron: 'Meron', wala: 'Wala',
  }
  const label = map[raw] ?? (bet.bet_type ?? '').toUpperCase()
  return <span className="font-medium">{label}</span>
}

function PendingBetsContent({ userId, username }: { userId: number; username: string }) {
  const [gameType, setGameType] = useState<string>('all')

  const { data, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ['pending-bets-dialog', userId, gameType],
    queryFn: () =>
      agencyApi.getMemberBets(userId, {
        status: 'pending',
        per_page: 100,
        ...(gameType !== 'all' ? { game_type: gameType } : {}),
      }),
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  })

  const bets: UserBet[] = data?.data ?? []
  const lastUpdated = dataUpdatedAt ? format(new Date(dataUpdatedAt), 'HH:mm:ss') : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select value={gameType} onValueChange={setGameType}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tất cả game" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả game</SelectItem>
            <SelectItem value="taixiu">Tài Xỉu</SelectItem>
            <SelectItem value="chicken_fight">Đá Gà</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
          {lastUpdated ? `Cập nhật lúc ${lastUpdated}` : 'Đang tải...'}
        </div>
      </div>

      {bets.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {isFetching ? 'Đang tải...' : `${username} hiện không có vé nào đang chạy`}
        </p>
      ) : (
        <div className="rounded-md border max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phiên</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Loại cược</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Tiềm năng</TableHead>
                <TableHead>Đặt lúc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bets.map((bet) => (
                <TableRow key={bet.id}>
                  <TableCell className="font-mono text-xs">{formatSessionId(bet.session_id)}</TableCell>
                  <TableCell>{bet.room_name ?? '—'}</TableCell>
                  <TableCell>{renderBetType(bet)}</TableCell>
                  <TableCell>{formatCurrency(bet.amount)}</TableCell>
                  <TableCell>{bet.potential_win != null ? formatCurrency(bet.potential_win) : '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(bet.placed_at ?? '')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export function PendingBetsDialog({ userId, username, pendingCount }: PendingBetsDialogProps) {
  const [open, setOpen] = useState(false)

  if (pendingCount === 0) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Badge
          variant="secondary"
          className="cursor-pointer bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300 transition-colors"
        >
          {pendingCount} đang cược
        </Badge>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Vé đang cược — {username}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {pendingCount} vé đang chờ kết quả
            </span>
          </DialogTitle>
        </DialogHeader>
        {open && <PendingBetsContent userId={userId} username={username} />}
      </DialogContent>
    </Dialog>
  )
}
