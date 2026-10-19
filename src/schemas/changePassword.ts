import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Mật khẩu hiện tại là bắt buộc'),
    new_password: z
      .string()
      .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
      .max(50, 'Mật khẩu mới không được quá 50 ký tự'),
    confirm_password: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirm_password'],
  })

export type ChangePasswordForm = z.infer<typeof changePasswordSchema>
