import React, { useState } from 'react'
import { useBudget } from '../../context/BudgetContext'
import { formatCurrency } from '../../utils/formatCurrency'
import Modal from '../layout/Modal'
import { Plus, Trash2, Edit2, Target, DollarSign, TrendingUp } from 'lucide-react'

export default function SavingsGoals() {
  const { goals, dispatch, addToast } = useBudget()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    icon: '💰',
    color: '#c9a227',
  })

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.savedAmount), 0)
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0)
  const completedGoals = goals.filter(g => Number(g.savedAmount) >= Number(g.targetAmount)).length

  const handleAdd = () => {
    setEditingGoal(null)
    setFormData({ name: '', targetAmount: '', icon: '💰', color: '#c9a227' })
    setShowAddModal(true)
  }

  const handleEdit = (goal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      icon: goal.icon,
      color: goal.color,
    })
    setShowAddModal(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.targetAmount) {
      addToast({ type: 'warning', message: 'Please fill in all required fields' })
      return
    }

    if (editingGoal) {
      dispatch({
        type: 'EDIT_GOAL',
        payload: {
          ...editingGoal,
          ...formData,
          targetAmount: Number(formData.targetAmount),
        },
      })
      addToast({ type: 'success', message: 'Goal updated' })
    } else {
      dispatch({
        type: 'ADD_GOAL',
        payload: { ...formData, targetAmount: Number(formData.targetAmount) },
      })
      addToast({ type: 'success', message: 'Goal created' })
    }
    setShowAddModal(false)
  }

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_GOAL', id })
    addToast({ type: 'info', message: 'Goal deleted' })
  }

  const handleDeposit = (goal) => {
    setSelectedGoal(goal)
    setDepositAmount('')
    setShowDepositModal(true)
  }

  const handleDepositSave = () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      addToast({ type: 'warning', message: 'Please enter a valid amount' })
      return
    }

    dispatch({ type: 'DEPOSIT_TO_GOAL', id: selectedGoal.id, amount: Number(depositAmount) })

    const newSaved = Math.min(
      Number(selectedGoal.savedAmount) + Number(depositAmount),
      Number(selectedGoal.targetAmount)
    )

    if (newSaved >= Number(selectedGoal.targetAmount)) {
      addToast({ type: 'success', message: `🎉 Goal "${selectedGoal.name}" completed!` })
    } else {
      addToast({ type: 'success', message: `Deposited ${formatCurrency(Number(depositAmount))} to ${selectedGoal.name}` })
    }

    setShowDepositModal(false)
  }

  const getProgressPercentage = (goal) => {
    const percent = (Number(goal.savedAmount) / Number(goal.targetAmount)) * 100
    return Math.min(percent, 100)
  }

  const isCompleted = (goal) => Number(goal.savedAmount) >= Number(goal.targetAmount)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold gold-text">SAVINGS VAULT</h1>
          <p className="text-vault-stone-light font-vault text-sm">Build your treasure one coin at a time</p>
        </div>
        <button onClick={handleAdd} className="vault-btn flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-vault-stone-light uppercase">Total Saved</span>
          </div>
          <span className="font-vault text-lg font-bold text-vault-gold">{formatCurrency(totalSaved)}</span>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-vault-gold" />
            <span className="text-xs text-vault-stone-light uppercase">Total Target</span>
          </div>
          <span className="font-vault text-lg font-bold text-vault-gold-light">{formatCurrency(totalTarget)}</span>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-vault-stone-light uppercase">Completed</span>
          </div>
          <span className="font-vault text-lg font-bold text-green-400">{completedGoals}/{goals.length}</span>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="vault-panel p-12 text-center">
          <p className="text-vault-stone-light font-vault mb-4">No savings goals yet</p>
          <button onClick={handleAdd} className="vault-btn">
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map(goal => {
            const progress = getProgressPercentage(goal)
            const completed = isCompleted(goal)

            return (
              <div
                key={goal.id}
                className={`vault-panel p-6 ${completed ? 'border-green-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{goal.icon}</span>
                    <div>
                      <h3 className="font-display text-vault-gold text-lg font-bold">{goal.name}</h3>
                      {completed && (
                        <span className="text-xs text-green-400 font-vault">✓ COMPLETED</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="text-vault-stone-light hover:text-vault-gold transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="text-vault-stone-light hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="progress-bar-track mb-2">
                    <div
                      className="progress-bar-fill animate-progress-fill"
                      style={{
                        width: `${progress}%`,
                        background: completed
                          ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                          : `linear-gradient(90deg, ${goal.color}99, ${goal.color})`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-vault">
                    <span className="text-vault-gold-light">
                      {formatCurrency(Number(goal.savedAmount))}
                    </span>
                    <span className="text-vault-stone-light">
                      {formatCurrency(Number(goal.targetAmount))}
                    </span>
                  </div>
                </div>

                {/* Progress Percentage */}
                <div className="text-center mb-4">
                  <span className={`font-vault text-2xl font-bold ${completed ? 'text-green-400' : 'text-vault-gold'}`}>
                    {progress.toFixed(1)}%
                  </span>
                </div>

                {/* Deposit Button */}
                {!completed && (
                  <button
                    onClick={() => handleDeposit(goal)}
                    className="vault-btn w-full flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    Deposit Funds
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={editingGoal ? 'Edit Goal' : 'New Savings Goal'}>
        <div className="space-y-4">
          <div>
            <label className="vault-label">Goal Name *</label>
            <input
              type="text"
              className="vault-input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Emergency Fund, New Car, etc."
            />
          </div>
          <div>
            <label className="vault-label">Target Amount *</label>
            <input
              type="number"
              className="vault-input"
              value={formData.targetAmount}
              onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
              placeholder="5000"
              step="100"
            />
          </div>
          <div>
            <label className="vault-label">Icon</label>
            <input
              type="text"
              className="vault-input"
              value={formData.icon}
              onChange={e => setFormData({ ...formData, icon: e.target.value })}
              placeholder="💰"
            />
          </div>
          <div>
            <label className="vault-label">Color</label>
            <input
              type="color"
              className="w-full h-10 rounded cursor-pointer"
              value={formData.color}
              onChange={e => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={handleSave} className="vault-btn flex-1">
              {editingGoal ? 'Update' : 'Create'} Goal
            </button>
            <button onClick={() => setShowAddModal(false)} className="vault-btn-outline flex-1">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Deposit Modal */}
      <Modal isOpen={showDepositModal} onClose={() => setShowDepositModal(false)} title={`Deposit to ${selectedGoal?.name}`}>
        <div className="space-y-4">
          <div>
            <label className="vault-label">Amount to Deposit</label>
            <input
              type="number"
              className="vault-input"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              placeholder="100"
              step="10"
              autoFocus
            />
          </div>
          {selectedGoal && (
            <div className="vault-panel p-3 bg-vault-dark">
              <div className="text-xs text-vault-stone-light mb-1">Current Progress</div>
              <div className="text-vault-gold-light font-vault">
                {formatCurrency(Number(selectedGoal.savedAmount))} / {formatCurrency(Number(selectedGoal.targetAmount))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <button onClick={handleDepositSave} className="vault-btn flex-1">
              Deposit
            </button>
            <button onClick={() => setShowDepositModal(false)} className="vault-btn-outline flex-1">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
