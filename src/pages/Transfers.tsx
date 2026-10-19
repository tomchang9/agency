import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { agencyApi } from '@/api/agency'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { DateRangePresets } from '@/components/ui/date-range-presets'
import type { TransferHistoryItem } from '@/api/agency'

export const Transfers = () => {
  const [page, setPage] = useState(1)
  const [targetId, setTargetId] = useState<string>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const perPage = 20

  const { data: response, isLoading } = useQuery({
    queryKey: ['transferHistory', page, targetId, dateFrom, dateTo],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, per_page: perPage }
      if (targetId) params.target_id = parseInt(targetId)
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      
      return await agencyApi.getTransferHistory(params)
    },
  })

  const transfers = response?.data?.data || []
  const pagination = response?.data?.pagination

  const getStatusBadge = () => {
    return <Badge variant="success">Thành Công</Badge>
  }

  const handleReset = () => {
    setTargetId('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lịch Sử Chuyển Tiền</h1>
        <p className="text-muted-foreground">Xem tất cả các giao dịch chuyển tiền đã thực hiện</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ Lọc</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DateRangePresets
            onRangeChange={(from, to) => {
              setDateFrom(from)
              setDateTo(to)
              setPage(1)
            }}
          />
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium mb-2 block">ID Thành Viên</label>
              <Input
                type="number"
                placeholder="Nhập ID thành viên"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Từ Ngày</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Đến Ngày</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={handleReset} className="w-full">
                Đặt Lại
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Chuyển Tiền</CardTitle>
          <CardDescription>
            {pagination?.total || 0} giao dịch
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Không tìm thấy giao dịch chuyển tiền</div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Đến Thành Viên</TableHead>
                      <TableHead>Số Tiền</TableHead>
                      <TableHead>Mã Tham Chiếu</TableHead>
                      <TableHead>Ghi Chú</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer: TransferHistoryItem) => {
                      const amount = typeof transfer.amount === 'string' ? parseFloat(transfer.amount) : transfer.amount
                      const transferId = typeof transfer.id === 'string' ? parseInt(transfer.id) : transfer.id
                      const transferredTo = typeof transfer.transferred_to === 'string' ? parseInt(transfer.transferred_to) : transfer.transferred_to
                      
                      return (
                        <TableRow key={transferId}>
                          <TableCell>{formatDate(transfer.created_at)}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{transfer.transferred_to_username || `ID: ${transferredTo}`}</div>
                              {transferredTo && (
                                <div className="text-sm text-muted-foreground">ID: {transferredTo}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatCurrency(amount)}</TableCell>
                          <TableCell className="font-mono text-xs">{transfer.reference}</TableCell>
                          <TableCell>{transfer.description || '-'}</TableCell>
                          <TableCell>{getStatusBadge()}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {pagination && pagination.total_pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Trang {pagination.page} / {pagination.total_pages} (Tổng {pagination.total})
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
                      onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                      disabled={page === pagination.total_pages}
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
