export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  data: {
    token: string
    user: {
      id: number
      username: string
      role: 'agency' | 'master_agent'
      status: string
    }
  }
}

export interface User {
  id: number
  username: string
  phone?: string
  role: 'agency' | 'master_agent' | 'member'
  status: 'active' | 'locked'
}


