import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfileInfo } from '../features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../hooks'
import type { Currency } from '../types/auth'
import Page from './Page'

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'ARS', label: 'Peso argentino (ARS)' },
  { value: 'USD', label: 'Dólar estadounidense (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
]

function UserProfile() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, profileStatus, error } = useAppSelector((state) => state.auth)
  const paymentsCount = useAppSelector((state) => state.payments.items.length)
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [currency, setCurrency] = useState<Currency>(user?.currency ?? 'ARS')
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled ?? true)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    setFullName(user?.fullName ?? '')
    setPhone(user?.phone ?? '')
    setCurrency(user?.currency ?? 'ARS')
    setNotificationsEnabled(user?.notificationsEnabled ?? true)
  }, [user])

  if (!user) {
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!fullName.trim() || profileStatus === 'saving') {
      return
    }
    try {
      await dispatch(updateProfileInfo({ fullName: fullName.trim(), phone: phone.trim(), currency, notificationsEnabled })).unwrap()
      setFeedback('Perfil actualizado correctamente.')
    } catch (submitError) {
      setFeedback(submitError instanceof Error ? submitError.message : 'No pudimos actualizar tu perfil.')
    }
  }

  return (
    <Page
      title="Mi perfil"
      description="Gestioná tu información personal y revisá tu actividad."
      onBack={() => navigate('/')}
    >
    <section className="profile-grid">
      <div className="card profile-card">
        <header>
          <p className="eyebrow">Perfil</p>
          <h2 className='text-2xl font-semibold'>Datos personales</h2>
          <p className="muted">Actualiza tu nombre para mantener sincronizados tus reportes y recordatorios.</p>
        </header>
        <form onSubmit={handleSubmit} className="stack">
          <label className="stack">
            <span>Nombre completo</span>
            <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          </label>
          <label className="stack">
            <span>Teléfono</span>
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Ej: +54 9 11 1234-5678"
            />
          </label>
          <label className="stack">
            <span>Correo electrónico</span>
            <input type="email" value={user.email} disabled className='disabled:opacity-50' />
          </label>
          <label className="stack">
            <span>Moneda por defecto</span>
            <select value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </label>
          <label className="flex! items-center! gap-2! mb-2">
            <input
              className='w-fit!'
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(event) => setNotificationsEnabled(event.target.checked)}
            />
            <span>Recibir recordatorios de vencimientos</span>
          </label>
          {feedback ? <p className="muted">{feedback}</p> : null}
          {error && profileStatus === 'failed' ? <p className="error-text">{error}</p> : null}
          <button type="submit" disabled={profileStatus === 'saving'}>
            {profileStatus === 'saving' ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      <div className="card profile-card stats-card">
        <header>
          <p className="eyebrow">Resumen</p>
          <h2 className='text-2xl font-semibold'>Actividad del usuario</h2>
          <p className="muted">Información guardada en Firestore para tus servicios.</p>
        </header>
        <ul className="profile-stats">
          <li>
            <span className="muted">Servicios registrados</span>
            <strong>{paymentsCount}</strong>
          </li>
          <li className="flex flex-col">
            <span className="muted">UID</span>
            <strong className='text-base! truncate line-clamp-1 max-w-3xs'>{user.uid}</strong>
          </li>
        </ul>
      </div>
    </section>
    </Page>
  )
}

export default UserProfile
