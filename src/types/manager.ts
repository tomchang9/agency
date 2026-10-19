export interface ManagerProfile {
  id: number
  username: string
  phone?: string
  balance: number
  role: 'agency' | 'master_agent'
  agency_code?: string
  commission_rate?: number
  credit_limit?: number
  can_credit_transfer?: boolean
  stats: ManagerStats
  downline_count: number
  evo_integration_enabled?: boolean
  sbo_integration_enabled?: boolean
  cfa_integration_enabled?: boolean
  sexy_integration_enabled?: boolean
}

export interface ManagerStats {
  total_bets: number
  total_wagered?: number
  total_wins: number
  total_lost?: number
  win_rate: number
  total_win_amount: number
  total_lost_amount?: number
  downline_count: number
  current_balance: number
  stats_date_from?: string | null
  stats_date_to?: string | null
}

export interface DownlineBetStats {
  date_from: string
  date_to: string
  total_bet_count: number
  total_wagered: number
  total_payout: number
  house_profit: number
  promotion_credit?: number
}

export interface DownlineBetStatsGameItem {
  total_bet_count: number
  total_wagered: number
  total_payout: number
  house_profit: number
}

export interface LiveBet {
  id: number
  session_id: number
  session_ref?: string | null
  room_name?: string | null
  game_type?: string | null
  bet_type: string
  amount: number
  odds: number
  potential_win?: number | null
  placed_at?: string | null
}

export interface LiveBetsMember {
  id: number
  username: string
  pending_bet_count: number
  total_pending_amount: number
  bets: LiveBet[]
}

export interface LiveBetsSummary {
  total_members_with_pending: number
  total_pending_bets: number
  total_pending_amount: number
}

export interface LiveBetsResponse {
  members_with_pending: LiveBetsMember[]
  summary: LiveBetsSummary
}

export interface DashboardStats {
  downline_count: number
  total_volume_30d: number
  total_pending_commission?: number
  total_paid_commission_30d?: number
  member_stats: ManagerStats
  self_bet_stats?: ManagerStats
  downline_bet_stats?: DownlineBetStats
  downline_bet_stats_by_game?: {
    taixiu?: DownlineBetStatsGameItem
    chicken_fight?: DownlineBetStatsGameItem
    evolution?: DownlineBetStatsGameItem
    sbo?: DownlineBetStatsGameItem
    cfa?: DownlineBetStatsGameItem
    sexy?: DownlineBetStatsGameItem
  } | null
  evo_integration_enabled?: boolean
  sbo_integration_enabled?: boolean
  cfa_integration_enabled?: boolean
  sexy_integration_enabled?: boolean
}

export interface EvolutionLedgerRow {
  id: number
  member_id: number
  username: string
  direction: string
  direction_label: string
  amount: number
  house_profit: number | null
  balance_after: number
  status: string
  status_label: string
  game_id: string
  game_name: string | null
  evo_transaction_id: string
  created_at: string | null
}

export interface EvolutionTransactionsPayload {
  house_summary: {
    bet_count: number
    total_wagered: number
    total_payout: number
    house_profit: number
  }
  transactions: EvolutionLedgerRow[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
  date_from: string
  date_to: string
}

export interface SboBetRow {
  id: number
  member_id: number
  username: string
  ref_no: string
  portfolio_label: string
  match_label: string
  bet_type: string
  bet_team: string
  bet_detail: string
  stake: number
  odds: number | null
  house_profit: number | null
  status: string
  status_label: string
  bet_date: string | null
  settle_date: string | null
  sbo_league: string
}

export interface SboTransactionsPayload {
  house_summary: {
    bet_count: number
    total_wagered: number
    total_payout: number
    house_profit: number
  }
  bets: SboBetRow[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
  date_from: string
  date_to: string
}


