import { useState } from 'react'
import type { FormEvent } from 'react'
import { LoginScreen } from '../components/auth/LoginScreen'
import { OtpScreen } from '../components/auth/OtpScreen'
import { RegisterScreen } from '../components/auth/RegisterScreen'
import {
  registerCustomer,
  registerHelper,
  requestLoginOtp,
  resendOtp,
  verifyLoginOtp,
  verifyOtp,
} from '../services/authApi'
import { saveSession } from '../services/sessionStorage'
import type {
  AuthMode,
  AuthSession,
  RegisterCustomerPayload,
  RegisterForm as RegisterFormValues,
  RegisterHelperPayload,
} from '../types/auth'

type AuthPageProps = {
  onAuthenticated: (session: AuthSession) => void
  initialMode?: AuthMode
  onExit?: () => void
}

type OtpFlow = 'login' | 'register' | null

const emptyRegister: RegisterFormValues = {
  role: 'customer',
  fullName: '',
  phoneNumber: '',
  email: '',
  password: '',
  address: '',
  gender: '',
  age: '',
  identityNumber: '',
  experience: '',
}

export function AuthPage({ onAuthenticated, initialMode, onExit }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode || 'login')
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [registerForm, setRegisterForm] = useState(emptyRegister)
  const [otpFlow, setOtpFlow] = useState<OtpFlow>(null)
  const [otpCode, setOtpCode] = useState('')
  const [pendingIdentifier, setPendingIdentifier] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState('')
  const [loginStatus, setLoginStatus] = useState('')
  const [otpError, setOtpError] = useState('')
  const [resendStatus, setResendStatus] = useState('')

  const resetFeedback = () => {
    setError('')
    setLoginStatus('')
    setOtpError('')
  }

  const handleRequestLoginOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetFeedback()
    setIsLoading(true)

    try {
      await requestLoginOtp({
        phoneNumber: loginIdentifier,
        email: loginIdentifier,
      })
      setOtpFlow('login')
      setPendingIdentifier(loginIdentifier)
      setOtpCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi mã OTP lúc này')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetFeedback()
    setIsLoading(true)

    try {
      if (registerForm.role === 'customer') {
        await registerCustomer({
          phoneNumber: registerForm.phoneNumber,
          email: registerForm.email,
          password: registerForm.password,
          fullName: registerForm.fullName,
          address: registerForm.address || undefined,
          gender: registerForm.gender || undefined,
          age: registerForm.age ? Number(registerForm.age) : undefined,
        } satisfies RegisterCustomerPayload)
      } else {
        await registerHelper({
          phoneNumber: registerForm.phoneNumber,
          email: registerForm.email || undefined,
          password: registerForm.password,
          identityDetails: {
            fullName: registerForm.fullName,
            identityNumber: registerForm.identityNumber,
            experience: registerForm.experience,
          },
        } satisfies RegisterHelperPayload)
      }

      const identifier = registerForm.phoneNumber || registerForm.email

      setOtpFlow('register')
      setPendingIdentifier(identifier)
      setOtpCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đăng ký lúc này')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setOtpError('')
    setIsLoading(true)

    try {
      if (otpFlow === 'login') {
        const data = await verifyLoginOtp({
          phoneNumber: pendingIdentifier,
          email: pendingIdentifier,
          otpCode,
        })
        saveSession(data.token, data.user)
        if (data.user) {
          onAuthenticated({ token: data.token, user: data.user })
        }
        return
      }

      const data = await verifyOtp({
        phoneNumber: pendingIdentifier,
        email: pendingIdentifier,
        otpCode,
      })
      setOtpFlow(null)
      setPendingIdentifier('')
      setOtpCode('')
      setMode('login')
      setLoginIdentifier(pendingIdentifier)
      setLoginStatus(data.message || 'Xác thực tài khoản thành công, mời bạn đăng nhập')
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Không thể xác thực mã OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setOtpError('')
    setResendStatus('')
    setIsResending(true)

    try {
      const data =
        otpFlow === 'login'
          ? await requestLoginOtp({ phoneNumber: pendingIdentifier, email: pendingIdentifier })
          : await resendOtp({ phoneNumber: pendingIdentifier, email: pendingIdentifier })
      setResendStatus(data.message || 'Đã gửi lại mã OTP mới')
      setOtpCode('')
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Không thể gửi lại mã OTP')
    } finally {
      setIsResending(false)
    }
  }

  const handleCancelOtp = () => {
    setOtpFlow(null)
    setPendingIdentifier('')
    setOtpCode('')
    setOtpError('')
    setResendStatus('')
  }

  const handleGoToRegister = () => {
    resetFeedback()
    setMode('register')
  }

  const handleGoToLogin = () => {
    resetFeedback()
    setMode('login')
  }

  if (otpFlow && pendingIdentifier) {
    return (
      <OtpScreen
        identifier={pendingIdentifier}
        otpCode={otpCode}
        isLoading={isLoading}
        isResending={isResending}
        error={otpError}
        resendStatus={resendStatus}
        onChange={setOtpCode}
        onSubmit={handleVerifyOtp}
        onResend={handleResendOtp}
        onBack={handleCancelOtp}
      />
    )
  }

  if (mode === 'register') {
    return (
      <RegisterScreen
        form={registerForm}
        isLoading={isLoading}
        error={error}
        onChange={setRegisterForm}
        onSubmit={handleRegister}
        onBack={handleGoToLogin}
      />
    )
  }

  return (
    <LoginScreen
      identifier={loginIdentifier}
      isLoading={isLoading}
      error={error}
      status={loginStatus}
      onIdentifierChange={setLoginIdentifier}
      onSubmit={handleRequestLoginOtp}
      onGoToRegister={handleGoToRegister}
      onBack={onExit}
    />
  )
}
