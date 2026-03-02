/** Regla de recurrencia – MVP: solo mensual  */
export type RecurrenceRule = {
  type: 'monthly'
  /** Día del mes en que vence (1-28). Se clampea al último día si el mes es más corto. */
  dueDay: number
}

/**
 * Plantilla de servicio recurrente o puntual.
 * Los servicios recurrentes acumulan deuda automáticamente en lugar de
 * generar Payment documents individuales.
 */
export type Service = {
  id: string
  name: string
  amount: number
  isRecurring: boolean
  /** Solo presente cuando isRecurring = true */
  recurrence?: RecurrenceRule
  /** Fecha de vencimiento puntual ("YYYY-MM-DD") – solo para servicios NO recurrentes */
  dueDate?: string
  /** Los servicios inactivos no acumulan deuda */
  active: boolean

  // ── Campos de deuda (gestionados por ensureMonthlyDebtForUser) ──
  /** Monto total de deuda acumulada sin pagar */
  debtAmount: number
  /** Cantidad de meses impagos */
  debtMonths: number
  /**
   * Último período procesado – "YYYY-MM".
   * Garantiza idempotencia: no se acumula dos veces el mismo mes.
   */
  lastBilledPeriod?: string

  createdAt?: unknown
  updatedAt?: unknown
}

/**
 * Payload para crear/editar un Service.
 * Los campos de deuda son manejados por el sistema, no por el usuario.
 */
export type ServiceWritePayload = Omit<
  Service,
  'id' | 'debtAmount' | 'debtMonths' | 'lastBilledPeriod' | 'createdAt' | 'updatedAt'
>
