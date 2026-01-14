'use client'

import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

import type { Transaction } from '@/types/transaction'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

/* =====================
   Constants / Types
===================== */
const CURRENCIES = ['JPY', 'AUD', 'USD'] as const
type Currency = (typeof CURRENCIES)[number]

/* =====================
   Page
===================== */
export default function YearlyPage() {
  const router = useRouter()

  const [currentYear, setCurrentYear] = useState(dayjs().year())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  /* =====================
     Fetch (year)
  ===================== */
  const fetchYearlyTransactions = async () => {
    setLoading(true)

    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      router.push('/signin')
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
  }

  useEffect(() => {
    fetchYearlyTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear])

  /* =====================
     月別集計（通貨ごと）
  ===================== */
  const monthlyTotalsByCurrency = useMemo(() => {
    return CURRENCIES.reduce((acc, currency) => {
      const list = transactions.filter((t) => t.currency === currency)

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

  return (
    <main className="mx-auto max-w-5xl p-4 bg-gray-200 min-h-screen text-black">
      {/* Year Selector */}
      <div className="mb-6 flex items-center justify-between">
        <button
          className="px-2 text-xl"
          onClick={() => setCurrentYear((y) => y - 1)}
        >
          ‹
        </button>

        <h1 className="text-xl font-semibold">
          {currentYear} 年 年間レポート
        </h1>

        <button
          className="px-2 text-xl"
          onClick={() => setCurrentYear((y) => y + 1)}
        >
          ›
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <Tabs defaultValue="JPY" className="w-full">
          <TabsList className="mb-6">
            {CURRENCIES.map((c) => (
              <TabsTrigger key={c} value={c}>
                {c}
              </TabsTrigger>
            ))}
          </TabsList>

          {CURRENCIES.map((currency) => {
            const summary = yearlySummaryByCurrency[currency]
            const barData = monthlyTotalsByCurrency[currency]

            return (
              <TabsContent key={currency} value={currency}>
                {/* Summary */}
                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                  <Card className="bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500">
                        年間収入
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">
                        {summary.income.toLocaleString()} {currency}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500">
                        年間支出
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-red-600">
                        {summary.expense.toLocaleString()} {currency}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500">
                        年間収支（貯金）
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p
                        className={`text-2xl font-bold ${summary.balance >= 0
                            ? 'text-blue-600'
                            : 'text-red-600'
                          }`}
                      >
                        {summary.balance.toLocaleString()} {currency}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Bar Chart */}
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-500">
                      月別 収支（貯金額）
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          tickFormatter={(m) => `${m}月`}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="balance">
                          {barData.map((d, i) => (
                            <Cell
                              key={i}
                              fill={d.balance >= 0 ? '#3b82f6' : '#ef4444'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            )
          })}
        </Tabs>
      )}
    </main>
  )
}
