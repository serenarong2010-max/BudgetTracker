import React, { useState } from 'react'
import { useBudget } from '../../context/BudgetContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { format, parseISO } from '../../utils/dateHelpers'
import Modal from '../layout/Modal'
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, Search } from 'lucide-react'

export default function Ledger() {
  const { transactions, dispatch, addToast } = useBudget()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTx, setEditingTx] = useState(null)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: 'Food',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })

  const handleAdd = () => {
    setEditingTx(null)
    setFormData({
      type: 'expense',
      amount: '',
      category: 'Food',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    })
    setShowAddModal(true)
  }

  const handleEdit = (tx) => {
    setEditingTx(tx)
    setFormData({
      type: tx.type,
      amount: String(tx.amount),
      category: tx.category,
      description: tx.description,
      date: tx.date,
    })
    setShowAddModal(true)
  }

  const handleSave = () => {
    if (!formData.amount || !formData.description) {
      addToast({ type: 'warning', message: 'Please fill in all required fields' })
      return
    }

    if (editingTx) {
      dispatch({ type: 'EDIT_TRANSACTION', payload: { ...editingTx, ...formData, amount: Number(formData.amount) } })
      addToast({ type: 'success', message: 'Transaction updated' })
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: { ...formData, amount: Number(formData.amount) } })
      addToast({ type: 'success', message: 'Transaction added' })
    }
    setShowAddModal(false)
  }

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_TRANSACTION', id })
    addToast({ type: 'info', message: 'Transaction deleted' })
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      return (
        tx.description.toLowerCase().includes(search) ||
        tx.category.toLowerCase().includes(search)
      )
    }
    return true
  })

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const net = totalIncome - totalExpenses

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold gold-text">LEDGER VAULT</h1>
          <p className="text-vault-stone-light font-vault text-sm">Track every coin that flows in and out</p>
        </div>
        <button onClick={handleAdd} className="vault-btn flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-vault-stone-light uppercase">Income</span>
          </div>
          <span className="font-vault text-lg font-bold text-green-400">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-vault-stone-light uppercase">Expenses</span>
          </div>
          <span className="font-vault text-lg font-bold text-red-400">{formatCurrency(totalExpenses)}</span>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-vault-stone-light uppercase">Net</span>
          </div>
          <span className={`font-vault text-lg font-bold ${net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {net >= 0 ? '+' : ''}{formatCurrency(net)}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="vault-panel p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-vault-stone-light" />
          <input
            type="text"
            className="vault-input pl-10"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`vault-btn-outline text-sm ${filter === 'all' ? 'bg-vault-gold text-vault-bg' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`vault-btn-outline text-sm ${filter === 'income' ? 'bg-vault-gold text-vault-bg' : ''}`}
          >
            Income
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`vault-btn-outline text-sm ${filter === 'expense' ? 'bg-vault-gold text-vault-bg' : ''}`}
          >
            Expenses
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="vault-panel overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-vault-stone-light font-vault">No transactions found</p>
          </div>
        ) : (
          <div className="divide-y divide-vault-border">
            {filteredTransactions.map(tx => (
              <div
                key={tx.id}
                className={`flex items-center justify-between p-4 hover:bg-vault-dark transition-colors ${
                  tx.type === 'income' ? 'income-row' : 'expense-row'
                }`}
              >
                <div className="flex-1">
                  <div className="text-vault-gold-light font-vault">{tx.description}</div>
                  <div className="text-vault-stone-light text-xs flex items-center gap-2 mt-1">
                    <span>{tx.category}</span>
                    <span>•</span>
                    <span>{format(parseISO(tx.date), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-vault font-bold ${
                    tx.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                  </span>
                  <button
                    onClick={() => handleEdit(tx)}
                    className="text-vault-stone-light hover:text-vault-gold transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    className="text-vault-stone-light hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingTx ? 'Edit Transaction' : 'Add Transaction'}>
        <div className="space-y-4">
          <div>
            <label className="vault-label">Type</label>
            <select
              className="vault-select"
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
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
            <label className="vault-label">Description *</label>
            <input
              type="text"
              className="vault-input"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Groceries, Salary, etc."
            />
          </div>
          <div>
            <label className="vault-label">Category</label>
            <select
              className="vault-select"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option>Salary</option>
              <option>Food</option>
              <option>Groceries</option>
              <option>Rent</option>
              <option>Utilities</option>
              <option>Transportation</option>
              <option>Entertainment</option>
              <option>Shopping</option>
              <option>Healthcare</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="vault-label">Date</label>
            <input
              type="date"
              className="vault-input"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} className="vault-btn flex-1">
              {editingTx ? 'Update' : 'Add'} Transaction
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
