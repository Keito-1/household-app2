import { useCallback, useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { ALL_JPY, CURRENCIES } from '@/types/currency'

import type { Transaction } from '@/types/transaction'

dayjs.extend(isSameOrBefore)

type PieDataItem = { name: string; value: number }

export function useReport() {
  const router = useRouter()
  const { user } = useAuth()

  const [currentPeriod, setCurrentPeriod] = useState(dayjs())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [exchangeRates, setExchangeRates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const selectedDate = currentPeriod.endOf('month').format('YYYY-MM-DD')

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      router.push('/signin')
      return
    }

    setLoading(true)

    const start = currentPeriod.startOf('month').format('YYYY-MM-DD')
    const end = currentPeriod.endOf('month').format('YYYY-MM-DD')

    const { data } = await supabase
      .from('transactions')
      .select('*, category: categories(name)')
      .gte('date', start)
      .lte('date', end)

    setTransactions((data ?? []) as Transaction[])
    setLoading(false)
  }, [user, currentPeriod, router])

  const fetchExchangeRates = useCallback(async () => {
    const start = currentPeriod.startOf('month').format('YYYY-MM-DD')
    const end = currentPeriod.endOf('month').format('YYYY-MM-DD')

    const { data } = await supabase
      .from('exchange_rates')
      .select('rate_date, target_currency, rate')
      .gte('rate_date', start)
      .lte('rate_date', end)

    setExchangeRates(data ?? [])
  }, [currentPeriod])

  useEffect(() => {
    fetchTransactions()
    fetchExchangeRates()
  }, [fetchTransactions, fetchExchangeRates])

  const transactionsWithJPY = useMemo(() => {
    return transactions.map((t) => {
      if (t.currency === 'JPY') return { ...t, amount_jpy: t.amount }

      const rate = exchangeRates
        .filter((r) => r.target_currency === t.currency && r.rate_date <= t.date)
        .sort((a, b) => b.rate_date.localeCompare(a.rate_date))[0]

      return {
        ...t,
        amount_jpy: rate ? Math.round(t.amount / rate.rate) : 0,
        used_rate_date: rate?.rate_date ?? null,
      }
    })
  }, [transactions, exchangeRates])

  const fxMeta = useMemo(() => {
    if (exchangeRates.length === 0) return null

    const selected = dayjs(selectedDate)

    const latestRateDate = exchangeRates
      .map((r) => r.rate_date)
      .filter(Boolean)
      .filter((d) => dayjs(d).isValid() && dayjs(d).isSameOrBefore(selected))
      .sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
      .at(-1)

    if (!latestRateDate) return null

    return { rate_date: latestRateDate }
  }, [exchangeRates, selectedDate])

  const totalIncomeJPY = useMemo(
    () =>
      transactionsWithJPY.filter((t) => t.type === 'income').reduce((s, t) => s + (t.amount_jpy ?? 0), 0),
    [transactionsWithJPY]
  )

  const totalExpenseJPY = useMemo(
    () =>
      transactionsWithJPY.filter((t) => t.type === 'expense').reduce((s, t) => s + (t.amount_jpy ?? 0), 0),
    [transactionsWithJPY]
  )

  const balanceJPY = totalIncomeJPY - totalExpenseJPY

  // Helper to build bar chart
  const buildBarChartData = useCallback((baseTransactions: any[], isAllJPY: boolean, month: dayjs.Dayjs) => {
    let cumulative = 0
    return Array.from({ length: month.daysInMonth() }, (_, i) => {
      const day = i + 1
      const daily = baseTransactions.filter((t) => dayjs(t.date).date() === day)
      const dailyIncome = daily
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + (isAllJPY ? (t.amount_jpy ?? 0) : t.amount), 0)
      const dailyExpense = daily
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + (isAllJPY ? (t.amount_jpy ?? 0) : t.amount), 0)
      cumulative += dailyIncome - dailyExpense
      return { day, balance: cumulative }
    })
  }, [])

  // Prepare report data per currency
  const reportData = useMemo(() => {
    const data: Record<string, any> = {}
    const currencies = [...CURRENCIES, ALL_JPY]

    currencies.forEach((currency) => {
      const isAllJPY = currency === ALL_JPY
      const baseTransactions = isAllJPY ? transactionsWithJPY : transactions.filter((t) => t.currency === currency)

      const income = baseTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + (isAllJPY ? (t.amount_jpy ?? 0) : t.amount), 0)
      const expense = baseTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + (isAllJPY ? (t.amount_jpy ?? 0) : t.amount), 0)
      const balance = income - expense

      const expenseAgg: Record<string, number> = baseTransactions
        .filter((t) => t.type === 'expense')
        .reduce((acc: Record<string, number>, t: any) => {
          const key = t.category?.name ?? '未分類'
          acc[key] = (acc[key] ?? 0) + (isAllJPY ? (t.amount_jpy ?? 0) : t.amount)
          return acc
        }, {})

      const incomeAgg: Record<string, number> = baseTransactions
        .filter((t) => t.type === 'income')
        .reduce((acc: Record<string, number>, t: any) => {
          const key = t.category?.name ?? '未分類'
          acc[key] = (acc[key] ?? 0) + (isAllJPY ? (t.amount_jpy ?? 0) : t.amount)
          return acc
        }, {})

      const expensePieData: PieDataItem[] = Object.keys(expenseAgg).map((k) => ({ name: k, value: expenseAgg[k] }))
      const incomePieData: PieDataItem[] = Object.keys(incomeAgg).map((k) => ({ name: k, value: incomeAgg[k] }))

      const barChartData = buildBarChartData(baseTransactions as any[], isAllJPY, currentPeriod)

      data[currency] = {
        baseTransactions,
        income,
        expense,
        balance,
        expensePieData,
        incomePieData,
        barChartData,
      }
    })

    return data
  }, [transactions, transactionsWithJPY, exchangeRates, buildBarChartData, currentPeriod])

  const summaryData = useMemo(() => ({ totalIncomeJPY, totalExpenseJPY, balanceJPY }), [totalIncomeJPY, totalExpenseJPY, balanceJPY])

  const refetch = useCallback(() => {
    fetchTransactions()
    fetchExchangeRates()
  }, [fetchTransactions, fetchExchangeRates])

  return {
    currentPeriod,
    setCurrentPeriod,
    transactions,
    transactionsWithJPY,
    exchangeRates,
    fxMeta,
    loading,
    reportData,
    summaryData,
    refetch,
    fetchTransactions,
    fetchExchangeRates,
  }
}
