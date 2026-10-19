import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { managerApi } from '@/api/manager'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { clampDateRange, MAX_STATS_RANGE_DAYS, ymdToday } from '@/lib/dateRange'
import { DateRangePresets } from '@/components/ui/date-range-presets'
import type { Transaction } from '@/types/user'

export const Transactions = () => {
  const today = ymdToday()
  const [memberSearch, setMemberSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState(today)
  const [dateTo, setDateTo] = useState(today)
  const [page, setPage] = useState(1)

  const effectiveRange = clampDateRange(dateFrom, dateTo)

  useEffect(() => {
    setPage(1)
  }, [memberSearch, typeFilter, statusFilter, effectiveRange.from, effectiveRange.to])

  const { data: txResponse, isLoading } = useQuery({
    queryKey: ['transactions', page, memberSearch, typeFilter, statusFilter, effectiveRange.from, effectiveRange.to],
    queryFn: async () => {
      const params: {
        member_search?: string
        type?: string
        status?: string
        date_from: string
        date_to: string
        page: number
        per_page: number
      } = {
        date_from: effectiveRange.from,
        date_to: effectiveRange.to,
        page,
        per_page: 20,
      }
      const trimmed = memberSearch.trim()
      if (trimmed) params.member_search = trimmed
      if (typeFilter !== 'all') params.type = typeFilter
      if (statusFilter !== 'all') params.status = statusFilter

      return await managerApi.getTransactions(params)
    },
  })

  const transactions = txResponse?.data ?? []
  const pagination = txResponse?.pagination
  const perPage = pagination?.per_page ?? 20
  const totalPages =
    pagination == null ? 1 : (pagination.total_pages ?? Math.max(1, Math.ceil(pagination.total / perPage)))

  const setFromAndClamp = (nextFrom: string) => {
    const { from, to } = clampDateRange(nextFrom, dateTo)
    setDateFrom(from)
    setDateTo(to)
  }

  const setToAndClamp = (nextTo: string) => {
    const { from, to } = clampDateRange(dateFrom, nextTo)
    setDateFrom(from)
    setDateTo(to)
  }

  const getTypeBadge = (tx: Transaction) => {
    const subtype = tx.subtype
    if (subtype === 'session_rollback') {
      return <Badge variant="secondary">Huỷ phiên (Tài Xỉu)</Badge>
    }
    if (subtype === 'chicken_session_cancel') {
      return <Badge variant="secondary">Huỷ phiên (Đá gà)</Badge>
    }
    if (subtype === 'bao_taixiu_refund') {
      return <Badge variant="default">Hoàn Bão (Tài Xỉu)</Badge>
    }
    if (subtype === 'result_correction_refund') {
      return <Badge variant="outline">Chỉnh kết quả / Thu hồi</Badge>
    }

    const type = tx.type
    const variants: Record<string, 'default' | 'success' | 'destructive' | 'secondary' | 'outline'> = {
      deposit: 'success',
      deposit_manual: 'success',
      withdraw: 'destructive',
      withdraw_manual: 'destructive',
      withdraw_fee: 'destructive',
      transfer_in: 'success',
      transfer_out: 'destructive',
      bet: 'secondary',
      bet_deduct: 'secondary',
      win: 'success',
      bet_win: 'success',
      bet_loss_refund: 'default',
      refund: 'default',
      promotion: 'outline',
      promotion_bonus: 'outline',
      adjustment: 'outline',
      evo_transfer_in: 'success',
      evo_transfer_out: 'destructive',
      rebate: 'success',
      sexy_bet: 'secondary',
      sexy_settle: 'success',
      sexy_cancel: 'default',
      sexy_tip: 'outline',
      sexy_adjust: 'outline',
    }
    const typeLabels: Record<string, string> = {
      deposit: 'Nạp tiền',
      deposit_manual: 'Nạp tiền (thủ công)',
      withdraw: 'Rút tiền',
      withdraw_manual: 'Rút tiền (thủ công)',
      withdraw_fee: 'Phí rút tiền',
      transfer_in: tx.type_label_vi ?? 'Nhận chuyển',
      transfer_out: tx.type_label_vi ?? 'Chuyển đi',
      bet: 'Cược',
      bet_deduct: 'Trừ cược',
      win: 'Thắng',
      bet_win: 'Thắng cược',
      bet_loss_refund: 'Hoàn thua (cược)',
      refund: tx.type_label_vi ?? 'Hoàn tiền',
      promotion: 'Khuyến mãi',
      promotion_bonus: 'Khuyến mãi',
      adjustment: 'Điều chỉnh',
      evo_transfer_in: 'Evo · Nạp',
      evo_transfer_out: 'Evo · Rút',
      rebate: 'Trả cỏ',
      sexy_bet: 'AWC · Cược',
      sexy_settle: 'AWC · Thắng',
      sexy_cancel: 'AWC · Hủy cược',
      sexy_tip: 'AWC · Tip',
      sexy_adjust: 'AWC · Điều chỉnh',
    }
    const label = typeLabels[type] ?? tx.type_label_vi ?? type.replace(/_/g, ' ')
    return (
      <Badge variant={variants[type] || 'default'}>
        {label}
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'destructive' | 'secondary'> = {
      completed: 'success',
      success: 'success',
      pending: 'secondary',
      cancelled: 'destructive',
      failed: 'destructive',
    }
    const statusLabels: Record<string, string> = {
      completed: 'Hoàn Thành',
      success: 'Thành công',
      pending: 'Chờ Xử Lý',
      cancelled: 'Đã Hủy',
      failed: 'Thất bại',
    }
    return (
      <Badge variant={variants[status] || 'default'}>
        {statusLabels[status] || status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Giao Dịch</h1>
        <p className="text-muted-foreground">Xem lịch sử giao dịch</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ Lọc</CardTitle>
          <CardDescription>
            Mặc định hôm nay. Khoảng ngày tối đa {MAX_STATS_RANGE_DAYS} ngày. Lọc thành viên theo ID hoặc tên đăng nhập. Loại giao dịch theo bảng sổ cái hệ thống (huỷ phiên đá gà thường là &quot;Nhận chuyển&quot; kèm mô tả hoàn tiền).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DateRangePresets
            maxSpanDays={MAX_STATS_RANGE_DAYS}
            onRangeChange={(from, to) => {
              setDateFrom(from)
              setDateTo(to)
            }}
          />
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Thành viên (ID hoặc tên đăng nhập)</label>
              <Input
                type="text"
                placeholder="VD: 145 hoặc player01"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loại</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[min(24rem,70vh)]">
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="deposit">Nạp tiền</SelectItem>
                  <SelectItem value="withdraw">Rút tiền</SelectItem>
                  <SelectItem value="bet">Trừ cược / cược</SelectItem>
                  <SelectItem value="win">Thắng / thắng cược</SelectItem>
                  <SelectItem value="sexy_settle">AWC · Thắng</SelectItem>
                  <SelectItem value="refund">Hoàn tiền / hoàn thua cược</SelectItem>
                  <SelectItem value="transfer_in">Nhận chuyển · hoàn (huỷ phiên ĐG)</SelectItem>
                  <SelectItem value="rebate">Trả cỏ</SelectItem>
                  {/* <SelectItem value="transfer_out">Chuyển đi</SelectItem>
                  <SelectItem value="promotion_bonus">Khuyến mãi</SelectItem>
                  <SelectItem value="promotion">Khuyến mãi (legacy)</SelectItem>
                  <SelectItem value="adjustment">Điều chỉnh</SelectItem>
                  <SelectItem value="evo_transfer_in">Evolution · Nạp</SelectItem>
                  <SelectItem value="evo_transfer_out">Evolution · Rút</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng Thái</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất Cả Trạng Thái</SelectItem>
                  <SelectItem value="pending">Chờ Xử Lý</SelectItem>
                  <SelectItem value="completed">Hoàn Thành</SelectItem>
                  <SelectItem value="success">Thành công</SelectItem>
                  <SelectItem value="cancelled">Đã Hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Từ Ngày</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setFromAndClamp(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Đến Ngày</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setToAndClamp(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch Sử Giao Dịch</CardTitle>
          <CardDescription>
            {pagination?.total ?? transactions.length} giao dịch · {effectiveRange.from} → {effectiveRange.to}
            {pagination && totalPages > 1 ? ` · Trang ${pagination.page}/${totalPages}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Không tìm thấy giao dịch</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Thành Viên</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Số Tiền</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead>Mô Tả</TableHead>
                    <TableHead>Ngày Tạo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction: Transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.user_id}</TableCell>
                      <TableCell>{transaction.username || '-'}</TableCell>
                      <TableCell>{getTypeBadge(transaction)}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell>{formatDate(transaction.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.total > perPage && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {pagination.page} / {totalPages} (Tổng {pagination.total} giao dịch)
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
