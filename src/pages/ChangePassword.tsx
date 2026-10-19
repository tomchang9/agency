import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { profileApi } from '@/api/profile'
import { useAuthStore } from '@/store/authStore'
import { changePasswordSchema, type ChangePasswordForm } from '@/schemas/changePassword'
import { getApiErrorMessage } from '@/lib/apiErrors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FeedbackDialog } from '@/components/ui/feedback-dialog'

export const ChangePassword = () => {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)
  const logoutAfterSuccessRef = useRef(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordForm) => {
    setSubmitError(null)

    try {
      const response = await profileApi.changePassword(data)
      if (!response.success) {
        setSubmitError('Không thể đổi mật khẩu, vui lòng thử lại.')
        return
      }
      logoutAfterSuccessRef.current = true
      setSuccessOpen(true)
    } catch (error: unknown) {
      setSubmitError(getApiErrorMessage(error, 'Không thể đổi mật khẩu, vui lòng thử lại.'))
    }
  }

  const handleSuccessDialogChange = (open: boolean) => {
    setSuccessOpen(open)
    if (!open && logoutAfterSuccessRef.current) {
      logoutAfterSuccessRef.current = false
      logout()
      navigate('/login?passwordChanged=1', { replace: true })
    }
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/dashboard')
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Cần nhập mật khẩu hiện tại để xác nhận.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Mật khẩu hiện tại</Label>
              <Input
                id="current_password"
                type="password"
                autoComplete="current-password"
                {...register('current_password')}
              />
              {errors.current_password ? (
                <p className="text-sm text-destructive">{errors.current_password.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">Mật khẩu mới</Label>
              <Input
                id="new_password"
                type="password"
                autoComplete="new-password"
                {...register('new_password')}
              />
              {errors.new_password ? (
                <p className="text-sm text-destructive">{errors.new_password.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirm_password"
                type="password"
                autoComplete="new-password"
                {...register('confirm_password')}
              />
              {errors.confirm_password ? (
                <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
              ) : null}
            </div>

            {submitError ? (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{submitError}</div>
            ) : null}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Quay lại
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <FeedbackDialog
        open={successOpen}
        onOpenChange={handleSuccessDialogChange}
        title="Đổi mật khẩu thành công"
        description="Vui lòng đăng nhập lại bằng mật khẩu mới."
        variant="success"
        actionLabel="Đăng nhập lại"
      />
    </div>
  )
}
