import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Service, ServiceWritePayload } from '../../types/service.ts'
import { firebaseServicesApi } from '../../services/firebaseServices.ts'
import { ensureMonthlyDebtForUser } from '../../helpers/date.ts'
import { logoutFromSession } from '../auth/authSlice.ts'
import type { RootState } from '../../store.ts'

export type ServicesState = {
  items: Service[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  mutationStatus: 'idle' | 'loading' | 'failed'
  error?: string
}

const createInitialState = (): ServicesState => ({
  items: [],
  status: 'idle',
  mutationStatus: 'idle',
})

const initialState = createInitialState()

const requireUserId = (state: RootState) => {
  const userId = state.auth.user?.uid
  if (!userId) throw new Error('Debes iniciar sesión para administrar tus servicios.')
  return userId
}

// ── Thunks ──

export const loadServices = createAsyncThunk<Service[], void, { state: RootState }>(
  'services/load',
  async (_, { getState }) => {
    const userId = requireUserId(getState())
    // 1) Cargar servicios actuales
    const services = await firebaseServicesApi.list(userId)
    // 2) Acumular deuda si algún vencimiento ya pasó y no fue procesado
    const updated = await ensureMonthlyDebtForUser(userId, services, new Date())
    // 3) Re-fetch solo si hubo actualizaciones de deuda en Firestore
    if (updated) return firebaseServicesApi.list(userId)
    return services
  },
)

export const createService = createAsyncThunk<Service, ServiceWritePayload, { state: RootState }>(
  'services/create',
  async (payload, { getState }) => {
    const userId = requireUserId(getState())
    return firebaseServicesApi.create(userId, payload)
  },
)

export const updateService = createAsyncThunk<Service, Service, { state: RootState }>(
  'services/update',
  async (service, { getState }) => {
    const userId = requireUserId(getState())
    return firebaseServicesApi.update(userId, service)
  },
)

export const deleteService = createAsyncThunk<string, string, { state: RootState }>(
  'services/delete',
  async (serviceId, { getState }) => {
    const userId = requireUserId(getState())
    return firebaseServicesApi.remove(userId, serviceId)
  },
)

/**
 * Registra el pago de UN mes de deuda sobre un servicio recurrente.
 * Decrementa `debtAmount` por `service.amount` y `debtMonths` en 1.
 */
export const payServiceDebt = createAsyncThunk<Service, string, { state: RootState }>(
  'services/payDebt',
  async (serviceId, { getState }) => {
    const state = getState()
    const userId = requireUserId(state)
    const service = state.services.items.find((s) => s.id === serviceId)
    if (!service) throw new Error('Servicio no encontrado.')
    if (service.debtAmount <= 0) throw new Error('Este servicio no tiene deuda pendiente.')
    return firebaseServicesApi.payOneMonth(userId, service)
  },
)

// ── Slice ──

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    // Permite actualizar campos localmente (ej: toggle active) sin round-trip
    patchService(state, action: PayloadAction<Service>) {
      const index = state.items.findIndex((s) => s.id === action.payload.id)
      if (index >= 0) {
        state.items[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // load
      .addCase(loadServices.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(loadServices.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(loadServices.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'No pudimos cargar los servicios'
      })
      // create
      .addCase(createService.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.mutationStatus = 'idle'
        state.items.unshift(action.payload)
      })
      .addCase(createService.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.error.message ?? 'No pudimos crear el servicio'
      })
      // update
      .addCase(updateService.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.mutationStatus = 'idle'
        const index = state.items.findIndex((s) => s.id === action.payload.id)
        if (index >= 0) state.items[index] = action.payload
      })
      .addCase(updateService.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.error.message ?? 'No pudimos actualizar el servicio'
      })
      // delete
      .addCase(deleteService.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.mutationStatus = 'idle'
        state.items = state.items.filter((s) => s.id !== action.payload)
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.error.message ?? 'No pudimos eliminar el servicio'
      })
      // payDebt
      .addCase(payServiceDebt.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(payServiceDebt.fulfilled, (state, action) => {
        state.mutationStatus = 'idle'
        const index = state.items.findIndex((s) => s.id === action.payload.id)
        if (index >= 0) state.items[index] = action.payload
      })
      .addCase(payServiceDebt.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.error.message ?? 'No pudimos registrar el pago'
      })
      // reset on logout
      .addCase(logoutFromSession.fulfilled, () => createInitialState())
  },
})

export const { patchService } = servicesSlice.actions
export default servicesSlice.reducer
