import type {
  ApiResult,
  LoginPayload,
  RegisterCustomerPayload,
  RegisterHelperPayload,
  VerifyOtpPayload,
} from '../types/auth'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:9999'

async function postAuth(
  path: string,
  body: Record<string, unknown>,
): Promise<ApiResult> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await response.json()) as ApiResult

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Request failed')
  }

  return data
}

export function login(payload: LoginPayload) {
  return postAuth('/api/auth/login', payload)
}

export function registerCustomer(payload: RegisterCustomerPayload) {
  return postAuth('/api/auth/register/customer', payload)
}

export function registerHelper(payload: RegisterHelperPayload) {
  return postAuth('/api/auth/register/helper', payload)
}

export function verifyOtp(payload: VerifyOtpPayload) {
  return postAuth('/api/auth/verify-otp', payload)
}

export function resendOtp(payload: Omit<VerifyOtpPayload, 'otpCode'>) {
  return postAuth('/api/auth/resend-otp', payload)
}

export function requestLoginOtp(payload: Omit<VerifyOtpPayload, 'otpCode'>) {
  return postAuth('/api/auth/login-otp/request', payload)
}

export function verifyLoginOtp(payload: VerifyOtpPayload) {
  return postAuth('/api/auth/login-otp/verify', payload)
}
