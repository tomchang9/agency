import { Badge } from '@/components/ui/badge'

interface UserStatusBadgeProps {
  status: 'active' | 'locked'
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  return (
    <Badge variant={status === 'active' ? 'success' : 'destructive'}>
      {status === 'active' ? 'Hoạt Động' : 'Đã Khóa'}
    </Badge>
  )
}


