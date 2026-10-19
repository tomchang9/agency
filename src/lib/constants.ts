export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
export const API_KEY = import.meta.env.VITE_API_KEY || ''
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || ''
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Agency Management'

if (!API_BASE_URL) {
  console.warn('VITE_API_BASE_URL is not set in .env file')
}

if (!API_KEY) {
  console.warn('VITE_API_KEY is not set in .env file')
}

export const SHOW_COMMISSIONS_UI = false

export const ROLES = {
  AGENCY: 'agency',
  MASTER_AGENT: 'master_agent',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

