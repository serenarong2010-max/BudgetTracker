import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  differenceInDays,
  parseISO,
  addDays,
  setDate,
} from 'date-fns'

export {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  differenceInDays,
  parseISO,
  addDays,
  setDate,
}

export function getDaysInMonthGrid(date) {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  const days = eachDayOfInterval({ start, end })
  const startPadding = getDay(start) // 0=Sun
  const paddedDays = Array(startPadding).fill(null).concat(days)
  // fill end to complete 6-row grid if needed
  while (paddedDays.length % 7 !== 0) paddedDays.push(null)
  return paddedDays
}

export function computeNextDue(dueDay) {
  const today = new Date()
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), dueDay)
  if (thisMonth >= today) return thisMonth
  return new Date(today.getFullYear(), today.getMonth() + 1, dueDay)
}

export function daysUntil(dateStr) {
  if (!dateStr) return null
  const target = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr
  return differenceInDays(target, new Date())
}

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function monthKey(date) {
  return format(date, 'yyyy-MM')
}
