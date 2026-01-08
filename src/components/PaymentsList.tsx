import type { Payment } from '../types/payment'

type PaymentsListProps = {
  payments: Payment[]
  onToggleStatus: (id: string) => void
}

function PaymentsList({ payments, onToggleStatus }: PaymentsListProps) {
  if (payments.length === 0) {
    return (
      <div className="card">
        <p className="muted">No encontramos pagos con los filtros seleccionados.</p>
      </div>
    )
  }

  return (
    <ul className="payments-list">
      {payments.map((payment) => (
        <li key={payment.id} className="card payment-item">
          <div>
            <p className="payment-service">{payment.service}</p>
            <p className="muted">Vence el {new Date(payment.dueDate).toLocaleDateString()}</p>
          </div>
          <div className="payment-meta">
            <span className="amount">${payment.amount.toLocaleString('es-AR')}</span>
            <span className={`status ${payment.status}`}>
              {payment.status === 'pending' ? 'Pendiente' : 'Pagado'}
            </span>
          </div>
          <button type="button" onClick={() => onToggleStatus(payment.id)}>
            {payment.status === 'pending' ? 'Marcar como pagado' : 'Marcar como pendiente'}
          </button>
        </li>
      ))}
    </ul>
  )
}

export default PaymentsList
