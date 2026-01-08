export type PaymentStatus = 'pending' | 'completed'

export type Payment = {
  id: string
  service: string
  amount: number
  dueDate: string
  status: PaymentStatus
}

export type PaymentFilters = {
  status: 'all' | PaymentStatus
  search: string
}
