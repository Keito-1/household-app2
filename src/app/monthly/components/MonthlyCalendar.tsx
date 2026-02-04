'use client'

import { useMemo } from 'react'
import type dayjs from 'dayjs'

import CalendarGrid from './CalendarGrid'
import type { Transaction } from '@/types/transaction'

type Props = {
  currentMonth: dayjs.Dayjs
  transactions: Transaction[]
  onSelectDate: (d: dayjs.Dayjs) => void
}

export default function MonthlyCalendar({ currentMonth, transactions, onSelectDate }: Props) {
  const calendarDays = useMemo(() => {
    const start = currentMonth.startOf('month').startOf('week')
    return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'))
  }, [currentMonth])

  const dayHasExpense = (ymd: string) =>
    transactions.filter((t) => t.date === ymd).some((t) => t.type === 'expense')

  const dayHasIncome = (ymd: string) =>
    transactions.filter((t) => t.date === ymd).some((t) => t.type === 'income')

  return (
    <CalendarGrid
      currentMonth={currentMonth}
      calendarDays={calendarDays}
      onSelectDate={onSelectDate}
      dayHasExpense={dayHasExpense}
      dayHasIncome={dayHasIncome}
    />
  )
}
