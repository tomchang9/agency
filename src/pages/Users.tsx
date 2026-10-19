import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { agencyApi } from '@/api/agency'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency, formatDate, formatSignedProfit } from '@/lib/formatters'
import { Eye, Lock, Unlock, Wallet } from 'lucide-react'
import { DateRangePresets } from '@/components/ui/date-range-presets'
import { UserStatusBadge } from '@/components/users/UserStatusBadge'
import { TransferMoneyDialog } from '@/components/users/TransferMoneyDialog'
import { FeedbackDialog } from '@/components/ui/feedback-dialog'
import { useAuthStore } from '@/store/authStore'
import { ROLES } from '@/lib/constants'
import type { DownlineUser } from '@/types/user'

export const Users = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasRole } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [page, setPage] = useState(1)

  const [confirmLock, setConfirmLock] = useState<{
    type: 'ban' | 'unban'
    user: DownlineUser
  } | null>(null)
  const [transferUser, setTransferUser] = useState<DownlineUser | null>(null)

  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedback, setFeedback] = useState<{
    title: string
    description?: string
    variant: 'success' | 'error'
  } | null>(null)

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await agencyApi.getProfile()
      return response.data
    },
  })

  const canTransferCredit =
    hasRole(ROLES.AGENCY) && profile?.can_credit_transfer === true

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['members', page, roleFilter, statusFilter, searchTerm, dateFrom, dateTo],
    queryFn: async () => {
      return await agencyApi.listMembers({
        page,
        per_page: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
      })
    },
  })

  const users = response?.data || []
  const pagination = response?.pagination

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesRole
  })

  const runBan = async (userId: number) => {
    try {
      await agencyApi.banMember(userId)
      refetch()
      setFeedback({
        title: 'Đã khóa thành viên thành công',
        description: 'Tài khoản của thành viên đã được cập nhật trạng thái.',
        variant: 'success',
      })
      setFeedbackOpen(true)
    } catch (error: unknown) {
      const errorResponse = error as { response?: { data?: { error?: string } } }
      setFeedback({
        title: 'Không thể khóa thành viên',
        description: errorResponse.response?.data?.error || 'Vui lòng thử lại sau.',
        variant: 'error',
      })
      setFeedbackOpen(true)
    }
  }

  const runUnban = async (userId: number) => {
    try {
      await agencyApi.unbanMember(userId)
      refetch()
      setFeedback({
        title: 'Đã mở khóa thành viên thành công',
        description: 'Tài khoản của thành viên đã được cập nhật trạng thái.',
        variant: 'success',
      })
      setFeedbackOpen(true)
    } catch (error: unknown) {
      const errorResponse = error as { response?: { data?: { error?: string } } }
      setFeedback({
        title: 'Không thể mở khóa thành viên',
        description: errorResponse.response?.data?.error || 'Vui lòng thử lại sau.',
        variant: 'error',
      })
      setFeedbackOpen(true)
    }
  }

  const confirmAction = async () => {
    if (!confirmLock) return
    const { type, user } = confirmLock
    setConfirmLock(null)
    if (type === 'ban') await runBan(user.id)
    else await runUnban(user.id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Thành Viên</h1>
          <p className="text-muted-foreground">Quản lý thành viên của bạn</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ Lọc</CardTitle>
          <CardDescription>Tìm kiếm và lọc thành viên</CardDescription>
        </CardHeader>
        <CardContent>
          <DateRangePresets
            className="mb-4"
            onRangeChange={(from, to) => {
              setDateFrom(from)
              setDateTo(to)
              setPage(1)
            }}
          />
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tìm Kiếm</label>
              <Input
                placeholder="Tìm theo tên đăng nhập hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Vai Trò</label>
              <Select
                value={roleFilter}
                onValueChange={(v) => {
                  setRoleFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất Cả Vai Trò</SelectItem>
                  <SelectItem value="member">Thành Viên</SelectItem>
                  <SelectItem value="agency">Đại Lý</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng Thái</label>
              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất Cả Trạng Thái</SelectItem>
                  <SelectItem value="active">Hoạt Động</SelectItem>
                  <SelectItem value="locked">Đã Khóa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Từ ngày tạo</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Đến ngày tạo</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
              />
            </div>
          </div>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateFrom('')
                setDateTo('')
                setPage(1)
              }}
            >
              Xóa lọc ngày tạo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Thành Viên</CardTitle>
          <CardDescription>
            Tìm thấy {filteredUsers.length} thành viên trên trang này
            {dateFrom || dateTo
              ? ` · Theo ngày tạo tài khoản: ${dateFrom || '…'} → ${dateTo || '…'}`
              : ''}
            {' · Lợi nhuận = tiền trả về − tiền cược (toàn thời gian, vé đã kết quả, gồm AWC). Tiền thua = phần cược không được trả lại.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Không tìm thấy thành viên</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên Đăng Nhập</TableHead>
                    <TableHead>Số Điện Thoại</TableHead>
                    <TableHead>Vai Trò</TableHead>
                    <TableHead>Số Dư</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Tiền cược</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Tiền thắng</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Tiền thua</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Lợi nhuận</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead>Ngày Tạo</TableHead>
                    <TableHead className="text-right">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => {
                    const profit = formatSignedProfit(user.bet_totals?.user_profit_loss ?? 0)
                    return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <button
                          type="button"
                          className="text-left hover:underline text-primary"
                          onClick={() => navigate(`/users/${user.id}`)}
                        >
                          {user.username}
                        </button>
                      </TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(user.balance)}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">
                        {formatCurrency(user.bet_totals?.total_wagered ?? 0)}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-emerald-600">
                        {formatCurrency(user.bet_totals?.total_win_amount ?? 0)}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-destructive">
                        {formatCurrency(user.bet_totals?.total_lost_amount ?? 0)}
                      </TableCell>
                      <TableCell className={`text-right text-sm tabular-nums font-medium ${profit.className}`}>
                        {profit.text}
                      </TableCell>
                      <TableCell>
                        <UserStatusBadge status={user.status} />
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Xem chi tiết"
                            onClick={() => navigate(`/users/${user.id}`)}
                            aria-label={`Xem chi tiết ${user.username}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canTransferCredit && user.role === 'member' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Chuyển credit"
                              onClick={() => setTransferUser(user)}
                              aria-label={`Chuyển credit cho ${user.username}`}
                            >
                              <Wallet className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {user.status === 'active' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Khóa tài khoản"
                              onClick={() => setConfirmLock({ type: 'ban', user })}
                            >
                              <Lock className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Mở khóa tài khoản"
                              onClick={() => setConfirmLock({ type: 'unban', user })}
                            >
                              <Unlock className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination && pagination.total > 20 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Trang {pagination.page} / {Math.ceil(pagination.total / 20)} (Tổng {pagination.total} thành viên)
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
              onClick={() => setPage((p) => Math.min(Math.ceil(pagination.total / 20), p + 1))}
              disabled={page >= Math.ceil(pagination.total / 20)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      <Dialog open={!!confirmLock} onOpenChange={(open) => !open && setConfirmLock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmLock?.type === 'ban' ? 'Xác nhận khóa tài khoản?' : 'Xác nhận mở khóa tài khoản?'}
            </DialogTitle>
            <DialogDescription>
              {confirmLock?.type === 'ban'
                ? `Thành viên "${confirmLock?.user.username}" sẽ bị khóa và không thể đăng nhập.`
                : `Thành viên "${confirmLock?.user.username}" sẽ được kích hoạt lại.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setConfirmLock(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant={confirmLock?.type === 'ban' ? 'destructive' : 'default'}
              onClick={confirmAction}
            >
              {confirmLock?.type === 'ban' ? 'Khóa' : 'Mở khóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {feedback ? (
        <FeedbackDialog
          open={feedbackOpen}
          onOpenChange={(openValue) => {
            setFeedbackOpen(openValue)
            if (!openValue) setFeedback(null)
          }}
          title={feedback.title}
          description={feedback.description}
          variant={feedback.variant}
        />
      ) : null}

      {transferUser ? (
        <TransferMoneyDialog
          open={!!transferUser}
          onOpenChange={(open) => {
            if (!open) setTransferUser(null)
          }}
          title="Chuyển credit cho thành viên"
          targetLabel={transferUser.username}
          onSubmit={({ amount, notes }) =>
            agencyApi.transferToMember(transferUser.id, { amount, notes })
          }
          onSuccess={async () => {
            await queryClient.invalidateQueries({ queryKey: ['profile'] })
            await queryClient.invalidateQueries({ queryKey: ['members'] })
            await queryClient.invalidateQueries({ queryKey: ['transferHistory'] })
            setFeedback({
              title: 'Chuyển credit thành công',
              variant: 'success',
            })
            setFeedbackOpen(true)
            setTransferUser(null)
          }}
          onError={(message) => {
            setFeedback({
              title: 'Không thể chuyển credit',
              description: message,
              variant: 'error',
            })
            setFeedbackOpen(true)
          }}
        />
      ) : null}
    </div>
  )
}
