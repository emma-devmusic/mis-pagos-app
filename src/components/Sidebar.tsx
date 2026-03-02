import { NavLink } from 'react-router-dom'
import type { AuthUser } from '../types/auth'
import { X } from 'lucide-react'

type SidebarProps = {
  id: string
  isOpen: boolean
  onClose: () => void
  user: AuthUser | null
  onLogout: () => void
}

function Sidebar({ id, isOpen, onClose, user, onLogout }: SidebarProps) {
  return (
    <aside
      id={id}
      className={`services-sidebar ${isOpen ? 'open' : ''}`}
      aria-label="Navegación del panel"
    >
      <div className="sidebar-header items-center!">
        <div>
          <p className="eyebrow">Panel</p>
        </div>
        <button type="button" className="ghost sidebar-close p-2!" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      <nav className="sidebar-menu">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <span>Resumen general</span>
          <small>Estadísticas y pagos filtrados</small>
        </NavLink>
        <NavLink
          to="/servicios"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <span>Administrar servicios</span>
          <small>Crear, editar o eliminar registros</small>
        </NavLink>
        <NavLink
          to="/perfil"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <span>Perfil del usuario</span>
          <small>Datos personales y UID</small>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <span className="muted sidebar-user-email">{user?.email}</span>
        <button
          type="button"
          className="ghost sidebar-logout"
          onClick={onLogout}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
