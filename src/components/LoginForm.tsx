import { useState } from 'react'
import type { FormEvent } from 'react'
import { loginWithEmail } from '../features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../hooks'
import type { LoginRequest } from '../types/auth'

const initialForm: LoginRequest = {
  fullName: '',
  email: '',
  rememberMe: false,
}

function LoginForm() {
  const dispatch = useAppDispatch()
  const authStatus = useAppSelector((state) => state.auth.status)
  const authError = useAppSelector((state) => state.auth.error)
  const [formValues, setFormValues] = useState<LoginRequest>(initialForm)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!formValues.fullName.trim() || !formValues.email.trim()) {
      return
    }
    dispatch(
      loginWithEmail({
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        rememberMe: formValues.rememberMe,
      }),
    )
  }

  return (
    <section className="card login-card">
      <header>
        <p className="eyebrow">Mis Pagos</p>
        <h1>Inicia sesión</h1>
        <p className="muted">Administra tus servicios pendientes desde un único lugar.</p>
      </header>
      <form className="stack" onSubmit={handleSubmit}>
        <label className="stack">
          <span>Nombre completo</span>
          <input
            type="text"
            value={formValues.fullName}
            onChange={(event) => setFormValues({ ...formValues, fullName: event.target.value })}
            placeholder="Emma Martínez"
            required
          />
        </label>
        <label className="stack">
          <span>Correo electrónico</span>
          <input
            type="email"
            value={formValues.email}
            onChange={(event) => setFormValues({ ...formValues, email: event.target.value })}
            placeholder="emma@pagos.com"
            required
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={formValues.rememberMe}
            onChange={(event) => setFormValues({ ...formValues, rememberMe: event.target.checked })}
          />
          <span>Recordar esta sesión</span>
        </label>
        {authError ? <p className="error-text">{authError}</p> : null}
        <button type="submit" disabled={authStatus === 'loading'}>
          {authStatus === 'loading' ? 'Ingresando...' : 'Entrar al dashboard'}
        </button>
      </form>
    </section>
  )
}

export default LoginForm
