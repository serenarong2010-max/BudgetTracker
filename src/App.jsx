import React, { useState, useEffect } from 'react'
import { BudgetProvider, useBudget } from './context/BudgetContext'
import { useNotifications } from './hooks/useNotifications'
import HUD from './components/layout/HUD'
import ToastContainer from './components/layout/ToastContainer'
import Dashboard from './components/dashboard/Dashboard'
import PaymentCalendar from './components/calendar/PaymentCalendar'
import Ledger from './components/ledger/Ledger'
import SavingsGoals from './components/savings/SavingsGoals'

const VAULTS = [
  { id: 'dashboard', label: 'Main Vault', icon: '🏛️' },
  { id: 'calendar', label: 'Payment Vault', icon: '📅' },
  { id: 'ledger', label: 'Ledger Vault', icon: '📊' },
  { id: 'savings', label: 'Savings Vault', icon: '💰' },
]

function AppContent() {
  const [activeVault, setActiveVault] = useState('dashboard')
  const { payments, addToast, clearNotifCount } = useBudget()
  const { requestPermission } = useNotifications(payments, addToast)

  useEffect(() => {
    requestPermission()
  }, [requestPermission])

  const handleBellClick = () => {
    clearNotifCount()
  }

  const renderVault = () => {
    switch (activeVault) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveVault} />
      case 'calendar':
        return <PaymentCalendar />
      case 'ledger':
        return <Ledger />
      case 'savings':
        return <SavingsGoals />
      default:
        return <Dashboard onNavigate={setActiveVault} />
    }
  }

  return (
    <div className="min-h-screen vault-wall">
      <HUD onBellClick={handleBellClick} />
      <ToastContainer />

      {/* Vault Navigation */}
      <nav className="fixed top-14 left-0 right-0 z-30 bg-vault-dark border-b border-vault-border">
        <div className="flex overflow-x-auto">
          {VAULTS.map((vault) => (
            <button
              key={vault.id}
              onClick={() => setActiveVault(vault.id)}
              className={`flex items-center gap-2 px-6 py-3 font-vault text-sm whitespace-nowrap transition-all
                ${activeVault === vault.id
                  ? 'text-vault-gold border-b-2 border-vault-gold bg-vault-panel'
                  : 'text-vault-stone-light hover:text-vault-gold hover:bg-vault-panel/50'
                }`}
            >
              <span className="text-lg">{vault.icon}</span>
              <span>{vault.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-8 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="vault-transition-enter" key={activeVault}>
          {renderVault()}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BudgetProvider>
      <AppContent />
    </BudgetProvider>
  )
}
