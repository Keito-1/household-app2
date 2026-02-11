import { useEffect, useMemo, useState, useCallback } from 'react'
import dayjs from 'dayjs'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

import type { Transaction } from '@/types/transaction'
import { ALL_JPY, CURRENCIES as CURRENCIES_CONST } from '@/types/currency'

const CURRENCIES = CURRENCIES_CONST
type Currency = (typeof CURRENCIES)[number] | typeof ALL_JPY

interface YearlyReportData {
  currentYear: number
  setCurrentYear: (year: number) => void
  loading: boolean
  currencyTabs: Currency[]
  monthlyTotalsByCurrency: Record<
    Currency,
    { month: number; income: number; expense: number; balance: number }[]
  >
  monthlyTotalsAllJPY: { month: number; income: number; expense: number; balance: number }[]
  yearlySummaryByCurrency: Record<
    Currency,
    { income: number; expense: number; balance: number }
  >
  yearlySummaryAllJPY: { income: number; expense: number; balance: number }
}

export function useYearlyReport(): YearlyReportData {
  const router = useRouter()
  const { user } = useAuth()

  const [currentYear, setCurrentYear] = useState(dayjs().year())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)

  /* =====================
     Fetch (year)
  ===================== */
  const fetchYearlyTransactions = useCallback(async () => {
    if (loading) return
    setLoading(true)

    if (!user) {
      router.replace('/signin')
      setLoading(false)
      return
    }

    const start = dayjs(`${currentYear}-01-01`).format('YYYY-MM-DD')
    const end = dayjs(`${currentYear}-12-31`).format('YYYY-MM-DD')

    const { data, error } = await supabase
      .from('transactions')
      .select(`
    *,
    category: categories(name)
    `)
      .gte('date', start)
      .lte('date', end)

    if (!error && data) {
      setTransactions(data as Transaction[])
    }

    setLoading(false)
  }, [currentYear, user, router])

  const fetchExchangeRates = useCallback(async () => {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('target_currency, rate')
      .eq('base_currency', 'JPY')

    if (!error && data) {
      const map: Record<string, number> = {}
      data.forEach((r) => {
        if (r.target_currency) map[r.target_currency.toUpperCase()] = r.rate
      })
      setExchangeRates(map)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    fetchYearlyTransactions()
    fetchExchangeRates()
  }, [fetchYearlyTransactions, fetchExchangeRates])

  /* =====================
     通貨タブ定義
     - 通常通貨
     - 最後に ALL_JPY
  ===================== */
  const currencyTabs = useMemo(() => {
    return [...CURRENCIES, ALL_JPY]
  }, [])

  /* =====================
     月別集計（通貨ごと）
  ===================== */
  const monthlyTotalsByCurrency = useMemo(() => {
    return CURRENCIES.reduce((acc, currency) => {
      const list = transactions.filter((t) => (t.currency || '').toUpperCase() === (currency || '').toUpperCase())

      acc[currency] = Array.from({ length: 12 }, (_, i) => {
        const month = i + 1

        const monthList = list.filter(
          (t) => dayjs(t.date).month() + 1 === month
        )

        const income = monthList
          .filter((t) => t.type === 'income')
          .reduce((s, t) => s + t.amount, 0)

        const expense = monthList
          .filter((t) => t.type === 'expense')
          .reduce((s, t) => s + t.amount, 0)

        return {
          month,
          income,
          expense,
          balance: income - expense,
        }
      })

      return acc
    }, {} as Record<
      Currency,
      { month: number; income: number; expense: number; balance: number }[]
    >)
  }, [transactions])

  /* =====================
     月別集計（全通貨 JPY 換算）
  ===================== */
  const monthlyTotalsAllJPY = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1

      const monthTx = transactions.filter(
        (t) => dayjs(t.date).month() + 1 === month
      )

      const income = monthTx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => {
          const cur = (t.currency || '').toUpperCase()
          if (cur === 'JPY') return sum + t.amount
          const rate = exchangeRates[cur]
          return rate ? sum + t.amount / rate : sum
        }, 0)

      const expense = monthTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => {
          const cur = (t.currency || '').toUpperCase()
          if (cur === 'JPY') return sum + t.amount
          const rate = exchangeRates[cur]
          return rate ? sum + t.amount / rate : sum
        }, 0)

      return {
        month,
        income,
        expense,
        balance: income - expense,
      }
    })
  }, [transactions, exchangeRates])

  /* =====================
     年間サマリー
  ===================== */
  const yearlySummaryByCurrency = useMemo(() => {
    return CURRENCIES.reduce((acc, currency) => {
      const list = monthlyTotalsByCurrency[currency]

      const income = list.reduce((s, m) => s + m.income, 0)
      const expense = list.reduce((s, m) => s + m.expense, 0)

      acc[currency] = {
        income,
        expense,
        balance: income - expense,
      }

      return acc
    }, {} as Record<
      Currency,
      { income: number; expense: number; balance: number }
    >)
  }, [monthlyTotalsByCurrency])

  const yearlySummaryAllJPY = useMemo(() => {
    const income = monthlyTotalsAllJPY.reduce((s, m) => s + m.income, 0)
    const expense = monthlyTotalsAllJPY.reduce((s, m) => s + m.expense, 0)

    return {
      income,
      expense,
      balance: income - expense,
    }
  }, [monthlyTotalsAllJPY])

  return {
    currentYear,
    setCurrentYear,
    loading,
    currencyTabs,
    monthlyTotalsByCurrency,
    monthlyTotalsAllJPY,
    yearlySummaryByCurrency,
    yearlySummaryAllJPY,
  }
}
