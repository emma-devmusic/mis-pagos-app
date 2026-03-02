import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import type { Service, ServiceWritePayload } from '../types/service.ts'
import { firestore } from './firebaseClient.ts'

const servicesCollection = (userId: string) => collection(firestore, 'users', userId, 'services')

const mapDocToService = (snapshot: QueryDocumentSnapshot<DocumentData>): Service => {
  const data = snapshot.data() ?? {}
  return {
    id: snapshot.id,
    name: data.name ?? '',
    amount: Number(data.amount ?? 0),
    isRecurring: Boolean(data.isRecurring ?? false),
    ...(data.recurrence ? { recurrence: data.recurrence as Service['recurrence'] } : {}),
    ...(data.dueDate ? { dueDate: data.dueDate as string } : {}),
    active: data.active !== false, // default true
    // Campos de deuda – default en 0 si el documento aún no los tiene
    debtAmount: Number(data.debtAmount ?? 0),
    debtMonths: Number(data.debtMonths ?? 0),
    ...(data.lastBilledPeriod ? { lastBilledPeriod: data.lastBilledPeriod as string } : {}),
  }
}

export const firebaseServicesApi = {
  async list(userId: string): Promise<Service[]> {
    const q = query(servicesCollection(userId), orderBy('createdAt', 'desc'))
    const snapshots = await getDocs(q)
    return snapshots.docs.map(mapDocToService)
  },

  async create(userId: string, payload: ServiceWritePayload): Promise<Service> {
    const ref = await addDoc(servicesCollection(userId), {
      ...payload,
      // Deuda inicial en 0
      debtAmount: 0,
      debtMonths: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { id: ref.id, ...payload, debtAmount: 0, debtMonths: 0 }
  },

  async update(userId: string, service: Service): Promise<Service> {
    const { id, debtAmount, debtMonths, lastBilledPeriod, ...rest } = service
    const serviceRef = doc(servicesCollection(userId), id)
    // No se sobreescribe debtAmount/debtMonths/lastBilledPeriod desde el formulario
    await updateDoc(serviceRef, { ...rest, updatedAt: serverTimestamp() })
    return service
  },

  async remove(userId: string, serviceId: string): Promise<string> {
    const serviceRef = doc(servicesCollection(userId), serviceId)
    await deleteDoc(serviceRef)
    return serviceId
  },

  /**
   * Acumula un mes de deuda en el servicio de forma IDEMPOTENTE.
   *
   * - Si `lastBilledPeriod === periodKey` ya fue procesado → no hace nada.
   * - Usa `runTransaction` para evitar condiciones de carrera.
   *
   * @param userId    UID del usuario.
   * @param serviceId ID del Service a actualizar.
   * @param periodKey Clave de período "YYYY-MM" (garantía de unicidad por mes).
   * @param amount    Monto a acumular en `debtAmount`.
   */
  async addMonthlyDebt(
    userId: string,
    serviceId: string,
    periodKey: string,
    amount: number,
  ): Promise<void> {
    const serviceRef = doc(servicesCollection(userId), serviceId)
    await runTransaction(firestore, async (transaction) => {
      const snap = await transaction.get(serviceRef)
      if (!snap.exists()) return

      const data = snap.data()
      // Idempotencia: no procesar el mismo período dos veces
      if ((data.lastBilledPeriod as string | undefined) === periodKey) return

      transaction.update(serviceRef, {
        debtAmount: Number(data.debtAmount ?? 0) + amount,
        debtMonths: Number(data.debtMonths ?? 0) + 1,
        lastBilledPeriod: periodKey,
        updatedAt: serverTimestamp(),
      })
    })
  },

  /**
   * Registra el pago de UN mes de deuda.
   * Decrementa `debtAmount` y `debtMonths` (sin bajar de 0).
   *
   * @param userId  UID del usuario.
   * @param service Servicio actual (se usa `amount` para saber cuánto restar).
   * @returns       Service con deuda actualizada (calculada localmente para evitar extra read).
   */
  async payOneMonth(userId: string, service: Service): Promise<Service> {
    const serviceRef = doc(servicesCollection(userId), service.id)
    await runTransaction(firestore, async (transaction) => {
      const snap = await transaction.get(serviceRef)
      if (!snap.exists()) throw new Error('Servicio no encontrado.')
      const data = snap.data()
      const newDebtAmount = Math.max(0, Number(data.debtAmount ?? 0) - service.amount)
      const newDebtMonths = Math.max(0, Number(data.debtMonths ?? 0) - 1)
      transaction.update(serviceRef, {
        debtAmount: newDebtAmount,
        debtMonths: newDebtMonths,
        updatedAt: serverTimestamp(),
      })
    })
    return {
      ...service,
      debtAmount: Math.max(0, service.debtAmount - service.amount),
      debtMonths: Math.max(0, service.debtMonths - 1),
    }
  },
}
