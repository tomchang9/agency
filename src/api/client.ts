import axios, { AxiosError } from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { API_BASE_URL, API_KEY } from '@/lib/constants'
import type { ApiResponse } from '@/types/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token')
    
    if (API_KEY) {
      config.headers['X-API-Key'] = API_KEY
    } else {
      const apiKeyFromStorage = localStorage.getItem('api_key')
      if (apiKeyFromStorage) {
        config.headers['X-API-Key'] = apiKeyFromStorage
      } else {
        console.warn('API Key is missing. Please set VITE_API_KEY in .env file')
      }
    }
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 401) {
        localStorage.removeItem('jwt_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      
      if (status === 403) {
        console.error('Access denied:', data.error)
      }
    }
    
    return Promise.reject(error)
  }
)

export default apiClient

