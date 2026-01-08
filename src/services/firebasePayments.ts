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
import type { Payment, PaymentStatus } from '../types/payment'
import { firestore } from './firebaseClient'

const paymentsCollection = (userId: string) => collection(firestore, 'users', userId, 'payments')

export type PaymentWritePayload = {
  service: string
  amount: number
  dueDate: string
  status: PaymentStatus
}

const mapDocToPayment = (snapshot: QueryDocumentSnapshot<DocumentData>): Payment => {
  const data = snapshot.data() ?? {}
  return {
    id: snapshot.id,
    service: data.service ?? 'Servicio',
    amount: Number(data.amount ?? 0),
    dueDate: data.dueDate ?? '',
    status: data.status ?? 'pending',
  }
}

export const firebasePaymentsApi = {
  async list(userId: string): Promise<Payment[]> {
    const q = query(paymentsCollection(userId), orderBy('createdAt', 'desc'))
    const snapshots = await getDocs(q)
    return snapshots.docs.map((docSnapshot) => mapDocToPayment(docSnapshot))
  },
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
