import { useState } from 'react'
import type { FormEvent } from 'react'
import { registerWithEmail } from '../features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../hooks'
import type { RegisterRequest } from '../types/auth'

type RegisterFormProps = {
  onSwitchToLogin: () => void
}

type RegisterFormState = RegisterRequest & { confirmPassword: string }

const initialForm: RegisterFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const dispatch = useAppDispatch()
  const authStatus = useAppSelector((state) => state.auth.status)
  const authError = useAppSelector((state) => state.auth.error)
  const [formValues, setFormValues] = useState<RegisterFormState>(initialForm)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const firstName = formValues.firstName.trim()
    const lastName = formValues.lastName.trim()
    const email = formValues.email.trim()
    const password = formValues.password
    const confirmPassword = formValues.confirmPassword

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setValidationError('Todos los campos son obligatorios.')
      return
    }

    if (password !== confirmPassword) {
      setValidationError('Las contraseñas no coinciden.')
      return
    }

    setValidationError(null)

    const payload: RegisterRequest = {
      firstName,
      lastName,
      email,
      password,
    }

    dispatch(registerWithEmail(payload))
  }

  return (
    <section className="card login-card">
      <header>
        <p className="eyebrow">Mis Pagos</p>
        <h1 className='text-3xl font-semibold'>Crea tu cuenta</h1>
        <p className="muted">Registra tus datos para empezar a gestionar tus servicios.</p>
      </header>
      <form className="stack" onSubmit={handleSubmit}>
        <label className="stack">
          <span>Nombre</span>
          <input
            type="text"
            value={formValues.firstName}
            onChange={(event) => setFormValues({ ...formValues, firstName: event.target.value })}
            placeholder="Emma"
            required
          />
        </label>
        <label className="stack">
          <span>Apellido</span>
          <input
            type="text"
            value={formValues.lastName}
            onChange={(event) => setFormValues({ ...formValues, lastName: event.target.value })}
            placeholder="Martínez"
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
        <label className="stack">
          <span>Contraseña</span>
          <input
            type="password"
            value={formValues.password}
            onChange={(event) => setFormValues({ ...formValues, password: event.target.value })}
            placeholder="••••••••"
            required
          />
        </label>
        <label className="stack">
          <span>Repite la contraseña</span>
          <input
            type="password"
            value={formValues.confirmPassword}
            onChange={(event) => setFormValues({ ...formValues, confirmPassword: event.target.value })}
            placeholder="••••••••"
            required
          />
        </label>
        {validationError ? <p className="error-text">{validationError}</p> : null}
        {!validationError && authError ? <p className="error-text">{authError}</p> : null}
        <button type="submit" disabled={authStatus === 'loading'} className='mt-2'>
          {authStatus === 'loading' ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>
      <footer className="form-switch">
        <span>¿Ya tienes una cuenta?</span>
        <button type="button" className="link-button" onClick={onSwitchToLogin}>
          Inicia sesión
        </button>
      </footer>
    </section>
  )
}

export default RegisterForm
