import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { managerApi } from '@/api/manager'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, formatDateOnly } from '@/lib/formatters'
import { DateRangePresets } from '@/components/ui/date-range-presets'
import type { Commission } from '@/types/user'

const getDefaultDateFrom = () => {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return date.toISOString().split('T')[0]
}

const getDefaultDateTo = () => {
  return new Date().toISOString().split('T')[0]
}

export const Commissions = () => {
  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom)
  const [dateTo, setDateTo] = useState(getDefaultDateTo)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const { data: commissions, isLoading } = useQuery({
    queryKey: ['commissions', dateFrom, dateTo, statusFilter],
    queryFn: async () => {
      const params: any = {
        date_from: dateFrom,
        date_to: dateTo,
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      
      const response = await managerApi.getCommissions(params)
      return response.data || []
    },
  })
  
  const totalCommission = commissions?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0
  const totalVolume = commissions?.reduce((sum, c) => sum + (c.betting_volume || 0), 0) || 0
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'secondary'> = {
      paid: 'success',
      pending: 'secondary',
      cancelled: 'default',
    }
    const statusLabels: Record<string, string> = {
      paid: 'Đã Thanh Toán',
      pending: 'Chờ Xử Lý',
      cancelled: 'Đã Hủy',
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
        <h1 className="text-3xl font-bold">Hoa Hồng</h1>
        <p className="text-muted-foreground">Xem lịch sử hoa hồng của bạn</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tổng Quan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">Tổng Khối Lượng</div>
              <div className="text-2xl font-bold">{formatCurrency(totalVolume)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tổng Hoa Hồng</div>
              <div className="text-2xl font-bold">{formatCurrency(totalCommission)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Số Bản Ghi</div>
              <div className="text-2xl font-bold">{commissions?.length || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Bộ Lọc</CardTitle>
          <CardDescription>Lọc hoa hồng theo ngày và trạng thái</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DateRangePresets
            onRangeChange={(from, to) => {
              setDateFrom(from)
              setDateTo(to)
            }}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Từ Ngày</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Đến Ngày</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng Thái</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất Cả Trạng Thái</option>
                <option value="pending">Chờ Xử Lý</option>
                <option value="paid">Đã Thanh Toán</option>
                <option value="cancelled">Đã Hủy</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Lịch Sử Hoa Hồng</CardTitle>
          <CardDescription>
            {commissions?.length || 0} bản ghi hoa hồng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : !commissions || commissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Không tìm thấy hoa hồng</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày Kỳ</TableHead>
                    <TableHead>Khối Lượng Cược</TableHead>
                    <TableHead>Tỷ Lệ Hoa Hồng</TableHead>
                    <TableHead>Số Tiền Hoa Hồng</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead>Ngày Thanh Toán</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission: Commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>{formatDateOnly(commission.period_date)}</TableCell>
                      <TableCell>{formatCurrency(commission.betting_volume)}</TableCell>
                      <TableCell>{commission.commission_rate}%</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(commission.commission_amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(commission.status)}</TableCell>
                      <TableCell>{commission.paid_at ? formatDate(commission.paid_at) : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

