
import type { Payment } from '../types/payment'
import ServiceCard from './ServiceCard'

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
        <ServiceCard key={payment.id} payment={payment} onToggleStatus={onToggleStatus} />
      ))}
    </ul>
  )
}

export default PaymentsList
