export type AgencyGameType = 'taixiu' | 'chicken_fight'

export interface AgencyGameRoom {
  id: number
  name: string
  room_code: string
  game_type: string
}

export interface AgencySessionListFilters {
  date_from: string
  date_to: string
  room_id: number | null
  status: string
}

export interface AgencySessionPagination {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface BetTypeTotals {
  total_amount?: number
  total_payout?: number
  profit?: number | null
}

export interface AgencyTaiXiuSessionRow {
  id: number
  room_id: number
  room_name: string
  status: string
  game_type: string
  session_ref: string | null
  start_time: string | null
  result_time: string | null
  updated_at: string | null
  dice_1: number | null
  dice_2: number | null
  dice_3: number | null
  result_data: unknown
  total_bets: number
  total_amount: number
  total_payout: number
  by_type: Record<string, BetTypeTotals>
  display_profit: number
  bao_machine_amount: number
}

export interface AgencyChickenSessionRow {
  id: number
  room_id: number
  room_name: string
  status: string
  game_type: string
  session_ref: string | null
  start_time: string | null
  result_time: string | null
  updated_at: string | null
  dice_1: number | null
  dice_2: number | null
  dice_3: number | null
  result_data: unknown
  total_bets: number
  total_amount: number
  total_payout: number
  by_type: Record<string, BetTypeTotals>
}

export interface AgencySessionListPayload<T> {
  filters: AgencySessionListFilters
  sessions: T[]
  summary: Record<string, unknown>
  pagination: AgencySessionPagination
}

export interface AgencySessionBet {
  id: number
  member_id: number
  username: string
  phone: string
  bet_type: string
  amount: number
  odds: number
  potential_win: number
  actual_win: number | null
  status: string
  placed_at: string | null
  settlement_kind?: string | null
  settlement_kind_label_vi?: string | null
}

export interface AgencySessionDetailPayload {
  session: {
    id: number
    room_id: number
    status: string
    game_type: string
    session_ref: string | null
    start_time: string | null
    result_time: string | null
    updated_at: string | null
    dice_1: number | null
    dice_2: number | null
    dice_3: number | null
    result_data: unknown
    total_bets: number
    total_amount: number
    total_payout: number
  }
  room: { id: number; name: string; room_code: string } | null
  bet_stats: Record<string, unknown>
  taixiu_display: Record<string, unknown> | null
  winning_bets: AgencySessionBet[]
  bets: AgencySessionBet[]
}
