import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { logoutFromSession } from '../features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '../hooks'
import DashboardOverview from './DashboardOverview.tsx'
import Navbar from './Navbar.tsx'
import ServiceFormView from './ServiceFormView.tsx'
import ServicesAdminList from './ServicesAdminList.tsx'
import Sidebar from './Sidebar.tsx'
import UserProfile from './UserProfile.tsx'

function Dashboard() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const sidebarId = 'services-sidebar'

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <section className="dashboard max-w-full">
      <Navbar
        sidebarId={sidebarId}
        isMenuOpen={isMobileMenuOpen}
        onMenuToggle={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      <div className="dashboard-layout">
        <Sidebar
          id={sidebarId}
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          user={user}
          onLogout={() => dispatch(logoutFromSession())}
        />

        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<DashboardOverview />} />
            <Route path="/servicios" element={<ServicesAdminList />} />
            <Route path="/servicios/crear" element={<ServiceFormView />} />
            <Route path="/servicios/editar/:id" element={<ServiceFormView />} />
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
