import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { agencyApi } from '@/api/agency'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { Withdrawal } from '@/types/user'

interface MemberWithdrawalsTabProps {
  memberId: number
}

export const MemberWithdrawalsTab = ({ memberId }: MemberWithdrawalsTabProps) => {
  const [page, setPage] = useState(1)
  const perPage = 20

  const { data, isLoading } = useQuery({
    queryKey: ['memberWithdrawals', memberId, page],
    queryFn: async () => {
      const response = await agencyApi.getMemberWithdrawals(memberId, { page, per_page: perPage })
      return response.data
    },
  })

  const withdrawals = data?.data || []
  const pagination = data?.pagination

  const getStatusBadge = (status: string) => {
    if (status.includes('approved')) {
      return <Badge variant="success">Đã Duyệt</Badge>
    }
    if (status === 'rejected') {
      return <Badge variant="destructive">Đã Từ Chối</Badge>
    }
    return <Badge variant="secondary">Chờ Xử Lý</Badge>
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Không tìm thấy giao dịch rút tiền</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Số Tiền</TableHead>
                  <TableHead>Thông Tin Ngân Hàng</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal: Withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>{formatDate(withdrawal.created_at)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(withdrawal.amount)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{withdrawal.bank_name}</div>
                        <div className="text-muted-foreground">
                          {withdrawal.account_number} - {withdrawal.account_name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
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

