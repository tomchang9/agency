import apiClient from './client'
import type { ApiResponse, PaginatedResponse, ApiResponseWithPagination } from '@/types/api'
import type { ManagerProfile, DashboardStats } from '@/types/manager'
import type { DownlineUser, UserDetail, UserBet, Deposit, Withdrawal, Commission, Transaction } from '@/types/user'

export const managerApi = {
  getProfile: async (): Promise<ApiResponse<ManagerProfile>> => {
    const response = await apiClient.get<ApiResponse<ManagerProfile>>('/manager/profile')
    return response.data
  },
  
  getDownline: async (params?: { role?: string }): Promise<ApiResponse<DownlineUser[]>> => {
    const response = await apiClient.get<ApiResponse<DownlineUser[]>>('/manager/downline', { 
      params: params?.role ? { role: params.role } : undefined 
    })
    return response.data
  },
  
  getUserDetail: async (userId: number): Promise<ApiResponse<UserDetail>> => {
    const response = await apiClient.get<ApiResponse<UserDetail>>(`/manager/users/${userId}`)
    return response.data
  },
  
  getUserBets: async (
    userId: number,
    params?: {
      page?: number
      per_page?: number
      game_type?: string
      status?: string
      type?: string
    }
  ): Promise<ApiResponse<PaginatedResponse<UserBet>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<UserBet>>>(`/manager/users/${userId}/bets`, { params })
    return response.data
  },
  
  lockUser: async (userId: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/manager/users/${userId}/lock`)
    return response.data
  },
  
  unlockUser: async (userId: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/manager/users/${userId}/unlock`)
    return response.data
  },
  
  getPendingDeposits: async (): Promise<ApiResponse<Deposit[]>> => {
    const response = await apiClient.get<ApiResponse<Deposit[]>>('/manager/deposits/pending')
    return response.data
  },
  
  approveDeposit: async (depositId: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/manager/deposits/${depositId}/approve`)
    return response.data
  },
  
  getPendingWithdrawals: async (): Promise<ApiResponse<Withdrawal[]>> => {
    const response = await apiClient.get<ApiResponse<Withdrawal[]>>('/manager/withdrawals/pending')
    return response.data
  },
  
  approveWithdrawal: async (withdrawalId: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/manager/withdrawals/${withdrawalId}/approve`)
    return response.data
  },
  
  getCommissions: async (params?: {
    date_from?: string
    date_to?: string
    status?: string
  }): Promise<ApiResponse<Commission[]>> => {
    const response = await apiClient.get<ApiResponse<Commission[]>>('/manager/commissions', { params })
    return response.data
  },
  
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/manager/stats')
    return response.data
  },
  
  getTransactions: async (params?: {
    member_search?: string
    type?: string
    status?: string
    date_from?: string
    date_to?: string
    page?: number
    per_page?: number
  }): Promise<ApiResponseWithPagination<Transaction>> => {
    const response = await apiClient.get<ApiResponseWithPagination<Transaction>>('/manager/transactions', { params })
    return response.data
  },
}

