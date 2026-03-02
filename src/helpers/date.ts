import { firebaseServicesApi } from '../services/firebaseServices.ts'
import type { Service } from '../types/service.ts'

// ── Utilidades de fecha (sin librerías externas) ──

/**
 * Devuelve la clave de período "YYYY-MM" para una fecha dada.
 * @example periodKeyFromDate(new Date('2026-03-15')) // "2026-03"
 */
export const periodKeyFromDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Calcula la fecha de vencimiento para un mes dado, clampando el dueDay
 * al último día del mes si es necesario.
 *
 * @param year   Año (ej: 2026)
 * @param month0 Mes base-0 (0 = enero, 11 = diciembre)
 * @param dueDay Día de vencimiento deseado (1-28)
 * @returns      Fecha como string "YYYY-MM-DD"
 *
 * @example computeDueDateForMonth(2026, 1, 30) // "2026-02-28" (febrero tiene 28 días)
 */
export const computeDueDateForMonth = (year: number, month0: number, dueDay: number): string => {
  const lastDay = new Date(year, month0 + 1, 0).getDate()
  const clampedDay = Math.min(dueDay, lastDay)
  const mm = String(month0 + 1).padStart(2, '0')
  const dd = String(clampedDay).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

/** Formatea un Date como "YYYY-MM-DD" (sin offset de zona horaria). */
const toDateStr = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ── Orquestador de deuda mensual ──

/**
 * Acumula deuda en cada Service recurrente activo cuyo vencimiento ya pasó
 * en el período actual, y que aún no fue procesado.
 *
 * **Cuándo se acumula deuda:**
 * → Solo si `hoy >= dueDate` del período actual.
 *   Ej: servicio con dueDay=10, hoy=2/marzo → NO acumula aún.
 *       Si hoy=10/marzo o 11/marzo → SÍ acumula.
 *
 * **Idempotencia:**
 * → `service.lastBilledPeriod` guarda el último período procesado.
 *   Si ya es el período actual, no hace nada.
 *   `addMonthlyDebt` usa además una Firestore transaction como segunda barrera.
 *
 * @param userId   UID del usuario autenticado.
 * @param services Lista de Services ya cargados (evita re-fetch).
 * @param now      Fecha de referencia (normalmente `new Date()`).
 * @returns        `true` si algún servicio fue actualizado (útil para decidir si re-fetch).
 */
export const ensureMonthlyDebtForUser = async (
  userId: string,
  services: Service[],
  now: Date,
): Promise<boolean> => {
  const activeRecurring = services.filter((s) => s.active && s.isRecurring && s.recurrence != null)
  if (activeRecurring.length === 0) return false

  const periodKey = periodKeyFromDate(now)
  const year = now.getFullYear()
  const month0 = now.getMonth()
  const todayStr = toDateStr(now)

  const toProcess = activeRecurring.filter((service) => {
    // Ya procesado este período → saltar
    if (service.lastBilledPeriod === periodKey) return false

    // Verificar si hoy >= fecha de vencimiento del período actual
    const dueDate = computeDueDateForMonth(year, month0, service.recurrence!.dueDay)
    return todayStr >= dueDate
  })

  if (toProcess.length === 0) return false

  await Promise.all(
    toProcess.map((service) =>
      firebaseServicesApi.addMonthlyDebt(userId, service.id, periodKey, service.amount),
    ),
  )

  return true
}

