import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Radio, RefreshCw, Users, Ticket, Banknote, Link as LinkIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { agencyApi } from '@/api/agency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { LiveBetsMember, LiveBet } from '@/types/manager'

const REFETCH_INTERVAL_MS = 10_000

function gameTypeLabel(gameType: string | null | undefined): string {
  if (gameType === 'taixiu') return 'Tài Xỉu'
  if (gameType === 'chicken_fight') return 'Đá Gà'
  return gameType ?? '—'
}

function renderBetTypeCell(bet: LiveBet) {
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
  const label = map[raw] ?? bet.bet_type.toUpperCase()
  return <span className="font-medium">{label}</span>
}

function formatSessionId(sessionId: number): string {
  return `#${String(sessionId).padStart(6, '0')}`
}

function MemberBetsCard({ member }: { member: LiveBetsMember }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">
              <Link
                to={`/users/${member.id}`}
                className="hover:underline flex items-center gap-1"
              >
                {member.username}
                <LinkIcon className="h-3 w-3 text-muted-foreground" />
              </Link>
            </CardTitle>
            <Badge variant="secondary">{member.pending_bet_count} vé</Badge>
          </div>
          <span className="text-sm font-medium text-amber-600">
            {formatCurrency(member.total_pending_amount)} đang treo
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phiên</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Game</TableHead>
                <TableHead>Loại cược</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Tiềm năng</TableHead>
                <TableHead>Đặt lúc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {member.bets.map((bet: LiveBet) => (
                <TableRow key={bet.id}>
                  <TableCell className="font-mono text-xs">{formatSessionId(bet.session_id)}</TableCell>
                  <TableCell>{bet.room_name ?? '—'}</TableCell>
                  <TableCell>{gameTypeLabel(bet.game_type)}</TableCell>
                  <TableCell>{renderBetTypeCell(bet)}</TableCell>
                  <TableCell>{formatCurrency(bet.amount)}</TableCell>
                  <TableCell>{bet.potential_win != null ? formatCurrency(bet.potential_win) : '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDate(bet.placed_at ?? '')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export const LiveBets = () => {
  const { data, isLoading, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['live-bets'],
    queryFn: async () => {
      const res = await agencyApi.getLiveBets()
      return res.data
    },
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  })

  const members = data?.members_with_pending ?? []
  const summary = data?.summary

  const lastUpdated = dataUpdatedAt
    ? format(new Date(dataUpdatedAt), 'HH:mm:ss')
    : null

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Đang Cược (Live)</h1>
            <Radio
              className={`h-5 w-5 mt-1 ${members.length > 0 ? 'text-green-500 animate-pulse' : 'text-muted-foreground'}`}
            />
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Tự động cập nhật mỗi 10 giây
            {lastUpdated && ` · cập nhật lúc ${lastUpdated}`}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member đang cược</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_members_with_pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng vé đang chạy</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_pending_bets}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng tiền đang treo</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                {formatCurrency(summary.total_pending_amount)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">Hiện không có downline nào đang cược</p>
            <p className="text-sm text-muted-foreground mt-1">Trang sẽ tự cập nhật sau 10 giây</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <MemberBetsCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </div>
  )
}
