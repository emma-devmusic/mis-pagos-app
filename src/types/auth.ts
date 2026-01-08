export type AuthUser = {
  uid: string
  fullName: string
  email: string
  photoUrl?: string | null
}

export type LoginRequest = {
  fullName: string
  email: string
  password: string
  rememberMe: boolean
}
