import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { agencyApi } from '@/api/agency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, Lock, Unlock, Wallet } from 'lucide-react'
import { formatCurrency, formatDate, formatSignedProfit } from '@/lib/formatters'
import { clampDateRange, ymdToday } from '@/lib/dateRange'
import { UserBets } from '@/components/users/UserBets'
import { UserStatusBadge } from '@/components/users/UserStatusBadge'
import { PendingBetsDialog } from '@/components/users/PendingBetsDialog'
import { TransferMoneyDialog } from '@/components/users/TransferMoneyDialog'
import { FeedbackDialog } from '@/components/ui/feedback-dialog'
import { DateRangePresets } from '@/components/ui/date-range-presets'
import { MAX_STATS_RANGE_DAYS } from '@/lib/dateRange'
import { useAuthStore } from '@/store/authStore'
import { ROLES } from '@/lib/constants'

export const UserDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { hasRole } = useAuthStore()
  const userId = parseInt(id || '0')
  const today = ymdToday()
  const [dateFrom, setDateFrom] = useState<string>(today)
  const [dateTo, setDateTo] = useState<string>(today)

  const effectiveRange = clampDateRange(dateFrom, dateTo)

  const [confirmLock, setConfirmLock] = useState<'ban' | 'unban' | null>(null)
  const [transferOpen, setTransferOpen] = useState(false)
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

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId, effectiveRange.from, effectiveRange.to],
    queryFn: async () => {
      const response = await agencyApi.getMember(userId, {
        date_from: effectiveRange.from,
        date_to: effectiveRange.to,
      })
      return response.data
    },
    enabled: !!userId,
  })

  const canTransfer =
    hasRole(ROLES.AGENCY) && profile?.can_credit_transfer === true && user?.role === 'member'

  const setFromAndClamp = (nextFrom: string) => {
    const c = clampDateRange(nextFrom, dateTo)
    setDateFrom(c.from)
    setDateTo(c.to)
  }

  const setToAndClamp = (nextTo: string) => {
    const c = clampDateRange(dateFrom, nextTo)
    setDateFrom(c.from)
    setDateTo(c.to)
  }

  const runBan = async () => {
    try {
      await agencyApi.banMember(userId)
      await queryClient.invalidateQueries({ queryKey: ['user', userId] })
      setFeedback({
        title: 'Đã khóa thành viên thành công',
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

  const runUnban = async () => {
    try {
      await agencyApi.unbanMember(userId)
      await queryClient.invalidateQueries({ queryKey: ['user', userId] })
      setFeedback({
        title: 'Đã mở khóa thành viên thành công',
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
    setConfirmLock(null)
    if (confirmLock === 'ban') await runBan()
    else await runUnban()
  }

  if (isLoading) {
    return <div>Đang tải...</div>
  }

  if (!user) {
    return <div>Không tìm thấy thành viên</div>
  }

  const userProfit = formatSignedProfit(user.stats.user_profit_loss ?? 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/users')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay Lại
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{user.username}</h1>
            <PendingBetsDialog
              userId={userId}
              username={user.username}
              pendingCount={user.pending_bet_count ?? 0}
            />
            {user.status === 'active' ? (
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                title="Khóa tài khoản"
                onClick={() => setConfirmLock('ban')}
              >
                <Lock className="h-4 w-4" />
                Khóa
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                title="Mở khóa tài khoản"
                onClick={() => setConfirmLock('unban')}
              >
                <Unlock className="h-4 w-4" />
                Mở khóa
              </Button>
            )}
            {canTransfer ? (
              <Button
                variant="default"
                size="sm"
                className="gap-1"
                title="Chuyển credit"
                onClick={() => setTransferOpen(true)}
                aria-label="Chuyển credit cho thành viên"
              >
                <Wallet className="h-4 w-4" />
                Chuyển credit
              </Button>
            ) : null}
          </div>
          <p className="text-muted-foreground">Chi Tiết Thành Viên</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Cơ Bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tên Đăng Nhập</span>
              <span className="font-medium">{user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Số Điện Thoại</span>
              <span className="font-medium">{user.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Họ Tên</span>
              <span className="font-medium">{user.full_name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Vai Trò</span>
              <Badge variant="secondary" className="capitalize">
                {user.role === 'member' ? 'Thành Viên' : user.role === 'agency' ? 'Đại Lý' : user.role}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Trạng Thái</span>
              <UserStatusBadge status={user.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ngày Tạo</span>
              <span className="font-medium">{formatDate(user.created_at)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thông Tin Số Dư</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tổng Số Dư</span>
              <span className="font-medium">{formatCurrency(user.balance.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Khả Dụng</span>
              <span className="font-medium text-green-600">
                {formatCurrency(user.balance.available)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Đóng Băng (Rút)</span>
              <span className="font-medium">{formatCurrency(user.balance.frozen_for_withdraw)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Đóng Băng (Cược)</span>
              <span className="font-medium">{formatCurrency(user.balance.frozen_for_bet)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc thời gian thống kê</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Mặc định hôm nay. Khoảng tối đa {MAX_STATS_RANGE_DAYS} ngày. Áp dụng cho thống kê và lịch sử cược (theo ngày đặt cược).
          </p>
          <DateRangePresets
            className="mb-3"
            maxSpanDays={MAX_STATS_RANGE_DAYS}
            onRangeChange={(from, to) => {
              setDateFrom(from)
              setDateTo(to)
            }}
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Từ ngày cược</label>
              <Input type="date" value={dateFrom} onChange={(e) => setFromAndClamp(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Đến ngày cược</label>
              <Input type="date" value={dateTo} onChange={(e) => setToAndClamp(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thống Kê</CardTitle>
          {(user.stats.stats_date_from || user.stats.stats_date_to) && (
            <p className="text-xs text-muted-foreground">
              Khoảng: {user.stats.stats_date_from ?? '…'} → {user.stats.stats_date_to ?? '…'} (theo ngày đặt cược)
            </p>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-4">
            Tiền thua = tổng mức cược các vé đã thua (đã kết quả). Tiền thắng = tổng trả thưởng khi thắng.
            Lợi nhuận = lãi/lỗ ròng của thành viên (trả thưởng − tiền cược, vé đã kết quả).
          </p>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-7">
            <div>
              <div className="text-sm text-muted-foreground">Tổng vé</div>
              <div className="text-2xl font-bold">{user.stats.total_bets}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tổng tiền cược</div>
              <div className="text-2xl font-bold">{formatCurrency(user.stats.total_wagered ?? 0)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Thắng / Thua (vé)</div>
              <div className="text-2xl font-bold">
                <span className="text-emerald-600">{user.stats.total_wins}</span>
                <span className="text-muted-foreground font-normal"> / </span>
                <span className="text-destructive">{user.stats.total_lost ?? 0}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tỷ lệ thắng</div>
              <div className="text-2xl font-bold">{user.stats.win_rate}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tổng tiền thắng</div>
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(user.stats.total_win_amount)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tổng tiền thua</div>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(user.stats.total_lost_amount ?? 0)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Lợi nhuận</div>
              <div className={`text-2xl font-bold ${userProfit.className}`}>{userProfit.text}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch Sử Cược</CardTitle>
        </CardHeader>
        <CardContent>
          <UserBets userId={userId} dateFrom={effectiveRange.from} dateTo={effectiveRange.to} />
        </CardContent>
      </Card>

      <Dialog open={!!confirmLock} onOpenChange={(open) => !open && setConfirmLock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmLock === 'ban' ? 'Xác nhận khóa tài khoản?' : 'Xác nhận mở khóa tài khoản?'}
            </DialogTitle>
            <DialogDescription>
              {confirmLock === 'ban'
                ? `Thành viên "${user.username}" sẽ bị khóa và không thể đăng nhập.`
                : `Thành viên "${user.username}" sẽ được kích hoạt lại.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setConfirmLock(null)}>
              Hủy
            </Button>
            <Button
              type="button"
              variant={confirmLock === 'ban' ? 'destructive' : 'default'}
              onClick={confirmAction}
            >
              {confirmLock === 'ban' ? 'Khóa' : 'Mở khóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {canTransfer ? (
        <TransferMoneyDialog
          open={transferOpen}
          onOpenChange={setTransferOpen}
          title="Chuyển credit cho thành viên"
          targetLabel={user.username}
          onSubmit={({ amount, notes }) => agencyApi.transferToMember(userId, { amount, notes })}
          onSuccess={async () => {
            await queryClient.invalidateQueries({ queryKey: ['user', userId] })
            await queryClient.invalidateQueries({ queryKey: ['profile'] })
            await queryClient.invalidateQueries({ queryKey: ['transferHistory'] })
            setFeedback({
              title: 'Chuyển credit thành công',
              variant: 'success',
            })
            setFeedbackOpen(true)
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
    </div>
  )
}
