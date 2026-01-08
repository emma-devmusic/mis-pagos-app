export type AuthUser = {
  fullName: string
  email: string
}

export type LoginRequest = {
  fullName: string
  email: string
  rememberMe: boolean
}
