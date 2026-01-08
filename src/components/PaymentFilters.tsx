import type { PaymentFilters as FilterState } from '../types/payment'

type PaymentFiltersProps = {
  status: FilterState['status']
  search: string
  onStatusChange: (status: FilterState['status']) => void
  onSearchChange: (value: string) => void
}

function PaymentFilters({ status, search, onStatusChange, onSearchChange }: PaymentFiltersProps) {
  return (
    <div className="card filters-card">
      <div className="filters-status">
        <button
          type="button"
          className={status === 'all' ? 'active' : ''}
          onClick={() => onStatusChange('all')}
        >
          Todos
        </button>
        <button
          type="button"
          className={status === 'pending' ? 'active' : ''}
          onClick={() => onStatusChange('pending')}
        >
          Pendientes
        </button>
        <button
          type="button"
          className={status === 'completed' ? 'active' : ''}
          onClick={() => onStatusChange('completed')}
        >
          Pagados
        </button>
      </div>
      <label className="stack">
        <span>Filtrar por servicio</span>
        <input
          type="search"
          placeholder="Buscar por nombre"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
    </div>
  )
}

export default PaymentFilters
