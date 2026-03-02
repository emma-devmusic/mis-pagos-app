export type Currency = 'ARS' | 'USD' | 'EUR'

export type AuthUser = {
  uid: string
  fullName: string
  email: string
  photoUrl?: string | null
  phone?: string
  currency?: Currency
  notificationsEnabled?: boolean
}

export type LoginRequest = {
  fullName: string
  email: string
  password: string
  rememberMe: boolean
}

export type RegisterRequest = {
  firstName: string
  lastName: string
  email: string
  password: string
}
