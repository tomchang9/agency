export interface MemberBetTotals {
  total_wagered: number
  total_win_amount: number
  total_lost_amount: number
  user_profit_loss?: number
}

export interface DownlineUser {
  id: number
  username: string
  phone?: string
  role: 'member' | 'agency'
  balance: number
  status: 'active' | 'locked'
  created_at: string
  bet_totals?: MemberBetTotals
}

export interface UserDetail extends Omit<DownlineUser, 'balance'> {
  full_name?: string
  balance: {
    total: number
    frozen_for_withdraw: number
    frozen_for_bet: number
    available: number
  }
  stats: {
    total_bets: number
    total_wagered?: number
    total_wins: number
    total_lost?: number
    win_rate: number
    total_win_amount: number
    total_lost_amount?: number
    user_profit_loss?: number
    stats_date_from?: string | null
    stats_date_to?: string | null
  }
  pending_bet_count?: number
}

export interface UserBet {
  id: number | string
  session_id?: number | string | null
  room_id?: number
  room_name?: string | null
  member_id?: number
  bet_type?: string
  amount?: number
  total_stake?: number
  odds?: number | null
  potential_win?: number | null
  actual_win?: number | null
  profit_loss?: number | null
  net_pl?: number | null
  status?: string
  game_type?: string
  placed_at?: string
  settled_at?: string
  session_ref?: string
  result_data?: unknown
  settlement_kind?: string | null
  settlement_kind_label_vi?: string | null
  direction?: string
  direction_label?: string
  game_id?: string
  game_name?: string | null
  evo_transaction_id?: string
  status_label?: string
  ref_id?: string
  enrich_status?: string
  enrich_label_vi?: string
  table_name?: string | null
  bet_label_vi?: string | null
  house_profit?: number | string | null
  sbo_ref_no?: string
  sbo_portfolio?: string
  sbo_portfolio_label?: string
  sbo_league?: string
  sbo_match_label?: string
  bets?: Array<{
    wallet_tx_id?: number
    bet_label_vi?: string
    amount?: number
    payout?: number
    status?: string
  }>
}

export interface Transaction {
  id: number
  user_id: number
  username?: string
  type: string
  type_label_vi?: string
  subtype?: string | null
  amount: number
  status: 'pending' | 'completed' | 'cancelled' | 'success' | 'failed'
  reference: string
  description?: string | null
  metadata?: Record<string, unknown> | null
  created_at: string
  updated_at?: string
}

export interface Deposit {
  id: number
  user_id: number
  amount: number
  reference: string
  status: 'pending' | 'completed' | 'cancelled'
  created_at: string
}

export interface Withdrawal {
  id: number
  member_id: number
  amount: number
  bank_name: string
  account_number: string
  account_name: string
  status: 'pending' | 'approved' | 'rejected' | 'agency_approved' | 'master_agent_approved'
  created_at: string
}

export interface MemberTransfer {
  id: number
  user_id: number
  amount: number
  reference: string
  status: 'success' | 'pending' | 'failed'
  transferred_from?: number
  transferred_from_username?: string
  description?: string
  transfer_reference?: string
  balance_before?: number
  balance_after?: number
  created_at: string
}

export interface Commission {
  id: number
  recipient_id: number
  recipient_role: 'agency' | 'master_agent'
  source_id: number
  period_type: 'daily' | 'weekly' | 'monthly'
  period_date: string
  betting_volume: number
  commission_rate: number
  commission_amount: number
  status: 'pending' | 'paid' | 'cancelled'
  paid_at?: string
  notes?: string
  created_at: string
}
