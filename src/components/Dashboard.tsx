import { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { logoutFromSession } from '../features/auth/authSlice'
import { loadPayments } from '../features/payments/paymentsSlice'
import { useAppDispatch, useAppSelector } from '../hooks'
import DashboardOverview from './DashboardOverview.tsx'
import ServicesAdmin from './ServicesAdmin.tsx'
import UserProfile from './UserProfile.tsx'

function Dashboard() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const { items, status } = useAppSelector((state) => state.payments)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const sidebarId = 'services-sidebar'

  useEffect(() => {
    if (!user) {
      return
    }
    if (status === 'idle' && items.length === 0) {
      dispatch(loadPayments())
    }
  }, [dispatch, status, items.length, user])

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <section className="dashboard">
      <div className="dashboard-toolbar">
        <button
          type="button"
          className="ghost mobile-nav-toggle"
          aria-controls={sidebarId}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
        >
          Menú principal
        </button>
      </div>

      <div className="dashboard-layout">
        <aside
          id={sidebarId}
          className={`services-sidebar ${isMobileMenuOpen ? 'open' : ''}`}
          aria-label="Navegación del panel"
        >
          <div className="sidebar-header">
            <div>
              <p className="eyebrow">Panel</p>
              <h2>Servicios</h2>
            </div>
            <button type="button" className="ghost sidebar-close" onClick={closeMobileMenu}>
              Cerrar
            </button>
          </div>
          <nav className="sidebar-menu">
            <NavLink
              to="/"
              end
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span>Resumen general</span>
              <small>Estadísticas y pagos filtrados</small>
            </NavLink>
            <NavLink
              to="/servicios"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span>Administrar servicios</span>
              <small>Crear, editar o eliminar registros</small>
            </NavLink>
            <NavLink
              to="/perfil"
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeMobileMenu}
            >
              <span>Perfil del usuario</span>
              <small>Datos personales y UID</small>
            </NavLink>
          </nav>
        </aside>

        <div className="dashboard-content">
          <header className="dashboard-header">
            <div>
              <p className="eyebrow">Hola {user?.fullName}</p>
              <h1>Tus servicios</h1>
              <p className="muted">Marca los pagos realizados y mantén tu flujo al día.</p>
            </div>
            <div className="header-actions">
              <span className="muted">{user?.email}</span>
              <button type="button" className="ghost" onClick={() => dispatch(logoutFromSession())}>
                Cerrar sesión
              </button>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/servicios" element={<ServicesAdmin />} />
            <Route path="/perfil" element={<UserProfile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Cerrar menú principal"
          onClick={closeMobileMenu}
        />
      ) : null}
    </section>
  )
}

export default Dashboard
