import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser, LoginRequest } from '../../types/auth'
import { fakeAuthApi } from '../../services/firebaseAuth'

export type AuthState = {
  user: AuthUser | null
  status: 'idle' | 'loading' | 'failed'
  error?: string
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
}

export const loginWithEmail = createAsyncThunk<AuthUser, LoginRequest>('auth/loginWithEmail', async (credentials) => {
  const user = await fakeAuthApi.login(credentials)
  return user
})

export const logoutFromSession = createAsyncThunk('auth/logout', async () => {
  await fakeAuthApi.logout()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithEmail.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'No pudimos iniciar sesión'
      })
      .addCase(logoutFromSession.fulfilled, (state) => {
        state.user = null
        state.status = 'idle'
      })
  },
})

export const { setUser } = authSlice.actions
export default authSlice.reducer
