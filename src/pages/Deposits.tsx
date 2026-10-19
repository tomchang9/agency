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

export const Deposits = () => {
  const queryClient = useQueryClient()
  const [selectedDeposit, setSelectedDeposit] = useState<number | null>(null)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  
  const { data: deposits, isLoading } = useQuery({
    queryKey: ['pendingDeposits'],
    queryFn: async () => {
      const response = await managerApi.getPendingDeposits()
      return response.data || []
    },
  })
  
  const approveMutation = useMutation({
    mutationFn: (depositId: number) => managerApi.approveDeposit(depositId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingDeposits'] })
      queryClient.invalidateQueries({ queryKey: ['downline'] })
      setShowApproveDialog(false)
      setSelectedDeposit(null)
    },
  })
  
  const handleApprove = (depositId: number) => {
    setSelectedDeposit(depositId)
    setShowApproveDialog(true)
  }
  
  const confirmApprove = () => {
    if (selectedDeposit) {
      approveMutation.mutate(selectedDeposit)
    }
  }
  
  const deposit = deposits?.find(d => d.id === selectedDeposit)
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Quản Lý Nạp Tiền</h1>
        <p className="text-muted-foreground">Duyệt các giao dịch nạp tiền đang chờ</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Giao Dịch Nạp Tiền Chờ Duyệt</CardTitle>
          <CardDescription>
            {deposits?.length || 0} giao dịch đang chờ duyệt
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : !deposits || deposits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Không có giao dịch nạp tiền chờ duyệt</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Thành Viên</TableHead>
                    <TableHead>Số Tiền</TableHead>
                    <TableHead>Mã Tham Chiếu</TableHead>
                    <TableHead>Ngày Tạo</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead className="text-right">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map((deposit) => (
                    <TableRow key={deposit.id}>
                      <TableCell className="font-medium">{deposit.user_id}</TableCell>
                      <TableCell>{formatCurrency(deposit.amount)}</TableCell>
                      <TableCell className="font-mono text-xs">{deposit.reference}</TableCell>
                      <TableCell>{formatDate(deposit.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {deposit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(deposit.id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Duyệt
                        </Button>
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
            <DialogTitle>Duyệt Giao Dịch Nạp Tiền</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn duyệt giao dịch nạp tiền này?
            </DialogDescription>
          </DialogHeader>
          
          {deposit && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ID Thành Viên:</span>
                <span className="font-medium">{deposit.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Số Tiền:</span>
                <span className="font-medium">{formatCurrency(deposit.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Mã Tham Chiếu:</span>
                <span className="font-mono text-xs">{deposit.reference}</span>
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

