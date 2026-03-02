import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser, LoginRequest, RegisterRequest } from '../../types/auth'
import { firebaseAuthApi } from '../../services/firebaseAuth'
import { updateUserProfileDocument } from '../../services/firebaseUsers'
import type { RootState } from '../../store'

export type AuthState = {
  user: AuthUser | null
  status: 'idle' | 'loading' | 'failed'
  profileStatus: 'idle' | 'saving' | 'failed'
  error?: string
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  profileStatus: 'idle',
}

export const loginWithEmail = createAsyncThunk<AuthUser, LoginRequest>('auth/loginWithEmail', async (credentials) => {
  const user = await firebaseAuthApi.login(credentials)
  return user
})

export const registerWithEmail = createAsyncThunk<AuthUser, RegisterRequest>('auth/registerWithEmail', async (payload) => {
  const user = await firebaseAuthApi.register(payload)
  return user
})

export const logoutFromSession = createAsyncThunk('auth/logout', async () => {
  await firebaseAuthApi.logout()
})

export const updateProfileInfo = createAsyncThunk<
  AuthUser,
  { fullName: string; phone?: string; currency?: string; notificationsEnabled?: boolean },
  { state: RootState }
>(
  'auth/updateProfileInfo',
  async ({ fullName, phone, currency, notificationsEnabled }, { getState }) => {
    const currentUser = getState().auth.user
    if (!currentUser) {
      throw new Error('No hay sesión activa.')
    }
    await firebaseAuthApi.updateDisplayName(fullName)
    const updatedProfile = await updateUserProfileDocument(currentUser.uid, { fullName, phone, currency, notificationsEnabled })
    return updatedProfile
  },
)

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
      .addCase(registerWithEmail.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(registerWithEmail.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
      })
      .addCase(registerWithEmail.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'No pudimos crear tu cuenta'
      })
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
      .addCase(updateProfileInfo.pending, (state) => {
        state.profileStatus = 'saving'
        state.error = undefined
      })
      .addCase(updateProfileInfo.fulfilled, (state, action) => {
        state.profileStatus = 'idle'
        state.user = action.payload
      })
      .addCase(updateProfileInfo.rejected, (state, action) => {
        state.profileStatus = 'failed'
        state.error = action.error.message ?? 'No pudimos actualizar tu perfil'
      })
  },
})

export const { setUser } = authSlice.actions
export default authSlice.reducer
