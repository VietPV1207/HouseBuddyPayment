export type AuthMode = 'login' | 'register'

export type RegisterRole = 'customer' | 'helper'

export type AuthUser = {
  _id: string
  phoneNumber: string
  email?: string
  role: string
  accountStatus: string
}

export type AuthSession = {
  token?: string
  user: AuthUser
}

export type ApiResult = {
  message?: string
  error?: string
  token?: string
  otp?: string
  user?: AuthUser
}

export type LoginPayload = {
  email: string
  phoneNumber: string
  password: string
}

export type RegisterCustomerPayload = {
  phoneNumber: string
  email: string
  password: string
  fullName: string
  address?: string
  gender?: string
  age?: number
}

export type RegisterHelperPayload = {
  phoneNumber: string
  email?: string
  password: string
  identityDetails: {
    fullName: string
    identityNumber: string
    experience: string
  }
}

export type VerifyOtpPayload = {
  phoneNumber: string
  email: string
  otpCode: string
}

export type RegisterForm = {
  role: RegisterRole
  fullName: string
  phoneNumber: string
  email: string
  password: string
  address: string
  gender: string
  age: string
  identityNumber: string
  experience: string
}
