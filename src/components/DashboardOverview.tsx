import { useEffect, useMemo, useState } from 'react'
import { loadServices, toggleServicePaid } from '../features/services/servicesSlice'
import { useAppDispatch, useAppSelector } from '../hooks'
import Page from './Page'
import PaymentFilters from './PaymentFilters'
import PaymentsList from './PaymentsList'

function DashboardOverview() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const { items: services, status, error } = useAppSelector((state) => state.services)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all')

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(loadServices())
    }
  }, [dispatch, status])

  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const matchSearch = svc.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && !svc.paid) ||
        (statusFilter === 'completed' && svc.paid)
      return matchSearch && matchStatus
    })
  }, [services, search, statusFilter])

  const totalDebt = filteredServices.reduce((total, svc) => total + svc.debtAmount, 0)
  const pendingCount = filteredServices.filter((svc) => !svc.paid).length
  const isFetching = status === 'idle' || status === 'loading'

  const paymentsForDisplay = useMemo(() => {
    return filteredServices.map((svc) => ({
      id: svc.id,
      service: svc.name,
      // When debt is zero, show the regular monthly amount as reference
      amount: svc.debtAmount > 0 ? svc.debtAmount : svc.amount,
      dueDate: svc.dueDate ?? '',
      status: (svc.paid ? 'completed' : 'pending') as 'pending' | 'completed',
    }))
  }, [filteredServices])

  return (
    <Page
      eyebrow={user ? `Hola ${user.fullName}` : undefined}
      title="Tus servicios"
      description="Marca los pagos realizados y mantén tu flujo al día."
    >
      <section className="highlights">
        <div className="card highlight p-3!">
          <p className="muted text-xs md:text-base">Deuda total</p>
          <p className="highlight-value text-base! md:text-lg!">${totalDebt.toLocaleString('es-AR')}</p>
        </div>
        <div className="card highlight p-3!">
          <p className="muted text-xs md:text-base">Con deuda</p>
          <p className="highlight-value text-base! md:text-lg!">{pendingCount}</p>
        </div>
        <div className="card highlight p-3!">
          <p className="muted text-xs md:text-base">Resultados</p>
          <p className="highlight-value text-base! md:text-lg!">{filteredServices.length}</p>
        </div>
      </section>

      <PaymentFilters
        status={statusFilter}
        search={search}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearch}
      />

      {isFetching ? (
        <div className="card">
          <p className="muted">Cargando servicios...</p>
        </div>
      ) : null}

      {status === 'failed' ? (
        <div className="card error-card">
          <div>
            <p className="error-text">{error ?? 'No pudimos cargar los servicios.'}</p>
            <p className="muted">Revisa tu conexión e inténtalo nuevamente.</p>
          </div>
          <button type="button" onClick={() => void dispatch(loadServices())}>Reintentar</button>
        </div>
      ) : null}

      {!isFetching && status !== 'failed' ? (
        <PaymentsList
          payments={paymentsForDisplay}
          onToggleStatus={(id) => void dispatch(toggleServicePaid(id))}
        />
      ) : null}
    </Page>
  )
}

export default DashboardOverview
