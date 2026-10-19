import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { agencyApi } from '@/api/agency'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/formatters'
import type { MemberTransfer } from '@/types/user'

interface MemberTransfersTabProps {
  memberId: number
}

export const MemberTransfersTab = ({ memberId }: MemberTransfersTabProps) => {
  const [page, setPage] = useState(1)
  const perPage = 20

  const { data, isLoading } = useQuery({
    queryKey: ['memberTransfers', memberId, page],
    queryFn: async () => {
      const response = await agencyApi.getMemberTransfers(memberId, { page, per_page: perPage })
      console.log('=== Member Transfers API Response ===')
      console.log('Full response:', response)
      console.log('response.data:', response.data)
      console.log('response.data?.data:', response.data?.data)
      console.log('response.data?.pagination:', response.data?.pagination)
      return response.data
    },
  })

  console.log('=== Member Transfers Component State ===')
  console.log('data:', data)
  console.log('data?.data:', data?.data)
  console.log('data?.pagination:', data?.pagination)
  
  const transfers = data?.data || []
  const pagination = data?.pagination
  
  console.log('transfers:', transfers)
  console.log('transfers.length:', transfers.length)
  console.log('pagination:', pagination)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'destructive' | 'secondary'> = {
      success: 'success',
      pending: 'secondary',
      failed: 'destructive',
    }
    const statusLabels: Record<string, string> = {
      success: 'Thành Công',
      pending: 'Chờ Xử Lý',
      failed: 'Thất Bại',
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
      ) : transfers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Không tìm thấy giao dịch nhận tiền</div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Số Tiền</TableHead>
                  <TableHead>Từ Agency</TableHead>
                  <TableHead>Mã Tham Chiếu</TableHead>
                  <TableHead>Ghi Chú</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer: MemberTransfer) => {
                  const amount = typeof transfer.amount === 'string' ? parseFloat(transfer.amount) : transfer.amount
                  const transferId = typeof transfer.id === 'string' ? parseInt(transfer.id) : transfer.id
                  const status = transfer.status || 'success'
                  
                  return (
                    <TableRow key={transferId}>
                      <TableCell>{formatDate(transfer.created_at)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(amount)}</TableCell>
                      <TableCell>{transfer.transferred_from_username || '-'}</TableCell>
                      <TableCell className="font-mono text-xs">{transfer.reference}</TableCell>
                      <TableCell>{transfer.description || '-'}</TableCell>
                      <TableCell>{getStatusBadge(status)}</TableCell>
                    </TableRow>
                  )
                })}
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
