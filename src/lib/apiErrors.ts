import type { AxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'

type ApiErrorBody = ApiResponse<unknown> & {
  message?: string
  messages?: string | Record<string, string | string[]>
}

const MESSAGE_MAP: Record<string, string> = {
  'Current password is incorrect': 'Mật khẩu hiện tại không đúng',
  'Failed to change password': 'Không thể đổi mật khẩu, vui lòng thử lại sau',
  'User not found': 'Không tìm thấy tài khoản',
}

const mapMessage = (message: string): string => MESSAGE_MAP[message] ?? message

const firstValidationMessage = (errors: Record<string, string | string[]>): string | null => {
  const firstField = Object.values(errors)[0]
  if (Array.isArray(firstField) && firstField[0]) {
    return String(firstField[0])
  }
  if (typeof firstField === 'string' && firstField) {
    return firstField
  }
  return null
}

const extractCi4Messages = (messages: ApiErrorBody['messages']): string | null => {
  if (typeof messages === 'string' && messages.trim() !== '') {
    return messages
  }

  if (messages && typeof messages === 'object') {
    if (typeof messages.error === 'string' && messages.error.trim() !== '') {
      return messages.error
    }

    return firstValidationMessage(messages)
  }

  return null
}

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Đã xảy ra lỗi, vui lòng thử lại.'
): string => {
  const axiosError = error as AxiosError<ApiErrorBody>
  const data = axiosError.response?.data

  if (!data) {
    return fallback
  }

  const fromMessages = extractCi4Messages(data.messages)
  if (fromMessages) {
    return mapMessage(fromMessages)
  }

  if (typeof data.message === 'string' && data.message.trim() !== '') {
    return mapMessage(data.message)
  }

  if (typeof data.error === 'string' && data.error.trim() !== '') {
    return mapMessage(data.error)
  }

  if (data.errors && typeof data.errors === 'object') {
    const validationMessage = firstValidationMessage(data.errors)
    if (validationMessage) {
      return mapMessage(validationMessage)
    }
  }

  return fallback
}
