import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { updateProfileInfo } from '../features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../hooks'

function UserProfile() {
  const dispatch = useAppDispatch()
  const { user, profileStatus, error } = useAppSelector((state) => state.auth)
  const paymentsCount = useAppSelector((state) => state.payments.items.length)
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    setFullName(user?.fullName ?? '')
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
      await dispatch(updateProfileInfo({ fullName: fullName.trim() })).unwrap()
      setFeedback('Perfil actualizado correctamente.')
    } catch (submitError) {
      setFeedback(submitError instanceof Error ? submitError.message : 'No pudimos actualizar tu perfil.')
    }
  }

  return (
    <section className="profile-grid">
      <div className="card profile-card">
        <header>
          <p className="eyebrow">Perfil</p>
          <h2>Datos personales</h2>
          <p className="muted">Actualiza tu nombre para mantener sincronizados tus reportes y recordatorios.</p>
        </header>
        <form onSubmit={handleSubmit} className="stack">
          <label className="stack">
            <span>Nombre completo</span>
            <input type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
          </label>
          <label className="stack">
            <span>Correo electrónico</span>
            <input type="email" value={user.email} disabled />
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
          <h2>Actividad del usuario</h2>
          <p className="muted">Información guardada en Firestore para tus servicios.</p>
        </header>
        <ul className="profile-stats">
          <li>
            <span className="muted">Servicios registrados</span>
            <strong>{paymentsCount}</strong>
          </li>
          <li>
            <span className="muted">UID</span>
            <strong>{user.uid}</strong>
          </li>
        </ul>
      </div>
    </section>
  )
}

export default UserProfile
