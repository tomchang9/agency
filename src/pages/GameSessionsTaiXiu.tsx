import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { agencyApi } from '@/api/agency'
import { GameSessionStatusBadge } from '@/components/game-sessions/GameSessionStatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  assertMaxRangeYmd,
  diffDaysInclusiveYmd,
  hcmMonthRangeYmd,
  hcmTodayYmd,
  hcmWeekRangeYmd,
  MAX_SESSION_FILTER_DAYS,
} from '@/lib/hcmDate'
import { formatCurrency, formatDate, formatNumber } from '@/lib/formatters'
import { formatTaiXiuSessionResultDisplay } from '@/lib/gameSessionResultDisplay'
import type { AgencyTaiXiuSessionRow, BetTypeTotals } from '@/types/gameSessions'

type DatePreset = 'today' | 'week' | 'month' | 'custom'

function txCellProfit(bt: BetTypeTotals | undefined, amount: number, payout: number, key: 'tai' | 'xiu'): number {
  if (!bt) return amount - payout
  if (key === 'tai' || key === 'xiu') {
    if (typeof bt.profit === 'number' && !Number.isNaN(bt.profit)) return bt.profit
  }
  return amount - payout
}

export function GameSessionsTaiXiu() {
  const [dateFrom, setDateFrom] = useState(() => hcmTodayYmd())
  const [dateTo, setDateTo] = useState(() => hcmTodayYmd())
  const [roomId, setRoomId] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [noResult, setNoResult] = useState(false)
  const [page, setPage] = useState(1)
  const [datePreset, setDatePreset] = useState<DatePreset>('today')

  const rangeErr = useMemo(() => assertMaxRangeYmd(dateFrom, dateTo), [dateFrom, dateTo])

  useEffect(() => {
    setPage(1)
  }, [dateFrom, dateTo, roomId, status, noResult])

  const { data: roomsRes } = useQuery({
    queryKey: ['agency', 'game-rooms', 'taixiu'],
    queryFn: () => agencyApi.getGameRooms('taixiu'),
  })

  const queryParams = useMemo(() => {
    const p: Record<string, string | number> = {
      date_from: dateFrom,
      date_to: dateTo,
      page,
    }
    if (roomId) p.room_id = Number(roomId)
    if (status) p.status = status
    if (noResult) p.no_result = 1
    return p
  }, [dateFrom, dateTo, roomId, status, noResult, page])

  const listQuery = useQuery({
    queryKey: ['agency', 'game-sessions', 'taixiu', queryParams],
    queryFn: () => agencyApi.getSessionsTaixiu(queryParams as never),
    enabled: rangeErr === null,
  })

  const applyQuick = (from: string, to: string, preset: DatePreset) => {
    if (assertMaxRangeYmd(from, to)) return
    setDateFrom(from)
    setDateTo(to)
    setDatePreset(preset)
    setPage(1)
  }

  const payload = listQuery.data?.success ? listQuery.data.data : undefined
  const sessions = payload?.sessions ?? []
  const pagination = payload?.pagination
  const summary = payload?.summary as Record<string, unknown> | undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Lịch sử phiên — Tài Xỉu</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ngày theo giờ HCM · tối đa {MAX_SESSION_FILTER_DAYS} ngày (
            {rangeErr ? '—' : diffDaysInclusiveYmd(dateFrom, dateTo)} ngày đang chọn)
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/game-sessions">← Tất cả game</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={datePreset === 'today' ? 'secondary' : 'outline'}
              onClick={() => applyQuick(hcmTodayYmd(), hcmTodayYmd(), 'today')}
            >
              Hôm nay
            </Button>
            <Button
              type="button"
              size="sm"
              variant={datePreset === 'week' ? 'secondary' : 'outline'}
              onClick={() => {
                const { from, to } = hcmWeekRangeYmd()
                applyQuick(from, to, 'week')
              }}
            >
              Tuần này
            </Button>
            <Button
              type="button"
              size="sm"
              variant={datePreset === 'month' ? 'secondary' : 'outline'}
              onClick={() => {
                const { from, to } = hcmMonthRangeYmd()
                if (assertMaxRangeYmd(from, to)) return
                applyQuick(from, to, 'month')
              }}
            >
              Tháng này
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setDatePreset('custom')
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setDatePreset('custom')
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>Phòng</Label>
              <Select value={roomId || '__all'} onValueChange={(v) => setRoomId(v === '__all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả phòng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tất cả phòng</SelectItem>
                  {(roomsRes?.data ?? []).map((r) => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name || r.room_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Trạng thái</Label>
              <Select value={status || '__all'} onValueChange={(v) => setStatus(v === '__all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">Tất cả</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="rollback">Huỷ phiên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={noResult} onChange={(e) => setNoResult(e.target.checked)} />
            Chưa có kết quả hợp lệ
          </label>
          {rangeErr && <p className="text-sm text-destructive">{rangeErr}</p>}
          {listQuery.data && !listQuery.data.success && (
            <p className="text-sm text-destructive">{listQuery.data.error ?? 'Lỗi tải dữ liệu'}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danh sách phiên</CardTitle>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading && <p className="text-muted-foreground text-sm">Đang tải…</p>}
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phiên</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Trạng thái &amp; thời gian</TableHead>
                  <TableHead>Kết quả</TableHead>
                  <TableHead>Bão máy</TableHead>
                  <TableHead>Tài</TableHead>
                  <TableHead>Xỉu</TableHead>
                  <TableHead>Tổng cược</TableHead>
                  <TableHead>Lời/lỗ</TableHead>
                  <TableHead className="w-[52px] text-right">
                    <span className="sr-only">Chi tiết</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary && typeof summary === 'object' && (
                  <TableRow className="bg-muted/50 font-medium">
                    <TableCell colSpan={3}>Tổng (trang &amp; bộ lọc)</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell>
                      {formatNumber(
                        (summary as { bao_machine_total?: number }).bao_machine_total ?? 0
                      )}
                    </TableCell>
                    <TableCell colSpan={2}>—</TableCell>
                    <TableCell>
                      {formatNumber(
                        (summary as { total_amount?: number }).total_amount ?? 0
                      )}
                    </TableCell>
                    <TableCell
                      className={
                        ((summary as { total_profit?: number }).total_profit ?? 0) >= 0
                          ? 'text-emerald-600'
                          : 'text-destructive'
                      }
                    >
                      {formatCurrency((summary as { total_profit?: number }).total_profit ?? 0)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                )}
                {sessions.map((s: AgencyTaiXiuSessionRow) => {
                  const bt = s.by_type ?? {}
                  const tai = (bt.tai ?? {}) as BetTypeTotals
                  const xiu = (bt.xiu ?? {}) as BetTypeTotals
                  const taiAmt = Number(tai.total_amount ?? 0)
                  const taiPay = Number(tai.total_payout ?? 0)
                  const xiuAmt = Number(xiu.total_amount ?? 0)
                  const xiuPay = Number(xiu.total_payout ?? 0)
                  const taiPl = txCellProfit(tai, taiAmt, taiPay, 'tai')
                  const xiuPl = txCellProfit(xiu, xiuAmt, xiuPay, 'xiu')
                  const cancelled = s.status === 'cancelled' || s.status === 'rollback'
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono">#{s.id}</TableCell>
                      <TableCell>{s.room_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 min-w-[7.5rem]">
                          <GameSessionStatusBadge status={s.status} />
                          <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                            {formatDate(s.result_time ?? s.start_time ?? null)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono whitespace-nowrap">
                        {formatTaiXiuSessionResultDisplay(s)}
                      </TableCell>
                      <TableCell>{cancelled ? '—' : formatNumber(s.bao_machine_amount)}</TableCell>
                      <TableCell>
                        {cancelled ? (
                          '—'
                        ) : (
                          <>
                            {formatNumber(taiAmt)}
                            <div className={taiPl >= 0 ? 'text-emerald-600 text-xs' : 'text-destructive text-xs'}>
                              {taiPl >= 0 ? '+' : ''}
                              {formatNumber(taiPl)}
                            </div>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        {cancelled ? (
                          '—'
                        ) : (
                          <>
                            {formatNumber(xiuAmt)}
                            <div className={xiuPl >= 0 ? 'text-emerald-600 text-xs' : 'text-destructive text-xs'}>
                              {xiuPl >= 0 ? '+' : ''}
                              {formatNumber(xiuPl)}
                            </div>
                          </>
                        )}
                      </TableCell>
                      <TableCell>{formatNumber(s.total_amount)}</TableCell>
                      <TableCell
                        className={Number(s.display_profit) >= 0 ? 'text-emerald-600' : 'text-destructive'}
                      >
                        {formatCurrency(s.display_profit)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Xem chi tiết" asChild>
                          <Link to={`/game-sessions/taixiu/${s.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {!listQuery.isLoading && sessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      Không có dữ liệu.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {pagination && pagination.total > (pagination.per_page ?? 50) && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {pagination.page} / {pagination.total_pages} (Tổng {pagination.total} phiên)
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.total_pages}
              onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
