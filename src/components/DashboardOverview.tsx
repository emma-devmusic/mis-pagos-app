import { useMemo } from 'react'
import { loadPayments, setSearchFilter, setStatusFilter, togglePaymentStatus } from '../features/payments/paymentsSlice'
import { useAppDispatch, useAppSelector } from '../hooks'
import PaymentFilters from './PaymentFilters'
import PaymentsList from './PaymentsList'

function DashboardOverview() {
  const dispatch = useAppDispatch()
  const { items, filters, status, error } = useAppSelector((state) => state.payments)

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
    <>
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
        onStatusChange={(value) => dispatch(setStatusFilter(value))}
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
    </>
  )
}

export default DashboardOverview
