import { useEffect, useMemo } from 'react'
import { logoutFromSession } from '../features/auth/authSlice'
import { loadPayments, setSearchFilter, setStatusFilter, togglePaymentStatus } from '../features/payments/paymentsSlice'
import { useAppDispatch, useAppSelector } from '../hooks'
import PaymentFilters from './PaymentFilters'
import PaymentsList from './PaymentsList'

function Dashboard() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const { items, filters, status, error } = useAppSelector((state) => state.payments)

  useEffect(() => {
    if (!user) {
      return
    }
    if (status === 'idle' && items.length === 0) {
      dispatch(loadPayments())
    }
  }, [dispatch, status, items.length, user])

  const filteredPayments = useMemo(() => {
    return items.filter((payment) => {
      const matchStatus = filters.status === 'all' || payment.status === filters.status
      const matchSearch = payment.service.toLowerCase().includes(filters.search.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [items, filters])

  const totalAmount = filteredPayments.reduce((total, payment) => total + payment.amount, 0)
  const pendingCount = filteredPayments.filter((payment) => payment.status === 'pending').length
  const isFetching = status === 'loading' && items.length === 0

  return (
    <section className="dashboard">
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

      <section className="highlights">
        <div className="card highlight">
          <p className="muted">Monto filtrado</p>
          <p className="highlight-value">${totalAmount.toLocaleString('es-AR')}</p>
        </div>
        <div className="card highlight">
          <p className="muted">Pendientes</p>
          <p className="highlight-value">{pendingCount}</p>
        </div>
        <div className="card highlight">
          <p className="muted">Total resultados</p>
          <p className="highlight-value">{filteredPayments.length}</p>
        </div>
      </section>

      <PaymentFilters
        status={filters.status}
        search={filters.search}
        onStatusChange={(status) => dispatch(setStatusFilter(status))}
        onSearchChange={(value) => dispatch(setSearchFilter(value))}
      />

      {isFetching ? (
        <div className="card">
          <p className="muted">Cargando pagos...</p>
        </div>
      ) : null}

      {status === 'failed' ? (
        <div className="card error-card">
          <div>
            <p className="error-text">{error ?? 'No pudimos cargar los pagos.'}</p>
            <p className="muted">Revisa tu conexión e inténtalo nuevamente.</p>
          </div>
          <button type="button" onClick={() => dispatch(loadPayments())}>Reintentar</button>
        </div>
      ) : null}

      {status !== 'failed' ? (
        <PaymentsList payments={filteredPayments} onToggleStatus={(id) => dispatch(togglePaymentStatus(id))} />
      ) : null}
    </section>
  )
}

export default Dashboard
