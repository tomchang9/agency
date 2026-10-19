export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export interface PaginationParams {
  page?: number
  per_page?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
}

export interface ApiResponseWithPagination<T> {
  success: boolean
  data: T[]
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages?: number
  }
  error?: string
  errors?: Record<string, string[]>
}


