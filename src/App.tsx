import { useEffect, useState } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import { setUser } from './features/auth/authSlice'
import { useAppDispatch, useAppSelector } from './hooks'
import { firebaseAuthApi } from './services/firebaseAuth'

function App() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  // false hasta que Firebase confirme el estado de sesión (evita flash del login)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const unsubscribe = firebaseAuthApi.listenToAuthChanges((nextUser) => {
      dispatch(setUser(nextUser))
      setAuthReady(true)
    })
    return () => unsubscribe()
  }, [dispatch])

  useEffect(() => {
    if (user) {
      setAuthMode('login')
    }
  }, [user])

  if (!authReady) {
    return (
      <main className="app-shell flex justify-center items-center">
        <p className="muted">Cargando tu información...</p>
      </main>
    )
  }

  return (
    <main className="app-shell">
      {user ? (
        <Dashboard />
      ) : authMode === 'login' ? (
        <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
      )}
    </main>
  )
}

export default App
