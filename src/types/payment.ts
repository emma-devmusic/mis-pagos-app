export type PaymentStatus = 'pending' | 'completed'

export type Payment = {
  id: string
  /**
   * Nombre del servicio / vencimiento para mostrar en UI.
   * Derivado de `serviceNameSnapshot` en pagos recurrentes ó del campo
   * legacy `service` en pagos antiguos.
   */
  service: string
  /**
   * Monto para mostrar en UI.
   * Derivado de `amountSnapshot` en pagos recurrentes ó del campo legacy `amount`.
   */
  amount: number
  dueDate: string
  status: PaymentStatus

  // ── Campos opcionales presentes solo en pagos recurrentes ──
  /** ID del Service que originó este Payment. */
  serviceId?: string
  /** Snapshot del nombre al momento de generar el Payment. */
  serviceNameSnapshot?: string
  /** Snapshot del monto al momento de generar el Payment. */
  amountSnapshot?: number
  /** Clave de período "YYYY-MM" para garantizar 1 Payment por mes por servicio. */
  periodKey?: string
}

export type PaymentFilters = {
  status: 'all' | PaymentStatus
  search: string
}
