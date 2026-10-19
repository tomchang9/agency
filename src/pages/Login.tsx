import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { getApiErrorMessage } from '@/lib/apiErrors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { API_KEY } from '@/lib/constants'

const loginSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập là bắt buộc'),
  password: z.string().min(1, 'Mật khẩu là bắt buộc'),
  apiKey: z.string().optional(),
}).refine((data) => {
  return data.apiKey || API_KEY
}, {
  message: 'API Key là bắt buộc. Vui lòng đặt VITE_API_KEY trong file .env hoặc nhập thủ công.',
  path: ['apiKey'],
})

type LoginForm = z.infer<typeof loginSchema>

export const Login = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login } = useAuthStore()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const passwordChanged = searchParams.get('passwordChanged') === '1'
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      apiKey: API_KEY || '',
    },
  })
  
  const onSubmit = async (data: LoginForm) => {
    setError(null)
    setLoading(true)
    
    try {
      const apiKeyToUse = data.apiKey || API_KEY
      if (apiKeyToUse && !API_KEY) {
        localStorage.setItem('api_key', apiKeyToUse)
      }
      
      const response = await authApi.login({
        username: data.username,
        password: data.password,
      })
      
      if (response.success && response.data) {
        const user = {
          ...response.data.user,
          status: (response.data.user.status === 'active' || response.data.user.status === 'locked') 
            ? response.data.user.status 
            : 'active' as 'active' | 'locked'
        }
        login(user, response.data.token)
        navigate('/dashboard')
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.')
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Đăng nhập thất bại. Vui lòng thử lại.'))
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Đăng Nhập</CardTitle>
          <CardDescription>Nhập thông tin đăng nhập để truy cập bảng quản lý đại lý</CardDescription>
        </CardHeader>
        <CardContent>
          {passwordChanged ? (
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              Đổi mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.
            </div>
          ) : null}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!API_KEY && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="text"
                  placeholder="Nhập API Key"
                  {...register('apiKey')}
                />
                {errors.apiKey && (
                  <p className="text-sm text-destructive">{errors.apiKey.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Hoặc đặt VITE_API_KEY trong file .env của bạn
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Tên Đăng Nhập</Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mật Khẩu</Label>
              <Input
                id="password"
                type="password"
                placeholder="Nhập mật khẩu"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

