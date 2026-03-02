import { useMemo } from 'react'
import type { Payment } from '../types/payment'

type ServiceCardProps = {
    payment: Payment
    onToggleStatus: (id: string) => void
}

function ServiceCard({ payment, onToggleStatus }: ServiceCardProps) {
    const isOverdue = useMemo(() => {
        if (payment.status !== 'pending' || !payment.dueDate) return false
        const today = new Date()
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        return payment.dueDate < todayStr
    }, [payment.status, payment.dueDate])

    return (
        <li className="card payment-item gap-2!">
            <div className='flex flex-col'>
                <div className='flex items-center justify-between min-[720px]:justify-start gap-2'>
                    <p className="payment-service mb-0!">{payment.service}</p>
                </div>
                <span className="amount text-2xl!">${payment.amount.toLocaleString('es-AR')}</span>
                {payment.dueDate ? (
                    <p className="muted text-xs!">Vence el {new Date(payment.dueDate).toLocaleDateString('es-AR')}</p>
                ) : null}
            </div>
            <div className='flex flex-col items-start sm:items-end gap-2'>
                <span className={`status ${isOverdue ? 'overdue' : payment.status} text-xs!`}>
                    {isOverdue ? 'Pago Vencido' : payment.status === 'pending' ? 'Pendiente' : 'Pagado'}
                </span>
                {payment.status === 'pending' ? (
                    <button type="button" onClick={() => onToggleStatus(payment.id)} className="py-2! px-3! bg-gray-100! hover:bg-gray-200! transition-colors! text-sm! w-full! sm:w-auto">
                        Marcar como pagado
                    </button>
                ) : (
                    <button type="button" onClick={() => onToggleStatus(payment.id)} className="py-2! px-3! bg-gray-100! hover:bg-gray-200! transition-colors! text-sm! w-full! sm:w-auto">
                        Marcar como pendiente
                    </button>
                )}
            </div>
        </li>
    )
}

export default ServiceCard
