import { useEffect } from 'react'
import './App.css'
import Dashboard from './components/Dashboard'
import LoginForm from './components/LoginForm'
import { setUser } from './features/auth/authSlice'
import { useAppDispatch, useAppSelector } from './hooks'
import { firebaseAuthApi } from './services/firebaseAuth'

function App() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  useEffect(() => {
    const unsubscribe = firebaseAuthApi.listenToAuthChanges((nextUser) => {
      dispatch(setUser(nextUser))
    })
    return () => unsubscribe()
  }, [dispatch])

  return <main className="app-shell">{user ? <Dashboard /> : <LoginForm />}</main>
}

export default App
