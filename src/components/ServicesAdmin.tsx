import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createPayment, deletePayment, updatePayment } from '../features/payments/paymentsSlice'
import { useAppDispatch, useAppSelector } from '../hooks'
import type { PaymentStatus } from '../types/payment.ts'
import type { FormEvent } from 'react'

const defaultDate = () => new Date().toISOString().slice(0, 10)

function ServicesAdmin() {
  const dispatch = useAppDispatch()
  const paymentsState = useAppSelector((state) => state.payments)
  const payments = paymentsState.items
  const [service, setService] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState(() => defaultDate())
  const [status, setStatus] = useState<PaymentStatus>('pending')
  const [formError, setFormError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const isSaving = paymentsState.mutationStatus === 'loading'

  const orderedPayments = useMemo(() => {
    return [...payments].sort((a, b) => a.service.localeCompare(b.service))
  }, [payments])

  const resetForm = () => {
    setService('')
    setAmount('')
    setDueDate(defaultDate())
    setStatus('pending')
    setEditingId(null)
    setFormError(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedService = service.trim()
    const numericAmount = Number(amount)

    if (!trimmedService || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('Ingresa un nombre válido y un monto mayor a 0.')
      return
    }

    try {
      if (editingId) {
        await dispatch(
          updatePayment({
            id: editingId,
            service: trimmedService,
            amount: numericAmount,
            dueDate,
            status,
          }),
        ).unwrap()
      } else {
        await dispatch(
          createPayment({
            service: trimmedService,
            amount: numericAmount,
            dueDate,
            status,
          }),
        ).unwrap()
      }
      setFormError(null)
      resetForm()
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No pudimos guardar el servicio.')
    }
  }

  const handleRemove = (id: string) => {
    dispatch(deletePayment(id))
  }

  const handleEdit = (id: string) => {
    const payment = payments.find((item) => item.id === id)
    if (!payment) {
      return
    }
    setService(payment.service)
    setAmount(String(payment.amount))
    setDueDate(payment.dueDate)
    setStatus(payment.status)
    setEditingId(payment.id)
    setFormError(null)
  }

  return (
    <section className="services-admin">
      <div className="card services-admin-form">
        <header>
          <p className="eyebrow">Catálogo</p>
          <h2>Administrar servicios</h2>
          <p className="muted">Agrega nuevos servicios o archiva los que ya no formen parte de tu flujo.</p>
        </header>
        <form onSubmit={handleSubmit} className="services-admin-form-fields">
          <label className="stack">
            <span>Nombre del servicio</span>
            <input
              type="text"
              value={service}
              onChange={(event) => setService(event.target.value)}
              placeholder="Ej: Internet fibra"
            />
          </label>
          <label className="stack">
            <span>Monto estimado</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="12000"
            />
          </label>
          <label className="stack">
            <span>Próximo vencimiento</span>
            <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </label>
          <label className="stack">
            <span>Estado inicial</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as PaymentStatus)}>
              <option value="pending">Pendiente</option>
              <option value="completed">Pagado</option>
            </select>
          </label>
          {formError ? <p className="error-text">{formError}</p> : null}
          <div className="services-admin-form-actions">
            <button type="submit" disabled={isSaving}>
              {editingId ? 'Actualizar servicio' : 'Guardar servicio'}
            </button>
            {editingId ? (
              <button type="button" className="ghost" onClick={resetForm} disabled={isSaving}>
                Cancelar edición
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="card services-admin-list">
        <header>
          <div>
            <p className="eyebrow">Listado</p>
            <h2>Servicios activos</h2>
            <p className="muted">Mantén el listado curado para que el dashboard se mantenga liviano.</p>
          </div>
          <Link to="/" className="ghost">
            Volver al dashboard
          </Link>
        </header>
        {orderedPayments.length === 0 ? (
          <p className="muted">Todavía no cargaste servicios. Usa el formulario para empezar.</p>
        ) : (
          <ul>
            {orderedPayments.map((payment) => (
              <li key={payment.id}>
                <div>
                  <p className="payment-service">{payment.service}</p>
                  <p className="muted">
                    ${payment.amount.toLocaleString('es-AR')} · vence el {new Date(payment.dueDate).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <div className="services-admin-list-actions">
                  <span className={`status ${payment.status}`}>{payment.status === 'pending' ? 'Pendiente' : 'Pagado'}</span>
                  <button type="button" className="ghost" onClick={() => handleEdit(payment.id)}>
                    Editar
                  </button>
                  <button type="button" className="ghost" onClick={() => handleRemove(payment.id)}>
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {paymentsState.mutationStatus === 'failed' && paymentsState.error ? (
          <p className="error-text">{paymentsState.error}</p>
        ) : null}
      </div>
    </section>
  )
}

export default ServicesAdmin
