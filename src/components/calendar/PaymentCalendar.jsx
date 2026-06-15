import React, { useState } from 'react'
import { useBudget } from '../../context/BudgetContext'
import { formatCurrency } from '../../utils/formatCurrency'
import {
  format, getDaysInMonthGrid, isToday, isSameDay, parseISO,
  startOfMonth, addMonths, subMonths, getDay,
} from '../../utils/dateHelpers'
import Modal from '../layout/Modal'
import { ChevronLeft, ChevronRight, Plus, Check, Trash2, X } from 'lucide-react'

export default function PaymentCalendar() {
  const { payments, dispatch, addToast } = useBudget()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [formData, setFormData] = useState({
    title: '', amount: '', dueDay: '', recurring: true, reminderDays: 3, category: 'Bills',
  })

  const days = getDaysInMonthGrid(currentMonth)
  const monthLabel = format(currentMonth, 'MMMM yyyy')

  const getPaymentsForDay = (day) => {
    if (!day) return []
    return payments.filter(p => {
      if (!p.nextDue) return false
      const dueDate = parseISO(p.nextDue)
      return isSameDay(dueDate, day)
    })
  }

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const handleDayClick = (day) => {
    setSelectedDay(day)
  }

  const handleAddPayment = () => {
    setEditingPayment(null)
    setFormData({ title: '', amount: '', dueDay: '', recurring: true, reminderDays: 3, category: 'Bills' })
    setShowAddModal(true)
  }

  const handleEditPayment = (payment) => {
    setEditingPayment(payment)
    setFormData({
      title: payment.title,
      amount: String(payment.amount),
      dueDay: String(payment.dueDay || ''),
      recurring: payment.recurring,
      reminderDays: payment.reminderDays || 3,
      category: payment.category || 'Bills',
    })
    setShowAddModal(true)
  }

  const handleSavePayment = () => {
    if (!formData.title || !formData.amount || !formData.dueDay) {
      addToast({ type: 'warning', message: 'Please fill in all required fields' })
      return
    }

    if (editingPayment) {
      dispatch({ type: 'EDIT_PAYMENT', payload: { ...editingPayment, ...formData, amount: Number(formData.amount), dueDay: Number(formData.dueDay), reminderDays: Number(formData.reminderDays) } })
      addToast({ type: 'success', message: `Payment "${formData.title}" updated` })
    } else {
      dispatch({ type: 'ADD_PAYMENT', payload: { ...formData, amount: Number(formData.amount), dueDay: Number(formData.dueDay), reminderDays: Number(formData.reminderDays), paid: false } })
      addToast({ type: 'success', message: `Payment "${formData.title}" added` })
    }
    setShowAddModal(false)
  }

  const handleDeletePayment = (id) => {
    dispatch({ type: 'DELETE_PAYMENT', id })
    addToast({ type: 'info', message: 'Payment deleted' })
  }

  const handleMarkPaid = (id) => {
    dispatch({ type: 'MARK_PAYMENT_PAID', id })
    addToast({ type: 'success', message: 'Payment marked as paid!' })
  }

  const selectedDayPayments = selectedDay ? getPaymentsForDay(selectedDay) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold gold-text">PAYMENT VAULT</h1>
          <p className="text-vault-stone-light font-vault text-sm">Track and manage your recurring payments</p>
        </div>
        <button onClick={handleAddPayment} className="vault-btn flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Payment
        </button>
      </div>

      {/* Calendar */}
      <div className="vault-panel p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={handlePrevMonth} className="vault-btn-outline p-2">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-display text-vault-gold text-xl font-bold">{monthLabel}</h2>
          <button onClick={handleNextMonth} className="vault-btn-outline p-2">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-vault-stone-light text-xs font-vault uppercase py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={i} className="aspect-square" />

            const dayPayments = getPaymentsForDay(day)
            const hasPayments = dayPayments.length > 0
            const isTodayDay = isToday(day)
            const isSelected = selectedDay && isSameDay(selectedDay, day)

            return (
              <button
                key={i}
                onClick={() => handleDayClick(day)}
                className={`aspect-square p-1 rounded relative transition-all font-vault text-sm
                  ${isSelected ? 'bg-vault-gold text-vault-bg' : ''}
                  ${isTodayDay ? 'border border-vault-gold' : ''}
                  ${hasPayments ? 'calendar-day-has-payment' : ''}
                  hover:bg-vault-dark
                `}
              >
                <span className={`${isTodayDay ? 'font-bold text-vault-gold' : 'text-vault-gold-light'}`}>
                  {format(day, 'd')}
                </span>
                {hasPayments && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {dayPayments.slice(0, 3).map((_, j) => (
                      <div key={j} className="w-1 h-1 bg-vault-gold rounded-full" />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="vault-panel p-6 animate-fade-in">
          <h3 className="font-display text-vault-gold text-lg font-bold mb-4">
            {format(selectedDay, 'EEEE, MMMM d, yyyy')}
          </h3>
          {selectedDayPayments.length === 0 ? (
            <p className="text-vault-stone-light font-vault text-sm">No payments scheduled for this day</p>
          ) : (
            <div className="space-y-3">
              {selectedDayPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-vault-dark rounded">
                  <div className="flex-1">
                    <div className="text-vault-gold-light font-vault">{p.title}</div>
                    <div className="text-vault-stone-light text-xs">{p.category} • Due Day: {p.dueDay}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-vault text-vault-gold font-bold">{formatCurrency(Number(p.amount))}</span>
                    {!p.paid && (
                      <button
                        onClick={() => handleMarkPaid(p.id)}
                        className="text-green-400 hover:text-green-300"
                        title="Mark as paid"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEditPayment(p)}
                      className="vault-btn-outline text-xs px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePayment(p.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Payments List */}
      <div className="vault-panel p-6">
        <h2 className="font-display text-vault-gold text-lg font-bold mb-4">All Scheduled Payments</h2>
        {payments.length === 0 ? (
          <p className="text-vault-stone-light font-vault text-sm">No payments scheduled</p>
        ) : (
          <div className="space-y-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-vault-dark rounded">
                <div className="flex-1">
                  <div className="text-vault-gold-light font-vault text-sm">{p.title}</div>
                  <div className="text-vault-stone-light text-xs">
                    Due: {p.nextDue ? format(parseISO(p.nextDue), 'MMM d') : 'N/A'} • {p.recurring ? 'Recurring' : 'One-time'}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-vault text-vault-gold font-bold">{formatCurrency(Number(p.amount))}</span>
                  {!p.paid && (
                    <button onClick={() => handleMarkPaid(p.id)} className="text-green-400 hover:text-green-300">
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => handleEditPayment(p)} className="vault-btn-outline text-xs px-2 py-1">
                    Edit
                  </button>
                  <button onClick={() => handleDeletePayment(p.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingPayment ? 'Edit Payment' : 'Add Payment'}>
        <div className="space-y-4">
          <div>
            <label className="vault-label">Title *</label>
            <input
              type="text"
              className="vault-input"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="Rent, Netflix, etc."
            />
          </div>
          <div>
            <label className="vault-label">Amount *</label>
            <input
              type="number"
              className="vault-input"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="vault-label">Due Day (1-31) *</label>
            <input
              type="number"
              className="vault-input"
              value={formData.dueDay}
              onChange={e => setFormData({ ...formData, dueDay: e.target.value })}
              placeholder="15"
              min="1"
              max="31"
            />
          </div>
          <div>
            <label className="vault-label">Category</label>
            <select
              className="vault-select"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option>Bills</option>
              <option>Housing</option>
              <option>Insurance</option>
              <option>Entertainment</option>
              <option>Subscriptions</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="vault-label">Reminder Days Before</label>
            <input
              type="number"
              className="vault-input"
              value={formData.reminderDays}
              onChange={e => setFormData({ ...formData, reminderDays: e.target.value })}
              min="1"
              max="30"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.recurring}
              onChange={e => setFormData({ ...formData, recurring: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="recurring" className="text-vault-gold-light font-vault text-sm">
              Recurring monthly payment
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={handleSavePayment} className="vault-btn flex-1">
              {editingPayment ? 'Update' : 'Add'} Payment
            </button>
            <button onClick={() => setShowAddModal(false)} className="vault-btn-outline flex-1">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
