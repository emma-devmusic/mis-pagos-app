import './App.css'
import Dashboard from './components/Dashboard'
import LoginForm from './components/LoginForm'
import { useAppSelector } from './hooks'

function App() {
  const user = useAppSelector((state) => state.auth.user)

  return <main className="app-shell">{user ? <Dashboard /> : <LoginForm />}</main>
}

export default App
