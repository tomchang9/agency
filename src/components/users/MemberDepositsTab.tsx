import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { agencyApi } from '@/api/agency'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Deposit } from '@/types/user'

interface MemberDepositsTabProps {
  memberId: number
}

export const MemberDepositsTab = ({ memberId }: MemberDepositsTabProps) => {
  const [page, setPage] = useState(1)
  const perPage = 20

  const { data, isLoading } = useQuery({
    queryKey: ['memberDeposits', memberId, page],
    queryFn: async () => {
      const response = await agencyApi.getMemberDeposits(memberId, { page, per_page: perPage })
      return response.data
    },
  })

  const deposits = data?.data || []
  const pagination = data?.pagination

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'destructive' | 'secondary'> = {
      completed: 'success',
      pending: 'secondary',
      cancelled: 'destructive',
    }
    const statusLabels: Record<string, string> = {
      completed: 'Hoàn Thành',
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
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : deposits.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Không tìm thấy giao dịch nạp tiền</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Số Tiền</TableHead>
                  <TableHead>Mã Tham Chiếu</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((deposit: Deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>{formatDate(deposit.created_at)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(deposit.amount)}</TableCell>
                    <TableCell className="font-mono text-xs">{deposit.reference}</TableCell>
                    <TableCell>{getStatusBadge(deposit.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
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
    </div>
  )
}

