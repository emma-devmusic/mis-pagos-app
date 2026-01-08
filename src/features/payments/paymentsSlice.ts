import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Payment, PaymentFilters } from '../../types/payment.ts'
import { fakePaymentsApi } from '../../services/firebasePayments.ts'
import { logoutFromSession } from '../auth/authSlice.ts'

export type PaymentsState = {
  items: Payment[]
  filters: PaymentFilters
  status: 'idle' | 'loading' | 'failed'
  error?: string
}

const createInitialState = (): PaymentsState => ({
  items: [],
  filters: {
    status: 'all',
    search: '',
  },
  status: 'idle',
})

const initialState = createInitialState()

export const loadPayments = createAsyncThunk<Payment[]>('payments/load', async () => {
  const response = await fakePaymentsApi.list()
  return response
})

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    togglePaymentStatus(state, action: PayloadAction<string>) {
      const payment = state.items.find((item) => item.id === action.payload)
      if (payment) {
        payment.status = payment.status === 'pending' ? 'completed' : 'pending'
      }
    },
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
      .addCase(logoutFromSession.fulfilled, () => createInitialState())
  },
})

export const { togglePaymentStatus, setStatusFilter, setSearchFilter } = paymentsSlice.actions
export default paymentsSlice.reducer
