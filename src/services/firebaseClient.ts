import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const configString = import.meta.env.VITE_FIREBASE_CONFIG

if (!configString) {
  throw new Error('VITE_FIREBASE_CONFIG no está definido. Carga tu JSON de Firebase en el archivo .env local.')
}

let firebaseConfig: FirebaseOptions
try {
  firebaseConfig = JSON.parse(configString) as FirebaseOptions
} catch (_error: unknown) {
  throw new Error('VITE_FIREBASE_CONFIG debe ser un JSON válido con las claves de Firebase.')
}

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(firebaseApp)
export const firestore = getFirestore(firebaseApp)

let analyticsInstance: Analytics | undefined

export const getFirebaseAnalytics = async () => {
  if (!analyticsInstance && (await isSupported())) {
    analyticsInstance = getAnalytics(firebaseApp)
  }
  return analyticsInstance
}
