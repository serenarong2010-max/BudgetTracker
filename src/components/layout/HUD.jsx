import React from 'react'
import { Bell, Vault, DollarSign } from 'lucide-react'
import { useBudget } from '../../context/BudgetContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { format } from '../../utils/dateHelpers'

export default function HUD({ onBellClick }) {
  const { balance, notifCount } = useBudget()
  const isNegative = balance < 0

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-vault-dark border-b border-vault-border flex items-center justify-between px-4 md:px-6">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🏛️</span>
        <span className="font-display text-vault-gold text-lg font-bold tracking-widest hidden sm:block">
          BUDGET VAULT
        </span>
      </div>

      {/* Balance */}
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-vault-gold" />
        <span className="text-xs text-vault-stone-light uppercase tracking-wider hidden sm:block">Balance</span>
        <span className={`font-vault text-lg font-bold ${isNegative ? 'neon-red' : 'neon-gold'}`}>
          {formatCurrency(balance)}
        </span>
      </div>

      {/* Date & Bell */}
      <div className="flex items-center gap-4">
        <span className="text-vault-stone-light text-xs font-vault hidden md:block">
          {format(new Date(), 'EEE, MMM d yyyy')}
        </span>
        <button
          onClick={onBellClick}
          className="relative text-vault-stone-light hover:text-vault-gold transition-colors"
        >
          <Bell className="w-5 h-5" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
