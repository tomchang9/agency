import type { ComponentType, ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  Activity,
  ArrowLeft,
  Building2,
  CircleDot,
  Clock,
  Dices,
  Loader2,
  Trophy,
  Users,
} from 'lucide-react'
import { agencyApi } from '@/api/agency'
import { GameSessionStatusBadge } from '@/components/game-sessions/GameSessionStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate, formatNumber } from '@/lib/formatters'
import type { AgencyGameType, AgencySessionBet } from '@/types/gameSessions'

interface GameSessionDetailPageProps {
  game: AgencyGameType
  listPath: string
}

function txTypeLabel(raw: string): string {
  const r = raw.toLowerCase().replace(/\s+/g, '_')
  const map: Record<string, string> = {
    tai: 'Tài',
    xiu: 'Xỉu',
    chan: 'Chẵn',
    le: 'Lẻ',
    senco: 'SENCO',
    bao: 'Bão',
  }
  return map[r] ?? raw.toUpperCase()
}

function renderBetTypeCell(game: AgencyGameType, betType: string) {
  const raw = (betType ?? '').toLowerCase().replace(/\s+/g, '_')
  if (game === 'chicken_fight') {
    if (raw === 'a_win' || raw === 'meron') {
      return <span className="font-medium text-blue-600">Meron</span>
    }
    if (raw === 'b_win' || raw === 'wala') {
      return <span className="font-medium text-red-600">Wala</span>
    }
    if (raw === 'draw') {
      return <span className="font-medium text-amber-700">Hòa</span>
    }
  }
  if (game === 'taixiu') {
    const map: Record<string, string> = {
      tai: 'Tài',
      xiu: 'Xỉu',
      chan: 'Chẵn',
      le: 'Lẻ',
    }
    const label = map[raw] ?? betType.toUpperCase()
    return <span className="font-medium">{label}</span>
  }
  return <span className="uppercase">{betType}</span>
}

function refundOutcomeLabel(bet: AgencySessionBet): string {
  if (bet.settlement_kind_label_vi) return bet.settlement_kind_label_vi
  const k = bet.settlement_kind
  if (k === 'bao_tai') return 'Bão Tài'
  if (k === 'bao_xiu') return 'Bão Xỉu'
  if (k === 'session_rollback') return 'Huỷ game / rollback phiên'
  if (k === 'chicken_session_cancel') return 'Huỷ phiên (Đá gà)'
  if (k === 'admin_batch_refund') return 'Hoàn tiền (admin batch)'
  if (k === 'admin_manual_refund') return 'Hoàn tiền (admin chỉnh tay)'
  if (k === 'unknown') return 'Hoàn tiền (chưa xác định)'
  return 'Hoàn tiền'
}

function renderBetStatusBadge(bet: AgencySessionBet) {
  const status = bet.status
  const variants: Record<string, 'default' | 'success' | 'destructive' | 'secondary'> = {
    won: 'success',
    lost: 'destructive',
    pending: 'secondary',
    refunded: 'default',
    rollback: 'secondary',
  }
  const statusLabels: Record<string, string> = {
    won: 'Thắng',
    lost: 'Thua',
    pending: 'Chờ xử lý',
    refunded: 'Hoàn tiền',
    rollback: 'Huỷ game',
  }

  if (status === 'refunded' || status === 'rollback') {
    return <Badge variant={variants[status] || 'default'}>{refundOutcomeLabel(bet)}</Badge>
  }

  return (
    <Badge variant={variants[status] || 'default'}>{statusLabels[status] || status}</Badge>
  )
}

function TaiXiuBetStatsTable({ betStats }: { betStats: Record<string, unknown> }) {
  const tai = betStats.tai as { count?: number; total?: number } | undefined
  const xiu = betStats.xiu as { count?: number; total?: number } | undefined
  const totalCount = Number(betStats.total_count ?? 0)
  const totalAmount = Number(betStats.total_amount ?? 0)

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Loại</TableHead>
            <TableHead className="text-right">Số vé</TableHead>
            <TableHead className="text-right">Tổng tiền cược</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <span className="font-medium text-red-600">Tài</span>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(tai?.count ?? 0)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(tai?.total ?? 0)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <span className="font-medium text-blue-600">Xỉu</span>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(xiu?.count ?? 0)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(xiu?.total ?? 0)}</TableCell>
          </TableRow>
          <TableRow className="bg-muted/50 font-medium">
            <TableCell>Tổng</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(totalCount)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(totalAmount)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

function ChickenBetStatsTable({ betStats }: { betStats: Record<string, unknown> }) {
  const rows: { key: string; label: ReactNode }[] = [
    { key: 'a_win', label: <span className="font-medium text-blue-600">Meron</span> },
    { key: 'draw', label: <span className="font-medium text-amber-700">Hòa</span> },
    { key: 'b_win', label: <span className="font-medium text-red-600">Wala</span> },
  ]
  const totalCount = Number(betStats.total_count ?? 0)
  const totalAmount = Number(betStats.total_amount ?? 0)

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cửa</TableHead>
            <TableHead className="text-right">Số vé</TableHead>
            <TableHead className="text-right">Tổng tiền cược</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ key, label }) => {
            const cell = betStats[key] as { count?: number; total?: number } | undefined
            return (
              <TableRow key={key}>
                <TableCell>{label}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatNumber(cell?.count ?? 0)}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatNumber(cell?.total ?? 0)}
                </TableCell>
              </TableRow>
            )
          })}
          <TableRow className="bg-muted/50 font-medium">
            <TableCell>Tổng</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(totalCount)}</TableCell>
            <TableCell className="text-right font-mono tabular-nums">{formatNumber(totalAmount)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}

function TaiXiuProfitByTypeTable({ display }: { display: Record<string, unknown> }) {
  const byType = display.by_type as Record<string, { total_amount?: number; total_payout?: number; profit?: number }>
  if (!byType || typeof byType !== 'object') return null

  const keys = ['tai', 'xiu', 'chan', 'le', 'senco', 'bao'] as const
  const rows = keys.filter((k) => byType[k])

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cửa</TableHead>
            <TableHead className="text-right">Tổng cược</TableHead>
            <TableHead className="text-right">Trả thưởng</TableHead>
            <TableHead className="text-right">Lời/lỗ nhà cái</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((k) => {
            const r = byType[k] ?? {}
            const amt = Number(r.total_amount ?? 0)
            const pay = Number(r.total_payout ?? 0)
            const pl = typeof r.profit === 'number' ? r.profit : amt - pay
            return (
              <TableRow key={k}>
                <TableCell className="font-medium">{txTypeLabel(k)}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{formatNumber(amt)}</TableCell>
                <TableCell className="text-right font-mono tabular-nums">{formatNumber(pay)}</TableCell>
                <TableCell
                  className={`text-right font-mono tabular-nums font-medium ${
                    pl >= 0 ? 'text-emerald-600' : 'text-destructive'
                  }`}
                >
                  {pl >= 0 ? '+' : ''}
                  {formatNumber(pl)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function BetsTable({
  title,
  description,
  icon: Icon,
  bets,
  game,
}: {
  title: string
  description?: string
  icon: ComponentType<{ className?: string }>
  bets: AgencySessionBet[]
  game: AgencyGameType
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <Badge variant="secondary">{bets.length} vé</Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[88px]">ID vé</TableHead>
                <TableHead>Thành viên</TableHead>
                <TableHead>Loại cược</TableHead>
                <TableHead className="text-right">Tiền cược</TableHead>
                <TableHead className="text-right">Thắng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Đặt lúc</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bets.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-sm">#{b.id}</TableCell>
                  <TableCell>
                    <Link
                      to={`/users/${b.member_id}`}
                      className="font-medium text-primary hover:underline inline-flex items-center gap-1"
                    >
                      {b.username}
                    </Link>
                  </TableCell>
                  <TableCell>{renderBetTypeCell(game, b.bet_type)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{formatNumber(b.amount)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums text-emerald-700">
                    {b.actual_win != null ? formatNumber(b.actual_win) : '—'}
                  </TableCell>
                  <TableCell>{renderBetStatusBadge(b)}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(b.placed_at)}
                  </TableCell>
                </TableRow>
              ))}
              {bets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    Không có dữ liệu.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function GameSessionDetailPage({ game, listPath }: GameSessionDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const sessionId = Number(id)
  if (!Number.isFinite(sessionId) || sessionId <= 0) {
    return <Navigate to={listPath} replace />
  }

  const q = useQuery({
    queryKey: ['agency', 'game-session-detail', game, sessionId],
    queryFn: async () =>
      game === 'taixiu'
        ? agencyApi.getSessionTaixiuDetail(sessionId)
        : agencyApi.getSessionChickenFightDetail(sessionId),
  })

  if (q.isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Đang tải chi tiết phiên…</p>
        </CardContent>
      </Card>
    )
  }

  if (q.data && !q.data.success) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-destructive text-sm font-medium">{q.data.error ?? 'Không tải được phiên.'}</p>
            <Button variant="outline" size="sm" asChild>
              <Link to={listPath} className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại danh sách
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const d = q.data?.data
  if (!d) {
    return <Navigate to={listPath} replace />
  }

  const { session, room, bet_stats: betStats, taixiu_display: taixiuDisplay, winning_bets: winningBets, bets } = d
  const GameIcon = game === 'taixiu' ? Dices : CircleDot
  const title = game === 'taixiu' ? 'Chi tiết phiên — Tài Xỉu' : 'Chi tiết phiên — Đá gà'
  const st = session.status ?? ''
  const totalProfit =
    game === 'taixiu' && taixiuDisplay && typeof taixiuDisplay === 'object'
      ? Number((taixiuDisplay as { total_profit?: number }).total_profit ?? 0)
      : Number(session.total_amount ?? 0) - Number(session.total_payout ?? 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="outline" size="icon" className="shrink-0" asChild>
            <Link to={listPath} aria-label="Quay lại danh sách">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <GameIcon className="h-7 w-7 text-muted-foreground" />
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              ID phiên: <span className="font-mono font-medium text-foreground">#{session.id}</span>
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="sm:self-center shrink-0" asChild>
          <Link to={listPath} className="inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Danh sách phiên
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trạng thái</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <GameSessionStatusBadge status={st} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng cược (downline)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">{formatNumber(session.total_amount)}</div>
            <p className="text-xs text-muted-foreground mt-1">{formatNumber(session.total_bets)} vé đã xử lý</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lời/lỗ nhà cái (downline)</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold tabular-nums ${
                totalProfit >= 0 ? 'text-emerald-600' : 'text-destructive'
              }`}
            >
              {totalProfit >= 0 ? '+' : ''}
              {formatCurrency(totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Theo công thức báo cáo CMS</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Thông tin phiên
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-muted-foreground text-xs">Phòng</p>
              <p className="font-medium">
                {room?.name ?? '—'}
                {room?.room_code ? (
                  <span className="text-muted-foreground font-normal"> ({room.room_code})</span>
                ) : null}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-muted-foreground text-xs">Bắt đầu</p>
              <p className="font-medium">{formatDate(session.start_time)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="text-muted-foreground text-xs">Kết quả / cập nhật</p>
              <p className="font-medium">{formatDate(session.result_time ?? session.updated_at)}</p>
            </div>
          </div>
          {game === 'taixiu' && (
            <div className="sm:col-span-2 flex gap-2">
              <Dices className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-muted-foreground text-xs">Xúc xắc</p>
                <p className="font-mono text-lg font-semibold tracking-wider">
                  {[session.dice_1, session.dice_2, session.dice_3].filter((x) => x != null).join(' · ') || '—'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {game === 'taixiu' && taixiuDisplay && typeof taixiuDisplay === 'object' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Dices className="h-4 w-4 text-muted-foreground" />
              Lời/lỗ theo cửa (downline)
            </CardTitle>
            <CardDescription>Đồng bộ logic nhà cái với CMS — gồm phân bổ bão máy trên Tài/Xỉu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Bão máy (tiền)</p>
                <p className="font-semibold tabular-nums">
                  {formatNumber((taixiuDisplay as { bao_machine_amount?: number }).bao_machine_amount ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Bão máy (lời/lỗ)</p>
                <p className="font-semibold tabular-nums">
                  {formatNumber((taixiuDisplay as { bao_machine_profit?: number }).bao_machine_profit ?? 0)}
                </p>
              </div>
            </div>
            <TaiXiuProfitByTypeTable display={taixiuDisplay as Record<string, unknown>} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            Thống kê đặt cược (downline)
          </CardTitle>
          <CardDescription>Số vé và tổng tiền theo loại — chỉ thành viên dưới đại lý.</CardDescription>
        </CardHeader>
        <CardContent>
          {game === 'taixiu' ? (
            <TaiXiuBetStatsTable betStats={betStats} />
          ) : (
            <ChickenBetStatsTable betStats={betStats} />
          )}
        </CardContent>
      </Card>

      {winningBets && winningBets.length > 0 && (
        <BetsTable
          title="Vé thắng"
          description="Các vé trả thưởng trong phiên (downline)."
          icon={Trophy}
          bets={winningBets}
          game={game}
        />
      )}

      <BetsTable
        title="Tất cả cược trong phiên"
        description="Danh sách đầy đủ vé đã đặt bởi downline."
        icon={Users}
        bets={bets}
        game={game}
      />
    </div>
  )
}
