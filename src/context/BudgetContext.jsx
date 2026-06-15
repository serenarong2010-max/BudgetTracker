import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react'
import { computeNextDue, format } from '../utils/dateHelpers'

const BudgetContext = createContext(null)

const SAMPLE_TRANSACTIONS = [
  { id: '1', type: 'income', amount: 3200, category: 'Salary', description: 'Monthly paycheck', date: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd') },
  { id: '2', type: 'expense', amount: 850, category: 'Rent', description: 'Monthly rent', date: format(new Date(new Date().getFullYear(), new Date().getMonth(), 2), 'yyyy-MM-dd') },
  { id: '3', type: 'expense', amount: 120, category: 'Groceries', description: 'Weekly groceries', date: format(new Date(new Date().getFullYear(), new Date().getMonth(), 5), 'yyyy-MM-dd') },
  { id: '4', type: 'expense', amount: 55, category: 'Utilities', description: 'Electric bill', date: format(new Date(new Date().getFullYear(), new Date().getMonth(), 7), 'yyyy-MM-dd') },
]

const SAMPLE_PAYMENTS = [
  { id: 'p1', title: 'Rent', amount: 850, dueDay: 1, recurring: true, nextDue: format(computeNextDue(1), 'yyyy-MM-dd'), reminderDays: 5, paid: false, category: 'Housing' },
  { id: 'p2', title: 'Netflix', amount: 15.99, dueDay: 15, recurring: true, nextDue: format(computeNextDue(15), 'yyyy-MM-dd'), reminderDays: 2, paid: false, category: 'Entertainment' },
  { id: 'p3', title: 'Car Insurance', amount: 120, dueDay: 20, recurring: true, nextDue: format(computeNextDue(20), 'yyyy-MM-dd'), reminderDays: 3, paid: false, category: 'Insurance' },
]

const SAMPLE_GOALS = [
  { id: 'g1', name: 'Emergency Fund', targetAmount: 5000, savedAmount: 1250, icon: '🏦', color: '#c9a227' },
  { id: 'g2', name: 'Vacation', targetAmount: 2000, savedAmount: 600, icon: '✈️', color: '#22c55e' },
]

function loadState() {
  try {
    const stored = localStorage.getItem('budgetVaultState')
    if (stored) return JSON.parse(stored)
  } catch {}
  return {
    transactions: SAMPLE_TRANSACTIONS,
    payments: SAMPLE_PAYMENTS,
    goals: SAMPLE_GOALS,
    monthlyBudgetLimit: 2000,
  }
}

function saveState(state) {
  try {
    localStorage.setItem('budgetVaultState', JSON.stringify(state))
  } catch {}
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function reducer(state, action) {
  switch (action.type) {
    // --- TRANSACTIONS ---
    case 'ADD_TRANSACTION': {
      const tx = { ...action.payload, id: generateId() }
      return { ...state, transactions: [tx, ...state.transactions] }
    }
    case 'DELETE_TRANSACTION': {
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.id) }
    }
    case 'EDIT_TRANSACTION': {
      return {
        ...state,
        transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t),
      }
    }

    // --- PAYMENTS ---
    case 'ADD_PAYMENT': {
      const p = { ...action.payload, id: generateId() }
      if (p.dueDay) p.nextDue = format(computeNextDue(Number(p.dueDay)), 'yyyy-MM-dd')
      return { ...state, payments: [...state.payments, p] }
    }
    case 'EDIT_PAYMENT': {
      return {
        ...state,
        payments: state.payments.map(p => p.id === action.payload.id ? action.payload : p),
      }
    }
    case 'DELETE_PAYMENT': {
      return { ...state, payments: state.payments.filter(p => p.id !== action.id) }
    }
    case 'MARK_PAYMENT_PAID': {
      return {
        ...state,
        payments: state.payments.map(p => {
          if (p.id !== action.id) return p
          if (p.recurring) {
            // advance nextDue by one month
            const next = computeNextDue(p.dueDay)
            next.setMonth(next.getMonth() + 1)
            return { ...p, paid: false, nextDue: format(next, 'yyyy-MM-dd') }
          }
          return { ...p, paid: true }
        }),
      }
    }

    // --- GOALS ---
    case 'ADD_GOAL': {
      const g = { ...action.payload, id: generateId(), savedAmount: 0 }
      return { ...state, goals: [...state.goals, g] }
    }
    case 'DEPOSIT_TO_GOAL': {
      return {
        ...state,
        goals: state.goals.map(g => {
          if (g.id !== action.id) return g
          const newSaved = Math.min(g.savedAmount + Number(action.amount), g.targetAmount)
          return { ...g, savedAmount: newSaved }
        }),
      }
    }
    case 'DELETE_GOAL': {
      return { ...state, goals: state.goals.filter(g => g.id !== action.id) }
    }
    case 'EDIT_GOAL': {
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.payload.id ? { ...g, ...action.payload } : g),
      }
    }

    // --- SETTINGS ---
    case 'SET_BUDGET_LIMIT': {
      return { ...state, monthlyBudgetLimit: action.amount }
    }

    case 'RESET_ALL': {
      return {
        transactions: SAMPLE_TRANSACTIONS,
        payments: SAMPLE_PAYMENTS,
        goals: SAMPLE_GOALS,
        monthlyBudgetLimit: 2000,
      }
    }

    default:
      return state
  }
}

export function BudgetProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)
  const [toasts, setToasts] = useState([])
  const [notifCount, setNotifCount] = useState(0)

  // Persist every state change
  useEffect(() => {
    saveState(state)
  }, [state])

  // Derived values
  const balance = state.transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + Number(t.amount) : sum - Number(t.amount)
  }, 0)

  const addToast = useCallback((toast) => {
    const id = generateId()
    setToasts(prev => [...prev, { ...toast, id }])
    setNotifCount(c => c + 1)
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clearNotifCount = useCallback(() => setNotifCount(0), [])

  return (
    <BudgetContext.Provider value={{
      ...state,
      balance,
      dispatch,
      toasts,
      addToast,
      dismissToast,
      notifCount,
      clearNotifCount,
    }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudget must be used inside BudgetProvider')
  return ctx
}
