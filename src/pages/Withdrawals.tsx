import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { managerApi } from '@/api/manager'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { CheckCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useState } from 'react'

export const Withdrawals = () => {
  const queryClient = useQueryClient()
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<number | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  
  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['pendingWithdrawals'],
    queryFn: async () => {
      const response = await managerApi.getPendingWithdrawals()
      return response.data || []
    },
  })
  
  const approveMutation = useMutation({
    mutationFn: (withdrawalId: number) => managerApi.approveWithdrawal(withdrawalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingWithdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['downline'] })
      setShowApproveDialog(false)
      setSelectedWithdrawal(null)
    },
  })
  
  const handleApprove = (withdrawalId: number) => {
    setSelectedWithdrawal(withdrawalId)
    setShowApproveDialog(true)
  }
  
  const confirmApprove = () => {
    if (selectedWithdrawal) {
      approveMutation.mutate(selectedWithdrawal)
    }
  }
  
  const withdrawal = withdrawals?.find(w => w.id === selectedWithdrawal)
  
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản Lý Rút Tiền</h1>
        <p className="text-muted-foreground">Duyệt các giao dịch rút tiền đang chờ</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Giao Dịch Rút Tiền Chờ Duyệt</CardTitle>
          <CardDescription>
            {withdrawals?.length || 0} giao dịch đang chờ duyệt
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : !withdrawals || withdrawals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Không có giao dịch rút tiền chờ duyệt</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Thành Viên</TableHead>
                    <TableHead>Số Tiền</TableHead>
                    <TableHead>Thông Tin Ngân Hàng</TableHead>
                    <TableHead>Ngày Tạo</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead className="text-right">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="font-medium">{withdrawal.member_id}</TableCell>
                      <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{withdrawal.bank_name}</div>
                          <div className="text-muted-foreground">
                            {withdrawal.account_number} - {withdrawal.account_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(withdrawal.created_at)}</TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell className="text-right">
                        {withdrawal.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(withdrawal.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Duyệt
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duyệt Giao Dịch Rút Tiền</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn duyệt giao dịch rút tiền này?
            </DialogDescription>
          </DialogHeader>
          
          {withdrawal && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ID Thành Viên:</span>
                <span className="font-medium">{withdrawal.member_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Số Tiền:</span>
                <span className="font-medium">{formatCurrency(withdrawal.amount)}</span>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Thông Tin Ngân Hàng:</div>
                <div className="text-sm">
                  <div>{withdrawal.bank_name}</div>
                  <div>{withdrawal.account_number}</div>
                  <div>{withdrawal.account_name}</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={approveMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={confirmApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? 'Đang duyệt...' : 'Duyệt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

