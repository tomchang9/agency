import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { agencyApi } from '@/api/agency'
import type { CreateMemberRequest } from '@/api/agency'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FeedbackDialog } from '@/components/ui/feedback-dialog'

interface CreateMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export const CreateMemberDialog = ({ open, onOpenChange, onSuccess }: CreateMemberDialogProps) => {
  const [formData, setFormData] = useState<CreateMemberRequest>({
    username: '',
    password: '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedback, setFeedback] = useState<{
    title: string
    description?: string
    variant: 'success' | 'error'
  } | null>(null)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateMemberRequest) => agencyApi.createMember(data),
    onSuccess: (response) => {
      if (response.success) {
        setFeedback({
          title: 'Tạo thành viên thành công',
          description: response.data?.username
            ? `Thành viên ${response.data.username} đã được tạo thành công.`
            : 'Yêu cầu tạo thành viên đã được xử lý thành công.',
          variant: 'success',
        })
        setFeedbackOpen(true)
        queryClient.invalidateQueries({ queryKey: ['members'] })
        queryClient.invalidateQueries({ queryKey: ['downline'] })
        setFormData({ username: '', password: '', phone: '' })
        setErrors({})
        onOpenChange(false)
        onSuccess?.()
      } else {
        setFeedback({
          title: 'Không thể tạo thành viên',
          description: response.error || 'Vui lòng thử lại sau.',
          variant: 'error',
        })
        setFeedbackOpen(true)
      }
    },
    onError: (error: unknown) => {
      const errorResponse = error as {
        response?: { data?: { error?: string; errors?: Record<string, string> } }
      }
      const errorMessage = errorResponse.response?.data?.error || 'Không thể tạo thành viên'
      const errorDetails = errorResponse.response?.data?.errors

      if (errorDetails) {
        setErrors(errorDetails)
      } else {
        setFeedback({
          title: 'Không thể tạo thành viên',
          description: errorMessage,
          variant: 'error',
        })
        setFeedbackOpen(true)
      }
    },
  })

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự'
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Số điện thoại phải có ít nhất 10 ký tự'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    const submitData: CreateMemberRequest = {
      username: formData.username.trim(),
      password: formData.password,
      ...(formData.phone?.trim() && { phone: formData.phone.trim() }),
    }

    mutation.mutate(submitData)
  }

  const handleChange = (field: keyof CreateMemberRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo Thành Viên Mới</DialogTitle>
            <DialogDescription>Tạo tài khoản thành viên mới cho đại lý của bạn</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên Đăng Nhập *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  disabled={mutation.isPending}
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật Khẩu *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Nhập mật khẩu"
                  disabled={mutation.isPending}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số Điện Thoại (Tùy Chọn)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                  disabled={mutation.isPending}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
                Hủy
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Đang tạo...' : 'Tạo Thành Viên'}
              </Button>
            </DialogFooter>
          </form>
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
    </>
  )
}

