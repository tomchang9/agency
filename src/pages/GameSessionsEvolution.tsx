import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { agencyApi } from '@/api/agency'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DateRangePresets } from '@/components/ui/date-range-presets'
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
  hcmMonthRangeYmd,
  hcmTodayYmd,
  hcmWeekRangeYmd,
  MAX_SESSION_FILTER_DAYS,
} from '@/lib/hcmDate'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { ArrowLeft, Sparkles } from 'lucide-react'

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

export function GameSessionsEvolution() {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await agencyApi.getProfile()
      return response.data
    },
  })
  const allowed = profile?.evo_integration_enabled === true

  const [dateFrom, setDateFrom] = useState(() => hcmTodayYmd())
  const [dateTo, setDateTo] = useState(() => hcmTodayYmd())
  const [userSearch, setUserSearch] = useState('')
  const [page, setPage] = useState(1)
  const rangeErr = useMemo(() => assertMaxRangeYmd(dateFrom, dateTo), [dateFrom, dateTo])

  useEffect(() => {
    setPage(1)
  }, [dateFrom, dateTo, userSearch])

  const listQuery = useQuery({
    queryKey: ['agency', 'evolution-transactions', dateFrom, dateTo, userSearch, page],
    queryFn: () =>
      agencyApi.getEvolutionTransactions({
        date_from: dateFrom,
        date_to: dateTo,
        user_search: userSearch || undefined,
        page,
        per_page: 50,
      }),
    enabled: allowed && rangeErr === null,
  })

  if (!profileLoading && profile && !allowed) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Báo cáo Evolution chưa được bật cho tài khoản này.</p>
        <Link to="/game-sessions">← Quay lại</Link>
      </div>
    )
  }

  const payload = listQuery.data?.success ? listQuery.data.data : undefined
  const rows = payload?.transactions ?? []
  const pagination = payload?.pagination
  const house = payload?.house_summary

  const applyQuick = (from: string, to: string) => {
    if (assertMaxRangeYmd(from, to)) return
    setDateFrom(from)
    setDateTo(to)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/game-sessions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Lịch sử game
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            Evolution — giao dịch downline
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ledger One Wallet · lời/lỗ theo góc nhìn nhà cái (chỉ giao dịch hoàn tất)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Khoảng ngày</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DateRangePresets onRangeChange={(from, to) => applyQuick(from, to)} />
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label>Từ ngày</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Đến ngày</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-1 min-w-[200px]">
              <Label>Thành viên</Label>
              <Input
                placeholder="ID / username"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <Button type="button" variant="secondary" onClick={() => applyQuick(hcmTodayYmd(), hcmTodayYmd())}>
              Hôm nay
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const week = hcmWeekRangeYmd()
                applyQuick(week.from, week.to)
              }}
            >
              Tuần này
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const month = hcmMonthRangeYmd()
                applyQuick(month.from, month.to)
              }}
            >
              Tháng này
            </Button>
          </div>
          {rangeErr && <p className="text-sm text-destructive">{rangeErr}</p>}
          <p className="text-xs text-muted-foreground">Tối đa {MAX_SESSION_FILTER_DAYS} ngày mỗi lần lọc.</p>
        </CardContent>
      </Card>

      {house && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tổng cược</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(house.total_wagered)}</p>
              <p className="text-xs text-muted-foreground">{house.bet_count} lệnh debit</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tổng trả thưởng</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(house.total_payout)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Lợi nhuận nhà cái</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const hp = formatHouseProfit(house.house_profit)
                return <p className={`text-2xl font-bold ${hp.className}`}>{hp.text}</p>
              })()}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chi tiết giao dịch</CardTitle>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <p className="text-muted-foreground py-8 text-center">Đang tải...</p>
          ) : rows.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">Không có dữ liệu</p>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Thành viên</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Lời/lỗ NC</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => {
                      const hp =
                        row.house_profit != null ? formatHouseProfit(row.house_profit) : null
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {formatDate(row.created_at)}
                          </TableCell>
                          <TableCell>
                            <Link
                              to={`/users/${row.member_id}`}
                              className="text-primary hover:underline"
                            >
                              {row.username}
                            </Link>
                          </TableCell>
                          <TableCell>{row.direction_label}</TableCell>
                          <TableCell>{row.game_name || row.game_id || '—'}</TableCell>
                          <TableCell>{formatCurrency(row.amount)}</TableCell>
                          <TableCell className={hp?.className}>
                            {hp ? hp.text : '—'}
                          </TableCell>
                          <TableCell>{row.status_label}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Trang {pagination.page} / {pagination.total_pages} ({pagination.total} giao dịch)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.total_pages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
