import type { AuthUser, LoginRequest } from '../types/auth'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const fakeAuthApi = {
  async login(credentials: LoginRequest): Promise<AuthUser> {
    await delay(800)
    if (!credentials.email.includes('@')) {
      throw new Error('El correo no es válido')
    }
    return {
      fullName: credentials.fullName,
      email: credentials.email,
    }
  },
  async logout(): Promise<void> {
    await delay(300)
  },
}
