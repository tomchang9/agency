import apiClient from './client'
import type { ApiResponse, PaginatedResponse, ApiResponseWithPagination } from '@/types/api'
import type {
  ManagerProfile,
  DashboardStats,
  LiveBetsResponse,
  EvolutionTransactionsPayload,
  SboTransactionsPayload,
} from '@/types/manager'
import type { DownlineUser, UserDetail, UserBet, Deposit, Withdrawal, MemberTransfer } from '@/types/user'
import type {
  AgencyChickenSessionRow,
  AgencyGameRoom,
  AgencyGameType,
  AgencySessionDetailPayload,
  AgencySessionListPayload,
  AgencyTaiXiuSessionRow,
} from '@/types/gameSessions'

export interface CreateMemberRequest {
  username: string
  password: string
  phone?: string
}

export interface TransferHistoryItem {
  id: number
  reference: string
  amount: number
  transferred_to: number | null
  transferred_to_username: string | null
  description: string
  balance_before: number | null
  balance_after: number | null
  transfer_type: string | null
  linked_transaction_id: number | null
  created_at: string
}

export interface AgencyListItem {
  id: number
  username: string
  phone: string
  balance: number
  status: string
  agency_code: string
  commission_rate: number
  allow_credit_transfer?: boolean
  downline_count: number
  stats: Record<string, unknown>
  created_at: string
}

export interface AgencyDetail {
  id: number
  username: string
  phone?: string
  balance: {
    total: number
    frozen_for_withdraw: number
    frozen_for_bet: number
    available: number
  }
  status: string
  role: string
  agency_code?: string
  commission_rate?: number
  credit_limit?: number
  allow_credit_transfer?: boolean
  downline_count: number
  stats?: Record<string, unknown>
  created_at: string
}

export interface TransferRequest {
  amount: number
  notes?: string
}

export const agencyApi = {
  getProfile: async (): Promise<ApiResponse<ManagerProfile>> => {
    const response = await apiClient.get<ApiResponse<ManagerProfile>>('/agency/profile')
    return response.data
  },

  getLiveBets: async (): Promise<ApiResponse<LiveBetsResponse>> => {
    const response = await apiClient.get<ApiResponse<LiveBetsResponse>>('/agency/live-bets')
    return response.data
  },

  getGameRooms: async (game_type: AgencyGameType): Promise<ApiResponse<AgencyGameRoom[]>> => {
    const response = await apiClient.get<ApiResponse<AgencyGameRoom[]>>('/agency/game/rooms', {
      params: { game_type },
    })
    return response.data
  },

  getSessionsTaixiu: async (params: {
    date_from?: string
    date_to?: string
    room_id?: number
    status?: string
    session_id_from?: number
    session_id_to?: number
    no_result?: 0 | 1
    bao?: 0 | 1
    dice_1?: number
    dice_2?: number
    dice_3?: number
    page?: number
  }): Promise<ApiResponse<AgencySessionListPayload<AgencyTaiXiuSessionRow>>> => {
    const response = await apiClient.get<ApiResponse<AgencySessionListPayload<AgencyTaiXiuSessionRow>>>(
      '/agency/game/sessions/taixiu',
      { params }
    )
    return response.data
  },

  getSessionsChickenFight: async (params: {
    date_from?: string
    date_to?: string
    room_id?: number
    status?: string
    session_id_from?: number
    session_id_to?: number
    no_result?: 0 | 1
    page?: number
  }): Promise<ApiResponse<AgencySessionListPayload<AgencyChickenSessionRow>>> => {
    const response = await apiClient.get<ApiResponse<AgencySessionListPayload<AgencyChickenSessionRow>>>(
      '/agency/game/sessions/chicken-fight',
      { params }
    )
    return response.data
  },

  getSessionTaixiuDetail: async (sessionId: number): Promise<ApiResponse<AgencySessionDetailPayload>> => {
    const response = await apiClient.get<ApiResponse<AgencySessionDetailPayload>>(
      `/agency/game/sessions/taixiu/${sessionId}`
    )
    return response.data
  },

  getSessionChickenFightDetail: async (sessionId: number): Promise<ApiResponse<AgencySessionDetailPayload>> => {
    const response = await apiClient.get<ApiResponse<AgencySessionDetailPayload>>(
      `/agency/game/sessions/chicken-fight/${sessionId}`
    )
    return response.data
  },

  getStats: async (params?: {
    date_from?: string
    date_to?: string
  }): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/agency/stats', { params })
    return response.data
  },

  getEvolutionTransactions: async (params?: {
    date_from?: string
    date_to?: string
    user_search?: string
    direction?: string
    status?: string
    game_id?: string
    page?: number
    per_page?: number
  }): Promise<ApiResponse<EvolutionTransactionsPayload>> => {
    const response = await apiClient.get<ApiResponse<EvolutionTransactionsPayload>>(
      '/agency/evolution/transactions',
      { params }
    )
    return response.data
  },

  getSboTransactions: async (params?: {
    date_from?: string
    date_to?: string
    user_search?: string
    status?: string
    page?: number
    per_page?: number
  }): Promise<ApiResponse<SboTransactionsPayload>> => {
    const response = await apiClient.get<ApiResponse<SboTransactionsPayload>>(
      '/agency/sbo/transactions',
      { params }
    )
    return response.data
  },

  getDownline: async (params?: { role?: string }): Promise<ApiResponse<DownlineUser[]>> => {
    const response = await apiClient.get<ApiResponse<DownlineUser[]>>('/agency/downline', {
      params: params?.role ? { role: params.role } : undefined
    })
    return response.data
  },

  createMember: async (data: CreateMemberRequest): Promise<ApiResponse<{ id: number; username: string }>> => {
    const response = await apiClient.post<ApiResponse<{ id: number; username: string }>>('/agency/members', data)
    return response.data
  },

  listMembers: async (params?: {
    page?: number
    per_page?: number
    search?: string
    status?: string
    date_from?: string
    date_to?: string
  }): Promise<ApiResponseWithPagination<DownlineUser>> => {
    const response = await apiClient.get<ApiResponseWithPagination<DownlineUser>>('/agency/members', { params })
    return response.data
  },

  getMember: async (
    memberId: number,
    params?: { date_from?: string; date_to?: string }
  ): Promise<ApiResponse<UserDetail>> => {
    const response = await apiClient.get<ApiResponse<UserDetail>>(`/agency/members/${memberId}`, { params })
    return response.data
  },

  banMember: async (memberId: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/agency/members/${memberId}/ban`)
    return response.data
  },

  unbanMember: async (memberId: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/agency/members/${memberId}/unban`)
    return response.data
  },

  getMemberDeposits: async (
    memberId: number,
    params?: {
      page?: number
      per_page?: number
    }
  ): Promise<ApiResponse<PaginatedResponse<Deposit>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Deposit>>>(
      `/agency/members/${memberId}/deposits`,
      { params }
    )
    return response.data
  },

  getMemberWithdrawals: async (
    memberId: number,
    params?: {
      page?: number
      per_page?: number
    }
  ): Promise<ApiResponse<PaginatedResponse<Withdrawal>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Withdrawal>>>(
      `/agency/members/${memberId}/withdrawals`,
      { params }
    )
    return response.data
  },

  getMemberTransfers: async (
    memberId: number,
    params?: {
      page?: number
      per_page?: number
    }
  ): Promise<ApiResponse<PaginatedResponse<MemberTransfer>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<MemberTransfer>>>(
      `/agency/members/${memberId}/transfers`,
      { params }
    )
    return response.data
  },

  getMemberBets: async (
    memberId: number,
    params?: {
      page?: number
      per_page?: number
      game_type?: string
      status?: string
      type?: string
      date_from?: string
      date_to?: string
    }
  ): Promise<ApiResponseWithPagination<UserBet>> => {
    const response = await apiClient.get<ApiResponseWithPagination<UserBet>>(`/agency/members/${memberId}/bets`, {
      params
    })
    return response.data
  },

  getTransferHistory: async (params?: {
    page?: number
    per_page?: number
    target_id?: number
    date_from?: string
    date_to?: string
  }): Promise<ApiResponse<PaginatedResponse<TransferHistoryItem>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<TransferHistoryItem>>>('/agency/transfers', {
      params
    })
    return response.data
  },

  transferToMember: async (
    memberId: number,
    data: TransferRequest
  ): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      `/agency/members/${memberId}/transfer`,
      data
    )
    return response.data
  },

  transferToAgency: async (
    agencyId: number,
    data: TransferRequest
  ): Promise<ApiResponse<Record<string, unknown>>> => {
    const response = await apiClient.post<ApiResponse<Record<string, unknown>>>(
      `/agency/agencies/${agencyId}/transfer`,
      data
    )
    return response.data
  },

  listAgencies: async (params?: {
    page?: number
    per_page?: number
    search?: string
  }): Promise<ApiResponseWithPagination<AgencyListItem>> => {
    const response = await apiClient.get<ApiResponseWithPagination<AgencyListItem>>('/agency/agencies', {
      params
    })
    return response.data
  },

  getAgency: async (agencyId: number): Promise<ApiResponse<AgencyDetail>> => {
    const response = await apiClient.get<ApiResponse<AgencyDetail>>(`/agency/agencies/${agencyId}`)
    return response.data
  },
}

