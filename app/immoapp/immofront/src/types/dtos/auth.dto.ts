export interface LoginDTO {
  email: string
  password: string
}

export interface RegisterDTO {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface StaffLoginDTO {
  username: string
  password: string
}

export interface StaffOnboardingDTO {
  onboardingToken: string
  firstName: string
  lastName: string
  email: string
  phone?: string
}


