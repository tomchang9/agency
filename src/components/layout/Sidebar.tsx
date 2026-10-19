import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROLES, SHOW_COMMISSIONS_UI } from '@/lib/constants'
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  FileText,
  Menu,
  Radio,
  History,
  Building2,
  ArrowLeftRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Bảng Điều Khiển', path: '/dashboard' },
  { icon: Users, label: 'Thành Viên', path: '/users' },
  {
    icon: Building2,
    label: 'Đại Lý',
    path: '/agencies',
    allowedRoles: [ROLES.MASTER_AGENT],
  },
  {
    icon: ArrowLeftRight,
    label: 'Chuyển Credit',
    path: '/transfers',
    allowedRoles: [ROLES.AGENCY, ROLES.MASTER_AGENT],
  },
  { icon: Radio, label: 'Đang Cược', path: '/live-bets' },
  {
    icon: History,
    label: 'Lịch Sử Phiên',
    path: '/game-sessions',
    allowedRoles: [ROLES.AGENCY, ROLES.MASTER_AGENT],
  },
  { 
    icon: TrendingUp, 
    label: 'Hoa Hồng', 
    path: '/commissions',
    allowedRoles: [ROLES.AGENCY, ROLES.MASTER_AGENT]
  },
  { icon: FileText, label: 'Giao Dịch', path: '/transactions' },
]

export const Sidebar = () => {
  const location = useLocation()
  const { hasRole } = useAuthStore()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  const filteredMenuItems = menuItems.filter(item => {
    if (item.path === '/commissions' && !SHOW_COMMISSIONS_UI) {
      return false
    }
    if (item.allowedRoles) {
      return hasRole(item.allowedRoles)
    }
    return true
  })
  
  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-white transition-transform lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col pt-16 lg:pt-0">
          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.path === '/game-sessions'
                  ? location.pathname.startsWith('/game-sessions')
                  : item.path === '/agencies'
                    ? location.pathname.startsWith('/agencies')
                    : location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
      
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}


