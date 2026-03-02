import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'
import paymentsReducer from './features/payments/paymentsSlice'
import servicesReducer from './features/services/servicesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    payments: paymentsReducer,
    services: servicesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
