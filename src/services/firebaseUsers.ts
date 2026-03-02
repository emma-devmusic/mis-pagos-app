import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import type { DocumentData } from 'firebase/firestore'
import type { AuthUser } from '../types/auth'
import { firestore } from './firebaseClient'

const userDocRef = (uid: string) => doc(firestore, 'users', uid)

const mapSnapshotToUser = (uid: string, data?: DocumentData): AuthUser | null => {
  if (!data) {
    return null
  }
  return {
    uid,
    fullName: data.fullName ?? '',
    email: data.email ?? '',
    photoUrl: data.photoUrl ?? null,
    phone: data.phone ?? '',
    currency: data.currency ?? 'ARS',
    notificationsEnabled: data.notificationsEnabled ?? true,
  }
}

export const fetchUserProfile = async (uid: string): Promise<AuthUser | null> => {
  const snapshot = await getDoc(userDocRef(uid))
  if (!snapshot.exists()) {
    return null
  }
  return mapSnapshotToUser(uid, snapshot.data())
}

export const upsertUserProfile = async (profile: AuthUser): Promise<AuthUser> => {
  const ref = userDocRef(profile.uid)
  const snapshot = await getDoc(ref)
  const payload = {
    fullName: profile.fullName,
    email: profile.email,
    photoUrl: profile.photoUrl ?? null,
    updatedAt: serverTimestamp(),
  }

  if (snapshot.exists()) {
    await updateDoc(ref, payload)
  } else {
    await setDoc(ref, { ...payload, createdAt: serverTimestamp() })
  }

  return profile
}

export const updateUserProfileDocument = async (
  uid: string,
  updates: { fullName: string; phone?: string; currency?: string; notificationsEnabled?: boolean },
): Promise<AuthUser> => {
  const ref = userDocRef(uid)
  await setDoc(
    ref,
    {
      fullName: updates.fullName,
      ...(updates.phone !== undefined && { phone: updates.phone }),
      ...(updates.currency !== undefined && { currency: updates.currency }),
      ...(updates.notificationsEnabled !== undefined && { notificationsEnabled: updates.notificationsEnabled }),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  const snapshot = await getDoc(ref)
  const data = snapshot.data()
  if (!data) {
    throw new Error('No encontramos el perfil del usuario.')
  }
  return mapSnapshotToUser(uid, data) as AuthUser
}
