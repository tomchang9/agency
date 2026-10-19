import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { endOfMonth, format, startOfMonth } from 'date-fns'
import { agencyApi } from '@/api/agency'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/formatters'
import { SHOW_COMMISSIONS_UI } from '@/lib/constants'
import { useAuthStore } from '@/store/authStore'
import { Input } from '@/components/ui/input'
import { DateRangePresets } from '@/components/ui/date-range-presets'
import {
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  ClipboardList,
  Banknote,
  HandCoins,
  Scale,
} from 'lucide-react'

const formatHouseProfit = (value: number) => {
  const formatted = formatCurrency(Math.abs(value))
  if (value > 0) {
    return { text: `+${formatted}`, className: 'text-emerald-600' }
  }
  if (value < 0) {
    return { text: `-${formatted}`, className: 'text-destructive' }
  }
  return { text: formatted, className: '' }
}

function currentMonthDateRange(): { from: string; to: string } {
  const now = new Date()
  return {
    from: format(startOfMonth(now), 'yyyy-MM-dd'),
    to: format(endOfMonth(now), 'yyyy-MM-dd'),
  }
}

export const Dashboard = () => {
  const { hasRole, role } = useAuthStore()
  const [dateFrom, setDateFrom] = useState<string>(() => currentMonthDateRange().from)
  const [dateTo, setDateTo] = useState<string>(() => currentMonthDateRange().to)
  
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await agencyApi.getProfile()
      return response.data
    },
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', dateFrom, dateTo],
    queryFn: async () => {
      const response = await agencyApi.getStats({
        ...(dateFrom ? { date_from: dateFrom } : {}),
        ...(dateTo ? { date_to: dateTo } : {}),
      })
      return response.data
    },
  })
  
  if ((profileLoading || statsLoading) && !stats) {
    return <div>Đang tải...</div>
  }
  
  const isAgency = role === 'agency'
  const isAgencyOrMaster = hasRole(['agency', 'master_agent'])
  const betRangeLabel = stats?.downline_bet_stats
    ? `${stats.downline_bet_stats.date_from} → ${stats.downline_bet_stats.date_to}`
    : ''

  const selfStats = stats?.self_bet_stats ?? stats?.member_stats
  const downlineWagered = stats?.downline_bet_stats?.total_wagered ?? stats?.total_volume_30d ?? 0
  const houseProfit = stats?.downline_bet_stats?.house_profit ?? 0
  const promotionCredit = stats?.downline_bet_stats?.promotion_credit ?? 0
  const netHouseProfit = houseProfit - promotionCredit
  const houseProfitDisplay = formatHouseProfit(netHouseProfit)

  const evoEnabled = stats?.evo_integration_enabled === true
  const sboEnabled = stats?.sbo_integration_enabled === true
  const cfaEnabled = stats?.cfa_integration_enabled === true
  const sexyEnabled = stats?.sexy_integration_enabled === true
  const gamesLabel = [
    'Tài Xỉu',
    'Đá gà',
    ...(evoEnabled ? ['Evolution'] : []),
    ...(sboEnabled ? ['SBO'] : []),
    ...(cfaEnabled ? ['CFA'] : []),
    ...(sexyEnabled ? ['Sexy Casino'] : []),
  ].join(' + ')
  const downlineStatsHint = isAgency
    ? `Member trực thuộc: ${gamesLabel}, theo ngày đặt cược.`
    : `${gamesLabel}, mọi member trong cây. Theo ngày đặt cược.`
  const gamesShortLabel = [
    'TX',
    'Đá gà',
    ...(evoEnabled ? ['Evolution'] : []),
    ...(sboEnabled ? ['SBO'] : []),
    ...(cfaEnabled ? ['CFA'] : []),
    ...(sexyEnabled ? ['Sexy'] : []),
  ].join(' + ')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tổng quan</h1>
        <p className="text-muted-foreground">Xin chào, {profile?.username}</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Số tài khoản member</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.downline_count || 0}</div>
            <p className="text-xs text-muted-foreground">
              {isAgency ? 'Member trực thuộc đại lý' : 'Tất cả member trong mạng lưới'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng tiền cược (downline)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(downlineWagered)}</div>
            <p className="text-xs text-muted-foreground">
              {gamesShortLabel} · ngày cược
              {betRangeLabel ? ` · ${betRangeLabel}` : ''}
            </p>
          </CardContent>
        </Card>

        {isAgencyOrMaster && stats?.downline_bet_stats && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lợi nhuận nhà cái</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${houseProfitDisplay.className}`}>
                {houseProfitDisplay.text}
              </div>
              <p className="text-xs text-muted-foreground">
                Tiền cược − trả thưởng · theo ngày đặt cược
                {betRangeLabel ? ` · ${betRangeLabel}` : ''}
                {' · '}Đã trừ khuyến mãi: {formatCurrency(promotionCredit)} · theo ngày nhận
              </p>
            </CardContent>
          </Card>
        )}

        {isAgencyOrMaster && SHOW_COMMISSIONS_UI && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoa hồng chờ thanh toán</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.total_pending_commission || 0)}
                </div>
                <p className="text-xs text-muted-foreground">Đang chờ thanh toán</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hoa hồng đã thanh toán</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.total_paid_commission_30d || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {betRangeLabel ? `Trong khoảng: ${betRangeLabel}` : 'Cùng khoảng ngày bộ lọc bên dưới'}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {!isAgencyOrMaster && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Số Dư Hiện Tại</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(profile?.balance || 0)}</div>
              <p className="text-xs text-muted-foreground">Số dư khả dụng</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Khoảng ngày thống kê</CardTitle>
          <CardDescription>
            Mặc định: từ ngày 01 đến cuối tháng hiện tại. Các số tổng hợp, hoa hồng và thống kê downline áp dụng khoảng này.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DateRangePresets
            onRangeChange={(from, to) => {
              setDateFrom(from)
              setDateTo(to)
            }}
          />
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Từ ngày</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Đến ngày</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {isAgencyOrMaster && stats?.downline_bet_stats && (
        <div className="space-y-2">
          <div>
            <h2 className="text-lg font-semibold">Chi tiết cược từ downline</h2>
            <p className="text-sm text-muted-foreground">
              {downlineStatsHint} {betRangeLabel ? `· ${betRangeLabel}` : ''}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Số vé đã quyết toán</CardTitle>
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.downline_bet_stats.total_bet_count}</div>
                <p className="text-xs text-muted-foreground">Vé đã quyết toán (won/lost; Đá gà không tính refunded vào số vé)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng tiền cược</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.downline_bet_stats.total_wagered)}
                </div>
                <p className="text-xs text-muted-foreground">Tổng mức cược (stake)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tổng trả thưởng</CardTitle>
                <HandCoins className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.downline_bet_stats.total_payout)}
                </div>
                <p className="text-xs text-muted-foreground">Gồm thắng, hoàn/refund và hoàn partial (Đá gà)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lợi nhuận nhà cái</CardTitle>
                <Scale className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {(() => {
                  const detail = formatHouseProfit(netHouseProfit)
                  return (
                    <>
                      <div className={`text-2xl font-bold ${detail.className}`}>{detail.text}</div>
                      <p className="text-xs text-muted-foreground">
                        Tiền cược − trả thưởng · vé đã quyết toán · theo ngày đặt cược
                        {betRangeLabel ? ` · ${betRangeLabel}` : ''}
                        {' · '}Đã trừ khuyến mãi: {formatCurrency(promotionCredit)} · theo ngày nhận
                      </p>
                    </>
                  )
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {isAgencyOrMaster && stats?.downline_bet_stats_by_game && (
        <div className="space-y-2">
          <div>
            <h2 className="text-lg font-semibold">Theo từng game</h2>
            <p className="text-sm text-muted-foreground">
              Phân tách lợi nhuận nhà cái theo từng game · theo ngày đặt cược
              {betRangeLabel ? ` · ${betRangeLabel}` : ''}
              . Lợi nhuận từng game chưa trừ khuyến mãi, nên cộng các game sẽ không bằng số tổng.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                { key: 'taixiu', label: 'Tài Xỉu' },
                { key: 'chicken_fight', label: 'Đá gà' },
                ...(evoEnabled ? [{ key: 'evolution' as const, label: 'Evolution' }] : []),
                ...(sboEnabled ? [{ key: 'sbo' as const, label: 'SBO' }] : []),
                ...(cfaEnabled ? [{ key: 'cfa' as const, label: 'CFA' }] : []),
                ...(sexyEnabled ? [{ key: 'sexy' as const, label: 'Sexy Casino' }] : []),
              ] as const
            ).map(({ key, label }) => {
              const gameStats = stats.downline_bet_stats_by_game?.[key]
              if (!gameStats) {
                return null
              }
              const profit = formatHouseProfit(gameStats.house_profit)
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle>{label}</CardTitle>
                    <CardDescription>Vé đã quyết toán trong khoảng ngày đã chọn</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Số vé</span>
                      <span className="font-medium">{gameStats.total_bet_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tổng tiền cược</span>
                      <span className="font-medium">{formatCurrency(gameStats.total_wagered)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tổng trả thưởng</span>
                      <span className="font-medium">{formatCurrency(gameStats.total_payout)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Lợi nhuận nhà cái</span>
                      <span className={`font-medium ${profit.className}`}>{profit.text}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tài khoản đang đăng nhập (không tính downline)</CardTitle>
            <CardDescription>
              Cược của chính đại lý / master, tách biệt số liệu downline ở trên
              {betRangeLabel ? ` · ${betRangeLabel}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Số vé</span>
                <span className="font-medium">{selfStats?.total_bets || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vé thắng</span>
                <span className="font-medium">{selfStats?.total_wins || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tỷ lệ thắng</span>
                <span className="font-medium">{selfStats?.win_rate || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Tổng tiền thắng</span>
                <span className="font-medium">{formatCurrency(selfStats?.total_win_amount || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>Vai trò, mã đại lý và cấu hình</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vai trò</span>
                <span className="font-medium capitalize">{role === 'agency' ? 'Đại lý' : role === 'master_agent' ? 'Đại lý cấp cao' : role}</span>
              </div>
              {profile?.agency_code && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Mã đại lý</span>
                  <span className="font-medium">{profile.agency_code}</span>
                </div>
              )}
              {SHOW_COMMISSIONS_UI && profile?.commission_rate !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tỷ lệ hoa hồng</span>
                  <span className="font-medium">{profile.commission_rate}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

