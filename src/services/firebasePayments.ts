import { nanoid } from '@reduxjs/toolkit'
import type { Payment } from '../types/payment'

const initialPayments: Payment[] = [
  {
    id: nanoid(),
    service: 'Servicio de internet',
    amount: 18990,
    dueDate: '2026-01-10',
    status: 'pending',
  },
  {
    id: nanoid(),
    service: 'Electricidad Edenor',
    amount: 42650,
    dueDate: '2026-01-14',
    status: 'pending',
  },
  {
    id: nanoid(),
    service: 'Agua AySA',
    amount: 15220,
    dueDate: '2025-12-28',
    status: 'completed',
  },
  {
    id: nanoid(),
    service: 'Spotify Familiar',
    amount: 2499,
    dueDate: '2026-01-03',
    status: 'completed',
  },
  {
    id: nanoid(),
    service: 'Seguro del auto',
    amount: 67500,
    dueDate: '2026-01-20',
    status: 'pending',
  },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const fakePaymentsApi = {
  async list(): Promise<Payment[]> {
    await delay(600)
    return initialPayments
  },
}
