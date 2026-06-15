import React from 'react'
import { useBudget } from '../../context/BudgetContext'
import { formatCurrency } from '../../utils/formatCurrency'
import { format, isToday, parseISO } from '../../utils/dateHelpers'
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, AlertCircle } from 'lucide-react'

export default function Dashboard({ onNavigate }) {
  const { transactions, payments, goals, balance, monthlyBudgetLimit } = useBudget()

  // Calculate stats
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const budgetUsed = (totalExpenses / monthlyBudgetLimit) * 100

  const upcomingPayments = payments
    .filter(p => !p.paid && p.nextDue)
    .sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue))
    .slice(0, 5)

  const todayPayments = upcomingPayments.filter(p => isToday(parseISO(p.nextDue)))

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.savedAmount), 0)

  const stats = [
    {
      label: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: <TrendingUp className="w-5 h-5 text-green-400" />,
      color: 'text-green-400',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: <TrendingDown className="w-5 h-5 text-red-400" />,
      color: 'text-red-400',
    },
    {
      label: 'Balance',
      value: formatCurrency(balance),
      icon: <DollarSign className="w-5 h-5 text-vault-gold" />,
      color: 'text-vault-gold',
    },
    {
      label: 'Total Saved',
      value: formatCurrency(totalSaved),
      icon: <Target className="w-5 h-5 text-blue-400" />,
      color: 'text-blue-400',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-display text-4xl font-bold gold-text mb-2">MAIN VAULT</h1>
        <p className="text-vault-stone-light font-vault">Your Financial Fortress Overview</p>
      </div>

      {/* Alert for today's payments */}
      {todayPayments.length > 0 && (
        <div className="vault-panel p-4 border-red-500 animate-pulse">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-display text-red-400 font-bold mb-1">URGENT: Payments Due Today!</h3>
              <div className="space-y-1">
                {todayPayments.map(p => (
                  <div key={p.id} className="text-sm text-vault-gold-light font-vault">
                    • {p.title} — {formatCurrency(Number(p.amount))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center gap-2 mb-1">
              {stat.icon}
              <span className="text-xs text-vault-stone-light uppercase tracking-wider">{stat.label}</span>
            </div>
            <span className={`font-vault text-xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Budget Progress */}
      <div className="vault-panel p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-vault-gold text-lg font-bold">Monthly Budget</h2>
          <span className="font-vault text-sm text-vault-stone-light">
            {formatCurrency(totalExpenses)} / {formatCurrency(monthlyBudgetLimit)}
          </span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(budgetUsed, 100)}%`,
              background: budgetUsed > 90
                ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                : budgetUsed > 70
                ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                : 'linear-gradient(90deg, #a07c10, #c9a227, #e8c547)',
            }}
          />
        </div>
        <div className="text-right mt-2">
          <span className={`font-vault text-sm ${budgetUsed > 90 ? 'text-red-400' : 'text-vault-stone-light'}`}>
            {budgetUsed.toFixed(1)}% used
          </span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Payments */}
        <div className="vault-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-vault-gold text-lg font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Upcoming Payments
            </h2>
            <button
              onClick={() => onNavigate('calendar')}
              className="vault-btn-outline text-xs px-3 py-1"
            >
              View All
            </button>
          </div>
          {upcomingPayments.length === 0 ? (
            <p className="text-vault-stone-light font-vault text-sm">No upcoming payments</p>
          ) : (
            <div className="space-y-3">
              {upcomingPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 bg-vault-dark rounded">
                  <div>
                    <div className="text-vault-gold-light font-vault text-sm">{p.title}</div>
                    <div className="text-vault-stone-light text-xs">
                      {format(parseISO(p.nextDue), 'MMM d')}
                    </div>
                  </div>
                  <div className="font-vault text-vault-gold font-bold">
                    {formatCurrency(Number(p.amount))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="vault-panel p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-vault-gold text-lg font-bold">Recent Transactions</h2>
            <button
              onClick={() => onNavigate('ledger')}
              className="vault-btn-outline text-xs px-3 py-1"
            >
              View All
            </button>
          </div>
          {transactions.length === 0 ? (
            <p className="text-vault-stone-light font-vault text-sm">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map(t => (
                <div
                  key={t.id}
                  className={`flex items-center justify-between p-3 bg-vault-dark rounded ${
                    t.type === 'income' ? 'income-row' : 'expense-row'
                  }`}
                >
                  <div>
                    <div className="text-vault-gold-light font-vault text-sm">{t.description}</div>
                    <div className="text-vault-stone-light text-xs">{t.category}</div>
                  </div>
                  <div className={`font-vault font-bold ${
                    t.type === 'income' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('calendar')}
          className="vault-door-card"
        >
          <span className="text-4xl">📅</span>
          <span className="font-display text-vault-gold text-sm font-bold">Payment Vault</span>
        </button>
        <button
          onClick={() => onNavigate('ledger')}
          className="vault-door-card"
        >
          <span className="text-4xl">📊</span>
          <span className="font-display text-vault-gold text-sm font-bold">Ledger Vault</span>
        </button>
        <button
          onClick={() => onNavigate('savings')}
          className="vault-door-card"
        >
          <span className="text-4xl">💰</span>
          <span className="font-display text-vault-gold text-sm font-bold">Savings Vault</span>
        </button>
      </div>
    </div>
  )
}
