import { useEffect, useCallback } from 'react'
import { daysUntil, format } from '../utils/dateHelpers'

export function useNotifications(payments, addToast) {
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }, [])

  const fireNotification = useCallback((title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/vault-icon.svg',
        badge: '/vault-icon.svg',
      })
    }
  }, [])

  useEffect(() => {
    if (!payments || payments.length === 0) return

    const checked = new Set()

    payments.forEach((payment) => {
      if (payment.paid) return
      if (!payment.nextDue) return

      const days = daysUntil(payment.nextDue)
      const key = `${payment.id}-${payment.nextDue}`

      if (checked.has(key)) return
      checked.add(key)

      const reminderDays = payment.reminderDays ?? 3

      if (days === 0) {
        const msg = `${payment.title} — $${Number(payment.amount).toFixed(2)} is due TODAY!`
        addToast({ type: 'danger', message: msg })
        fireNotification('Payment Due Today!', msg)
      } else if (days > 0 && days <= reminderDays) {
        const msg = `${payment.title} — $${Number(payment.amount).toFixed(2)} is due in ${days} day${days !== 1 ? 's' : ''}`
        addToast({ type: 'warning', message: msg })
        fireNotification(`Payment Due in ${days} Day${days !== 1 ? 's' : ''}`, msg)
      } else if (days < 0) {
        const msg = `${payment.title} — OVERDUE by ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''}!`
        addToast({ type: 'danger', message: msg })
        fireNotification('Overdue Payment!', msg)
      }
    })
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { requestPermission }
}
