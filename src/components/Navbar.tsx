type NavbarProps = {
  sidebarId: string
  isMenuOpen: boolean
  onMenuToggle: () => void
}

function Navbar({ sidebarId, isMenuOpen, onMenuToggle }: NavbarProps) {
  return (
    <header className="navbar">
      <span className="navbar-brand">SimpleCuenta</span>
      <button
        type="button"
        className="ghost navbar-hamburger"
        aria-controls={sidebarId}
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        onClick={onMenuToggle}
      >
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
      </button>
    </header>
  )
}

export default Navbar
