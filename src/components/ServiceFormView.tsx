import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { FormEvent } from 'react'
import { createService, updateService } from '../features/services/servicesSlice.ts'
import { useAppDispatch, useAppSelector } from '../hooks.ts'
import Page from './Page.tsx'

// Rango seguro de días: 1-28 funciona en todos los meses (incluido febrero)
const DUE_DAYS = Array.from({ length: 28 }, (_, i) => i + 1)

function ServiceFormView() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()

  const servicesState = useAppSelector((state) => state.services)
  const service = id ? servicesState.items.find((s) => s.id === id) : null
  const isSaving = servicesState.mutationStatus === 'loading'

  // ── Estado del formulario ──
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [dueDay, setDueDay] = useState(1)
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [active, setActive] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)

  // Pre-cargar datos cuando editamos
  useEffect(() => {
    if (id && service) {
      setName(service.name)
      setAmount(String(service.amount))
      setIsRecurring(service.isRecurring)
      setDueDay(service.recurrence?.dueDay ?? 1)
      setDueDate(service.dueDate ?? new Date().toISOString().slice(0, 10))
      setActive(service.active)
    }
  }, [id, service])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = name.trim()
    const numericAmount = Number(amount)

    if (!trimmedName) {
      setFormError('Ingresa un nombre válido para el servicio.')
      return
    }
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setFormError('El monto debe ser mayor a 0.')
      return
    }

    const payload = {
      name: trimmedName,
      amount: numericAmount,
      isRecurring,
      ...(isRecurring
        ? { recurrence: { type: 'monthly' as const, dueDay } }
        : { dueDate }),
      active,
    }

    try {
      if (id && service) {
        // Preservar campos de deuda gestionados por el sistema
        await dispatch(updateService({ ...service, ...payload, id })).unwrap()
      } else {
        await dispatch(createService(payload)).unwrap()
      }
      setFormError(null)
      navigate('/servicios')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No pudimos guardar el servicio.')
    }
  }

  return (
    <Page
      title={id ? 'Editar servicio' : 'Nuevo servicio'}
      description={
        id
          ? 'Actualizá los datos del servicio. Los cambios se aplicarán a partir del próximo período.'
          : 'Configurá un nuevo servicio. Si es recurrente, se generará un pago automático cada mes.'
      }
      onBack={() => navigate('/servicios')}
    >
      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre */}
          <label className="stack">
            <span>Nombre del servicio</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Internet fibra"
              required
            />
          </label>

          {/* Monto */}
          <label className="stack">
            <span>Monto estimado</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="12000"
              required
            />
          </label>

          {/* Toggle recurrente */}
          <label className="stack-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <span>Mensual (recurrente)</span>
          </label>

          {/* Día de vencimiento — solo visible si es recurrente */}
          {isRecurring && (
            <label className="stack">
              <span>Día de vencimiento</span>
              <select value={dueDay} onChange={(e) => setDueDay(Number(e.target.value))}>
                {DUE_DAYS.map((day) => (
                  <option key={day} value={day}>
                    Día {day}
                  </option>
                ))}
              </select>
              <small className="muted">A partir de este día cada mes se acumulará deuda si no registrás el pago.</small>
            </label>
          )}

          {/* Fecha de vencimiento puntual — solo visible si NO es recurrente */}
          {!isRecurring && (
            <label className="stack">
              <span>Fecha de vencimiento</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </label>
          )}

          {/* Activo / inactivo */}
          <label className="stack-row" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              style={{ width: 'auto' }}
            />
            <span>Servicio activo</span>
          </label>

          {formError ? <p className="error-text">{formError}</p> : null}

          <div className="flex gap-2">
            <button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : id ? 'Actualizar servicio' : 'Guardar servicio'}
            </button>
            <button type="button" className="ghost" onClick={() => navigate('/servicios')} disabled={isSaving}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </Page>
  )
}

export default ServiceFormView
