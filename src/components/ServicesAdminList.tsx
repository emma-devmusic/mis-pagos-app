import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Loader2, Pencil, Trash2 } from 'lucide-react'
import { deleteService, loadServices, payServiceDebt } from '../features/services/servicesSlice.ts'
import { useAppDispatch, useAppSelector } from '../hooks.ts'
import type { PageAction } from './Page.tsx'
import Page from './Page.tsx'

function ServicesAdminList() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const servicesState = useAppSelector((state) => state.services)
  const services = servicesState.items
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)

  // Cargar servicios al montar (si aún no se cargaron)
  useEffect(() => {
    if (servicesState.status === 'idle') {
      void dispatch(loadServices())
    }
  }, [dispatch, servicesState.status])

  const orderedServices = useMemo(() => {
    return [...services].sort((a, b) => a.name.localeCompare(b.name))
  }, [services])

  const handleRemove = async (id: string) => {
    setDeletingId(id)
    try {
      await dispatch(deleteService(id)).unwrap()
    } finally {
      setDeletingId(null)
    }
  }

  const handlePay = async (id: string) => {
    setPayingId(id)
    try {
      await dispatch(payServiceDebt(id)).unwrap()
    } finally {
      setPayingId(null)
    }
  }

  const handleEdit = (id: string) => {
    navigate(`/servicios/editar/${id}`)
  }

  const actions: PageAction[] = [
    {
      label: 'Crear servicio',
      variant: 'primary',
      onClick: () => navigate('/servicios/crear'),
    },
  ]

  return (
    <Page
      title="Administrar servicios"
      description="Agrega nuevos servicios o archiva los que ya no formen parte de tu flujo."
      onBack={() => navigate('/')}
      actions={actions}
    >
      <div className="card services-admin-list">
        <header>
          <div>
            <p className="eyebrow">Listado</p>
            <h2 className="text-xl font-semibold">Servicios activos</h2>
            <p className="muted">Mantén el listado curado para que el dashboard se mantenga liviano.</p>
          </div>
        </header>

        {servicesState.status === 'loading' && <p className="muted">Cargando servicios...</p>}

        {servicesState.status !== 'loading' && orderedServices.length === 0 ? (
          <p className="muted border-gray-800 border-t pt-3">Todavía no cargaste servicios. Usa el botón para empezar.</p>
        ) : (
          <ul>
            {orderedServices.map((svc) => (
              <li key={svc.id}>
                <div>
                  <p className="payment-service">{svc.name}</p>
                  <p className="muted">
                    ${svc.amount.toLocaleString('es-AR')}
                    {svc.isRecurring && svc.recurrence
                      ? ` · vence día ${svc.recurrence.dueDay} de cada mes`
                      : svc.dueDate
                        ? ` · vence el ${new Date(svc.dueDate + 'T12:00:00').toLocaleDateString('es-AR')}`
                        : ''}
                  </p>
                  {/* Indicador de deuda acumulada */}
                  {svc.debtAmount > 0 && (
                    <p className="error-text" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                      Deuda: ${svc.debtAmount.toLocaleString('es-AR')}
                      {svc.debtMonths > 1 ? ` (${svc.debtMonths} meses)` : ' (1 mes)'}
                    </p>
                  )}
                </div>
                <div className="services-admin-list-actions">
                  <span className={`status ${svc.active ? 'completed' : 'pending'}`}>
                    {svc.active ? 'Activo' : 'Inactivo'}
                  </span>
                  {svc.isRecurring && (
                    <span className="status pending" style={{ opacity: 0.7 }}>Mensual</span>
                  )}
                  {/* Botón pagar: solo visible si hay deuda */}
                  {svc.debtAmount > 0 && (
                    <button
                      type="button"
                      className="ghost icon-btn"
                      aria-label="Pagar un mes de deuda"
                      disabled={payingId === svc.id}
                      onClick={() => handlePay(svc.id)}
                      style={{ color: 'var(--color-success, #4ade80)' }}
                    >
                      {payingId === svc.id
                        ? <Loader2 size={15} className="icon-spin" />
                        : <CheckCircle size={15} />}
                      <span className="icon-btn-label">
                        {payingId === svc.id ? 'Pagando...' : 'Pagar mes'}
                      </span>
                    </button>
                  )}
                  <button type="button" className="ghost icon-btn" aria-label="Editar servicio" onClick={() => handleEdit(svc.id)}>
                    <Pencil size={15} />
                    <span className="icon-btn-label">Editar</span>
                  </button>
                  <button
                    type="button"
                    className="ghost icon-btn icon-btn--danger"
                    aria-label="Eliminar servicio"
                    disabled={deletingId === svc.id}
                    onClick={() => handleRemove(svc.id)}
                  >
                    {deletingId === svc.id ? <Loader2 size={15} className="icon-spin" /> : <Trash2 size={15} />}
                    <span className="icon-btn-label">
                      {deletingId === svc.id ? 'Eliminando...' : 'Eliminar'}
                    </span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {servicesState.mutationStatus === 'failed' && servicesState.error ? (
          <p className="error-text">{servicesState.error}</p>
        ) : null}
      </div>
    </Page>
  )
}

export default ServicesAdminList
