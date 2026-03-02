import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { FirebaseError } from 'firebase/app'
import type { AuthUser, LoginRequest, RegisterRequest } from '../types/auth'
import { firebaseAuth } from './firebaseClient'
import { fetchUserProfile, upsertUserProfile } from './firebaseUsers'

const mapFirebaseUser = (user: FirebaseUser, fallbackName?: string): AuthUser => ({
  uid: user.uid,
  fullName: user.displayName ?? fallbackName ?? user.email ?? 'Usuario',
  email: user.email ?? '',
  photoUrl: user.photoURL,
})

const resolveAuthErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta.'
      case 'auth/user-not-found':
        return 'No encontramos una cuenta para este correo.'
      case 'auth/invalid-credential':
        return 'Las credenciales proporcionadas no son válidas.'
      case 'auth/too-many-requests':
        return 'Demasiados intentos fallidos. Inténtalo más tarde.'
      case 'auth/network-request-failed':
        return 'Problemas de red. Revisa tu conexión.'
      default:
        return 'No pudimos iniciar sesión con Firebase.'
    }
  }
  return 'Algo salió mal al iniciar sesión.'
}

const resolveRegisterErrorMessage = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'Este correo ya tiene una cuenta creada.'
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil para Firebase.'
      case 'auth/operation-not-allowed':
        return 'El registro con correo está deshabilitado en Firebase.'
      default:
        return 'No pudimos registrar tu cuenta con Firebase.'
    }
  }
  return 'Algo salió mal al crear tu cuenta.'
}

const applyPersistence = async (rememberMe: boolean) => {
  const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence
  await setPersistence(firebaseAuth, persistence)
}

const syncUserProfile = async (user: FirebaseUser, fallbackName?: string): Promise<AuthUser> => {
  const storedProfile = await fetchUserProfile(user.uid)
  if (storedProfile) {
    const trimmedFallback = fallbackName?.trim()
    if (trimmedFallback && storedProfile.fullName !== trimmedFallback) {
      const updatedProfile: AuthUser = { ...storedProfile, fullName: trimmedFallback }
      await upsertUserProfile(updatedProfile)
      if (!user.displayName) {
        await updateProfile(user, { displayName: trimmedFallback })
      }
      return updatedProfile
    }
    return storedProfile
  }

  if (!user.displayName && fallbackName) {
    await updateProfile(user, { displayName: fallbackName })
  }

  const mappedUser = mapFirebaseUser(user, fallbackName)
  await upsertUserProfile(mappedUser)
  return mappedUser
}

export const firebaseAuthApi = {
  async login(credentials: LoginRequest): Promise<AuthUser> {
    await applyPersistence(credentials.rememberMe)
    try {
      const result = await signInWithEmailAndPassword(firebaseAuth, credentials.email, credentials.password)
      return await syncUserProfile(result.user, credentials.fullName)
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'auth/user-not-found') {
        const newUser = await createUserWithEmailAndPassword(firebaseAuth, credentials.email, credentials.password)
        if (credentials.fullName.trim()) {
          await updateProfile(newUser.user, { displayName: credentials.fullName.trim() })
        }
        const mapped = mapFirebaseUser(newUser.user, credentials.fullName)
        await upsertUserProfile(mapped)
        return mapped
      }
      throw new Error(resolveAuthErrorMessage(error))
    }
  },
  async register(payload: RegisterRequest): Promise<AuthUser> {
    const fullName = [payload.firstName.trim(), payload.lastName.trim()].filter(Boolean).join(' ')
    try {
      await applyPersistence(true)
      const result = await createUserWithEmailAndPassword(firebaseAuth, payload.email.trim(), payload.password)
      return await syncUserProfile(result.user, fullName)
    } catch (error) {
      throw new Error(resolveRegisterErrorMessage(error))
    }
  },
  async logout(): Promise<void> {
    await signOut(firebaseAuth)
  },
  async updateDisplayName(fullName: string): Promise<void> {
    const currentUser = firebaseAuth.currentUser
    if (!currentUser) {
      throw new Error('No hay una sesión activa.')
    }
    await updateProfile(currentUser, { displayName: fullName })
  },
  listenToAuthChanges(callback: (user: AuthUser | null) => void) {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (!firebaseUser) {
        callback(null)
        return
      }
      syncUserProfile(firebaseUser)
        .then(callback)
        .catch(() => callback(mapFirebaseUser(firebaseUser)))
    })
    return unsubscribe
  },
}
