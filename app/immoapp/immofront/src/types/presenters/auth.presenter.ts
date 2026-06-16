export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'client' | 'staff'
  avatar?: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface StaffLoginResponse extends AuthResponse {
  needsOnboarding: boolean
  onboardingToken?: string
}

export interface LoginError {
  code: string
  message: string
}
