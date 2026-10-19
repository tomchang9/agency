import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { agencyApi } from '@/api/agency'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dices, CircleDot, Sparkles, Trophy } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { ROLES } from '@/lib/constants'

export function GameSessionsHub() {
  const { hasRole } = useAuthStore()
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await agencyApi.getProfile()
      return response.data
    },
  })
  const evoEnabled = profile?.evo_integration_enabled === true
  const sboEnabled = profile?.sbo_integration_enabled === true
  const cfaEnabled = profile?.cfa_integration_enabled === true
  const sexyEnabled = profile?.sexy_integration_enabled === true

  const showEvolution = hasRole([ROLES.AGENCY, ROLES.MASTER_AGENT]) && evoEnabled
  const showSbo = hasRole([ROLES.AGENCY, ROLES.MASTER_AGENT]) && sboEnabled
  const cfaOrSexyNote = cfaEnabled || sexyEnabled

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lịch sử game</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Phiên Tài Xỉu, Đá gà
          {showEvolution ? ', Evolution' : ''}
          {showSbo ? ' và SBO' : ''}
          {' '}(downline, góc nhà cái).
          {cfaOrSexyNote && (
            <> Báo cáo CFA / Sexy Casino xem tại Tổng quan và Lịch sử cược thành viên khi được bật.</>
          )}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link to="/game-sessions/taixiu">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Dices className="h-5 w-5" />
                Tài Xỉu
              </CardTitle>
              <CardDescription>Danh sách phiên, tổng cược và lời/lỗ theo cửa.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-primary font-medium">Mở danh sách →</CardContent>
          </Card>
        </Link>
        <Link to="/game-sessions/chicken-fight">
          <Card className="h-full transition-colors hover:bg-muted/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CircleDot className="h-5 w-5" />
                Đá gà
              </CardTitle>
              <CardDescription>Phiên Meron / Hòa / Wala và tổng hợp.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-primary font-medium">Mở danh sách →</CardContent>
          </Card>
        </Link>
        {showEvolution && (
          <Link to="/game-sessions/evolution">
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="h-5 w-5" />
                  Evolution
                </CardTitle>
                <CardDescription>Ledger One Wallet — cược, trả thưởng, lời/lỗ nhà cái.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-primary font-medium">Mở danh sách →</CardContent>
            </Card>
          </Link>
        )}
        {showSbo && (
          <Link to="/game-sessions/sbo">
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5" />
                  SBO
                </CardTitle>
                <CardDescription>Sportsbook / Seamless — lịch sử cược downline.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-primary font-medium">Mở danh sách →</CardContent>
            </Card>
          </Link>
        )}
      </div>
    </div>
  )
}
