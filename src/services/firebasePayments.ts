import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import type { Payment, PaymentStatus } from '../types/payment.ts'
import { firestore } from './firebaseClient.ts'

const paymentsCollection = (userId: string) => collection(firestore, 'users', userId, 'payments')

/** Payload exclusivo de pagos manuales/puntuales. */
export type PaymentWritePayload = {
  service: string
  amount: number
  dueDate: string
  status: PaymentStatus
}

// ── Mapper (soporta formato legado y nuevo) ──

const mapDocToPayment = (snapshot: QueryDocumentSnapshot<DocumentData>): Payment => {
  const data = snapshot.data() ?? {}

  // Campo de display: prioriza campos nuevos (snapshot), fallback a legado
  const service: string =
    (data.serviceNameSnapshot as string | undefined) ??
    (data.service as string | undefined) ??
    'Servicio'
  const amount: number = Number(
    (data.amountSnapshot as number | undefined) ?? (data.amount as number | undefined) ?? 0,
  )

  return {
    id: snapshot.id,
    service,
    amount,
    dueDate: (data.dueDate as string | undefined) ?? '',
    status: (data.status as PaymentStatus | undefined) ?? 'pending',
    // Campos opcionales – solo se incluyen si están en Firestore
    ...(data.serviceId ? { serviceId: data.serviceId as string } : {}),
    ...(data.serviceNameSnapshot ? { serviceNameSnapshot: data.serviceNameSnapshot as string } : {}),
    ...(data.amountSnapshot !== undefined ? { amountSnapshot: Number(data.amountSnapshot) } : {}),
    ...(data.periodKey ? { periodKey: data.periodKey as string } : {}),
  }
}

// ── API ──

export const firebasePaymentsApi = {
  async list(userId: string): Promise<Payment[]> {
    const q = query(paymentsCollection(userId), orderBy('createdAt', 'desc'))
    const snapshots = await getDocs(q)
    return snapshots.docs.map(mapDocToPayment)
  },

  /** Crea un pago puntual (manual). Usa addDoc → ID aleatorio. */
  async create(userId: string, payload: PaymentWritePayload): Promise<Payment> {
    const ref = await addDoc(paymentsCollection(userId), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return { id: ref.id, ...payload }
  },

  async update(userId: string, payment: Payment): Promise<Payment> {
    const { id, ...rest } = payment
    const paymentRef = doc(paymentsCollection(userId), id)
    await updateDoc(paymentRef, { ...rest, updatedAt: serverTimestamp() })
    return payment
  },

  async remove(userId: string, paymentId: string): Promise<string> {
    const paymentRef = doc(paymentsCollection(userId), paymentId)
    await deleteDoc(paymentRef)
    return paymentId
  },
}
