import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { agencyApi } from '@/api/agency'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatSignedProfit } from '@/lib/formatters'
import type { UserBet } from '@/types/user'

interface UserBetsProps {
  userId: number
  dateFrom?: string
  dateTo?: string
}

const formatHouseProfit = (value: number) => {
  const formatted = formatCurrency(Math.abs(value))
  if (value > 0) {
    return { text: `+${formatted}`, className: 'text-emerald-600' }
  }
  if (value < 0) {
    return { text: `-${formatted}`, className: 'text-destructive' }
  }
  return { text: formatted, className: '' }
}

const formatProfitLoss = (bet: UserBet) => {
  const value = bet.profit_loss ?? bet.actual_win
  if (value === null || value === undefined) {
    return '—'
  }
  const pl = formatSignedProfit(Number(value))
  return <span className={pl.className}>{pl.text}</span>
}

export const UserBets = ({ userId, dateFrom, dateTo }: UserBetsProps) => {
  const [page, setPage] = useState(1)
  const [gameType, setGameType] = useState<string>('all')
  const [status, setStatus] = useState<string>('all')
  const perPage = 20

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await agencyApi.getProfile()
      return response.data
    },
  })
  const evoEnabled = profile?.evo_integration_enabled === true
  const sboEnabled = profile?.sbo_integration_enabled === true
  const sexyEnabled = profile?.sexy_integration_enabled === true
  const isEvolution = gameType === 'evolution'
  const isSbo = gameType === 'sbo'

  const { data, isLoading } = useQuery({
    queryKey: ['userBets', userId, page, gameType, status, dateFrom, dateTo],
    queryFn: async () => {
      const params: {
        page: number
        per_page: number
        game_type?: string
        status?: string
        date_from?: string
        date_to?: string
      } = {
        page,
        per_page: perPage,
      }
      if (gameType !== 'all') params.game_type = gameType
      if (status !== 'all') params.status = status
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      return agencyApi.getMemberBets(userId, params)
    },
  })

  const bets: UserBet[] = data?.data ?? []
  const pagination = data?.pagination

  const formatSessionId = (sessionId: number | string | undefined | null): string => {
    if (sessionId === undefined || sessionId === null) return '-'
    const num = typeof sessionId === 'string' ? parseInt(sessionId, 10) : sessionId
    if (Number.isNaN(num)) return '-'
    return `#${String(num).padStart(6, '0')}`
  }

  const refundOutcomeLabel = (bet: UserBet): string => {
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

  const renderBetType = (bet: UserBet) => {
    const gt = bet.game_type
    const raw = (bet.bet_type ?? '').toLowerCase().replace(/\s+/g, '_')
    if (gt === 'chicken_fight') {
      if (raw === 'a_win' || raw === 'meron') {
        return <span className="font-medium text-blue-600">Meron</span>
      }
      if (raw === 'b_win' || raw === 'wala') {
        return <span className="font-medium text-red-600">Wala</span>
      }
    }
    return <span className="uppercase">{bet.bet_type}</span>
  }

  const getStatusBadge = (bet: UserBet) => {
    const betStatus = bet.status ?? ''
    const variants: Record<string, 'default' | 'success' | 'destructive' | 'secondary'> = {
      won: 'success',
      lost: 'destructive',
      pending: 'secondary',
      refunded: 'default',
      rollback: 'secondary',
      completed: 'success',
      failed: 'destructive',
      cancelled: 'secondary',
    }
    const statusLabels: Record<string, string> = {
      won: 'Thắng',
      lost: 'Thua',
      pending: 'Chờ Xử Lý',
      refunded: 'Hoàn Tiền',
      rollback: 'Huỷ game',
      completed: 'Hoàn tất',
      failed: 'Thất bại',
      cancelled: 'Đã hủy',
    }

    if (isEvolution && bet.status_label) {
      return <Badge variant={variants[betStatus] || 'default'}>{bet.status_label}</Badge>
    }

    if (isSbo && bet.status_label) {
      return <Badge variant={variants[betStatus] || 'default'}>{bet.status_label}</Badge>
    }

    if (betStatus === 'refunded' || betStatus === 'rollback') {
      const label = refundOutcomeLabel(bet)
      return <Badge variant={variants[betStatus] || 'default'}>{label}</Badge>
    }

    return (
      <Badge variant={variants[betStatus] || 'default'}>
        {statusLabels[betStatus] || betStatus}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={gameType} onValueChange={(v) => { setGameType(v); setPage(1) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Loại Game" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất Cả Game</SelectItem>
            <SelectItem value="taixiu">Tài Xỉu</SelectItem>
            <SelectItem value="chicken_fight">Đá Gà</SelectItem>
            {evoEnabled && <SelectItem value="evolution">Evolution</SelectItem>}
            {sboEnabled && <SelectItem value="sbo">SBO Sports</SelectItem>}
            {sexyEnabled && <SelectItem value="sexy">Sexy Casino</SelectItem>}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng Thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất Cả Trạng Thái</SelectItem>
            {isEvolution ? (
              <>
                <SelectItem value="completed">Hoàn tất</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="pending">Chờ Xử Lý</SelectItem>
                <SelectItem value="won">Thắng</SelectItem>
                <SelectItem value="lost">Thua</SelectItem>
                <SelectItem value="refunded">Hoàn Tiền</SelectItem>
                <SelectItem value="rollback">Huỷ game</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      {(dateFrom || dateTo) && (
        <p className="text-xs text-muted-foreground">
          Đang lọc theo ngày{isEvolution || isSbo ? '' : ' đặt cược'}: {dateFrom || '…'} → {dateTo || '…'}
        </p>
      )}

      {isLoading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : bets.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Không tìm thấy cược</div>
      ) : (
        <>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {isEvolution ? (
                    <>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Lời/lỗ NC</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </>
                  ) : isSbo ? (
                    <>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Portfolio</TableHead>
                      <TableHead>Trận đấu</TableHead>
                      <TableHead>Giải</TableHead>
                      <TableHead>Chi tiết</TableHead>
                      <TableHead>Stake</TableHead>
                      <TableHead>Odds</TableHead>
                      <TableHead>Win/Loss</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ref</TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>Phiên</TableHead>
                      <TableHead>Phòng</TableHead>
                      <TableHead>Loại Cược</TableHead>
                      <TableHead>Số Tiền</TableHead>
                      <TableHead>Tỷ Lệ</TableHead>
                      <TableHead>Tiền Thắng Tiềm Năng</TableHead>
                      <TableHead>Tiền Thắng Thực Tế</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead>Thời Gian Đặt</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bets.map((bet: UserBet) =>
                  isEvolution ? (
                    <TableRow key={bet.id}>
                      <TableCell>{formatDate(bet.placed_at)}</TableCell>
                      <TableCell>{bet.direction_label || bet.direction}</TableCell>
                      <TableCell>{bet.game_name || bet.game_id || '—'}</TableCell>
                      <TableCell>{formatCurrency(bet.amount ?? 0)}</TableCell>
                      <TableCell>
                        {bet.house_profit != null ? (
                          (() => {
                            const hp = formatHouseProfit(Number(bet.house_profit))
                            return <span className={hp.className}>{hp.text}</span>
                          })()
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(bet)}</TableCell>
                    </TableRow>
                  ) : isSbo ? (
                    <TableRow key={bet.id}>
                      <TableCell>{formatDate(bet.placed_at)}</TableCell>
                      <TableCell>{bet.sbo_portfolio_label || bet.room_name || '—'}</TableCell>
                      <TableCell>{bet.sbo_match_label || bet.game_name || '—'}</TableCell>
                      <TableCell>{bet.sbo_league || '—'}</TableCell>
                      <TableCell>{bet.bet_type || '—'}</TableCell>
                      <TableCell>{formatCurrency(bet.amount ?? 0)}</TableCell>
                      <TableCell>{bet.odds ?? '—'}</TableCell>
                      <TableCell>{formatProfitLoss(bet)}</TableCell>
                      <TableCell>{getStatusBadge(bet)}</TableCell>
                      <TableCell className="font-mono text-xs">{bet.sbo_ref_no || bet.session_ref || '—'}</TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={bet.id}>
                      <TableCell className="font-mono text-xs">{formatSessionId(bet.session_id)}</TableCell>
                      <TableCell>{bet.room_name || '-'}</TableCell>
                      <TableCell>{renderBetType(bet)}</TableCell>
                      <TableCell>{formatCurrency(bet.amount ?? 0)}</TableCell>
                      <TableCell>{bet.odds ?? '-'}</TableCell>
                      <TableCell>{bet.potential_win != null ? formatCurrency(bet.potential_win) : '-'}</TableCell>
                      <TableCell>{bet.actual_win != null ? formatCurrency(bet.actual_win) : '-'}</TableCell>
                      <TableCell>{getStatusBadge(bet)}</TableCell>
                      <TableCell>{formatDate(bet.placed_at)}</TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>

          {pagination && (pagination.total_pages ?? 1) > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Trang {pagination.page} / {pagination.total_pages ?? 1} (Tổng {pagination.total})
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.total_pages ?? 1, p + 1))}
                  disabled={page === (pagination.total_pages ?? 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
