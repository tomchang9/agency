import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { agencyApi } from '@/api/agency'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Wallet } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { TransferMoneyDialog } from '@/components/users/TransferMoneyDialog'
import { FeedbackDialog } from '@/components/ui/feedback-dialog'
import { UserStatusBadge } from '@/components/users/UserStatusBadge'

export const AgencyDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const agencyId = parseInt(id || '0')
  const [transferOpen, setTransferOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedback, setFeedback] = useState<{
    title: string
    description?: string
    variant: 'success' | 'error'
  } | null>(null)

  const { data: agency, isLoading } = useQuery({
    queryKey: ['agency', agencyId],
    queryFn: async () => {
      const response = await agencyApi.getAgency(agencyId)
      return response.data
    },
    enabled: !!agencyId,
  })

  if (isLoading) {
    return <div>Đang tải...</div>
  }

  if (!agency) {
    return <div>Không tìm thấy đại lý</div>
  }

  const canTransfer = agency.allow_credit_transfer === true

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/agencies')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay Lại
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{agency.username}</h1>
            {canTransfer ? (
              <Button
                size="sm"
                className="gap-1"
                onClick={() => setTransferOpen(true)}
                aria-label="Chuyển credit cho đại lý"
              >
                <Wallet className="h-4 w-4" />
                Chuyển credit
              </Button>
            ) : (
              <Badge variant="secondary">Chuyển credit chưa bật</Badge>
            )}
          </div>
          <p className="text-muted-foreground">Chi tiết đại lý</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Username</span>
              <span className="font-medium">{agency.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Mã đại lý</span>
              <span className="font-medium">{agency.agency_code || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Điện thoại</span>
              <span className="font-medium">{agency.phone || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Trạng thái</span>
              <UserStatusBadge status={agency.status as 'active' | 'locked'} />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ngày tạo</span>
              <span className="font-medium">{formatDate(agency.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Chuyển credit</span>
              {canTransfer ? (
                <Badge variant="success">Bật</Badge>
              ) : (
                <Badge variant="secondary">Tắt</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Số dư</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tổng</span>
              <span className="font-medium">{formatCurrency(agency.balance.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Khả dụng</span>
              <span className="font-medium text-green-600">
                {formatCurrency(agency.balance.available)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tuyến dưới</span>
              <span className="font-medium">{agency.downline_count}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {canTransfer ? (
        <TransferMoneyDialog
          open={transferOpen}
          onOpenChange={setTransferOpen}
          title="Chuyển credit cho đại lý"
          targetLabel={agency.username}
          onSubmit={({ amount, notes }) => agencyApi.transferToAgency(agencyId, { amount, notes })}
          onSuccess={async () => {
            await queryClient.invalidateQueries({ queryKey: ['agency', agencyId] })
            await queryClient.invalidateQueries({ queryKey: ['agencies'] })
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
