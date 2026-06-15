import React from 'react'
import { Bell, X, AlertTriangle, Info, CheckCircle } from 'lucide-react'
import { useBudget } from '../../context/BudgetContext'

const TOAST_ICONS = {
  danger: <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />,
  success: <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />,
  info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
}

const TOAST_BG = {
  danger: 'border-red-600 bg-vault-dark',
  warning: 'border-yellow-500 bg-vault-dark',
  success: 'border-green-500 bg-vault-dark',
  info: 'border-blue-500 bg-vault-dark',
}

export default function ToastContainer() {
  const { toasts, dismissToast } = useBudget()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter flex items-start gap-3 p-3 rounded-lg border ${TOAST_BG[toast.type] || TOAST_BG.info} shadow-gold`}
        >
          {TOAST_ICONS[toast.type] || TOAST_ICONS.info}
          <p className="text-sm text-vault-gold-light flex-1 font-vault">{toast.message}</p>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-vault-stone-light hover:text-vault-gold transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
