import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Payment, PaymentFilters } from '../../types/payment.ts'
import { firebasePaymentsApi, type PaymentWritePayload } from '../../services/firebasePayments.ts'
import { logoutFromSession } from '../auth/authSlice.ts'
import type { RootState } from '../../store'

export type PaymentsState = {
  items: Payment[]
  filters: PaymentFilters
  status: 'idle' | 'loading' | 'failed'
  mutationStatus: 'idle' | 'loading' | 'failed'
  error?: string
}

const createInitialState = (): PaymentsState => ({
  items: [],
  filters: {
    status: 'all',
    search: '',
  },
  status: 'idle',
  mutationStatus: 'idle',
})

const initialState = createInitialState()

const requireUserId = (state: RootState) => {
  const userId = state.auth.user?.uid
  if (!userId) {
    throw new Error('Debes iniciar sesión para administrar tus servicios.')
  }
  return userId
}

export const loadPayments = createAsyncThunk<Payment[], void, { state: RootState }>('payments/load', async (_, { getState }) => {
  const userId = requireUserId(getState())
  const response = await firebasePaymentsApi.list(userId)
  return response
})

export const createPayment = createAsyncThunk<Payment, PaymentWritePayload, { state: RootState }>(
  'payments/create',
  async (payload, { getState }) => {
    const userId = requireUserId(getState())
    return firebasePaymentsApi.create(userId, payload)
  },
)

export const updatePayment = createAsyncThunk<Payment, Payment, { state: RootState }>(
  'payments/update',
  async (payment, { getState }) => {
    const userId = requireUserId(getState())
    return firebasePaymentsApi.update(userId, payment)
  },
)

export const deletePayment = createAsyncThunk<string, string, { state: RootState }>(
  'payments/delete',
  async (paymentId, { getState }) => {
    const userId = requireUserId(getState())
    return firebasePaymentsApi.remove(userId, paymentId)
  },
)

export const togglePaymentStatus = createAsyncThunk<Payment, string, { state: RootState }>(
  'payments/toggleStatus',
  async (paymentId, { getState }) => {
    const state = getState()
    const target = state.payments.items.find((item) => item.id === paymentId)
    if (!target) {
      throw new Error('No encontramos el servicio solicitado.')
    }
    const updatedPayment: Payment = {
      ...target,
      status: target.status === 'pending' ? 'completed' : 'pending',
    }
    const userId = requireUserId(state)
    return firebasePaymentsApi.update(userId, updatedPayment)
  },
)

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    setStatusFilter(state, action: PayloadAction<PaymentFilters['status']>) {
      state.filters.status = action.payload
    },
    setSearchFilter(state, action: PayloadAction<string>) {
      state.filters.search = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPayments.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(loadPayments.fulfilled, (state, action) => {
        state.status = 'idle'
        state.items = action.payload
      })
      .addCase(loadPayments.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'No pudimos cargar los pagos'
      })
      .addCase(createPayment.pending, (state) => {
        state.mutationStatus = 'loading'
        state.error = undefined
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.mutationStatus = 'idle'
        state.items.unshift(action.payload)
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.error.message ?? 'No pudimos crear el servicio'
      })
      .addCase(updatePayment.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.mutationStatus = 'idle'
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index >= 0) {
          state.items[index] = action.payload
        }
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.error.message ?? 'No pudimos actualizar el servicio'
      })
      .addCase(deletePayment.pending, (state) => {
        state.mutationStatus = 'loading'
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.mutationStatus = 'idle'
        state.items = state.items.filter((item) => item.id !== action.payload)
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.error = action.error.message ?? 'No pudimos eliminar el servicio'
      })
      .addCase(togglePaymentStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id)
        if (index >= 0) {
          state.items[index] = action.payload
        }
      })
      .addCase(togglePaymentStatus.rejected, (state, action) => {
        state.error = action.error.message ?? 'No pudimos actualizar el estado del servicio'
      })
      .addCase(logoutFromSession.fulfilled, () => createInitialState())
  },
})

export const { setStatusFilter, setSearchFilter } = paymentsSlice.actions
export default paymentsSlice.reducer
