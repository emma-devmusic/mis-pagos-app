import type { Payment } from '../types/payment'

type ServiceCardProps = {
    payment: Payment
    onToggleStatus: (id: string) => void
}

function ServiceCard({ payment, onToggleStatus }: ServiceCardProps) {
    return (
        <li className="card payment-item gap-2!">
            <div className='flex flex-col'>
                <div className='flex items-center justify-between min-[720px]:justify-start gap-2'>
                    <p className="payment-service mb-0!">{payment.service}</p>
                </div>
                <span className="amount text-2xl!">${payment.amount.toLocaleString('es-AR')}</span>
                <p className="muted text-xs!">Vence el {new Date(payment.dueDate).toLocaleDateString('es-AR')}</p>
            </div>
            <div className='flex flex-col items-start sm:items-end gap-2'>
                <span className={`status ${payment.status} text-xs!`}>
                    {payment.status === 'pending' ? 'Pendiente' : 'Pagado'}
                </span>
                <button type="button" onClick={() => onToggleStatus(payment.id)} className="py-2! px-3! bg-gray-100! hover:bg-gray-200! transition-colors! text-sm! w-full! sm:w-auto">
                    {payment.status === 'pending' ? 'Marcar como pagado' : 'Marcar como pendiente'}
                </button>
            </div>
        </li>
    )
}

export default ServiceCard
