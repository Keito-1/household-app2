'use client'

import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'

import type { Transaction } from '@/types/transaction'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

/* =====================
   Constants / Types
===================== */
const CURRENCIES = ['JPY', 'AUD', 'USD'] as const
type Currency = (typeof CURRENCIES)[number]

/* =====================
   Page
===================== */
export default function ReportPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  /* =====================
     Fetch（月次）
  ===================== */
  const fetchTransactions = async () => {
    setLoading(true)

    if (!user) {
      router.push('/signin')
      setLoading(false)
      return
    }

    const start = currentMonth.startOf('month').format('YYYY-MM-DD')
    const end = currentMonth.endOf('month').format('YYYY-MM-DD')

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
    fetchTransactions()
  }, [currentMonth, user])

  /* =====================
     通貨別分割
  ===================== */
  const transactionsByCurrency = useMemo(() => {
    return CURRENCIES.reduce((acc, currency) => {
      acc[currency] = transactions.filter((t) => t.currency === currency)
      return acc
    }, {} as Record<Currency, Transaction[]>)
  }, [transactions])

  /* =====================
     通貨別集計（合計）
  ===================== */
  const totalsByCurrency = useMemo(() => {
    return CURRENCIES.reduce((acc, currency) => {
      const list = transactionsByCurrency[currency]

      const income = list
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      const expense = list
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      acc[currency] = {
        income,
        expense,
        balance: income - expense,
      }

      return acc
    }, {} as Record<Currency, { income: number; expense: number; balance: number }>)
  }, [transactionsByCurrency])

  /* =====================
     円グラフ用（カテゴリ別）
  ===================== */
  const pieDataByCurrency = useMemo(() => {
    return CURRENCIES.reduce((acc, currency) => {
      const list = transactionsByCurrency[currency]

      const expenseMap: Record<string, number> = {}
      const incomeMap: Record<string, number> = {}

      list.forEach((t) => {
        if (t.type === 'expense') {
          const categoryName = t.category?.name ?? '未分類'
          expenseMap[categoryName] =
            (expenseMap[categoryName] || 0) + t.amount
        } else {
          const categoryName = t.category?.name ?? '未分類'
          incomeMap[categoryName] =
            (incomeMap[categoryName] || 0) + t.amount
        }
      })

      acc[currency] = {
        expense: Object.entries(expenseMap).map(([name, value]) => ({ name, value })),
        income: Object.entries(incomeMap).map(([name, value]) => ({ name, value })),
      }

      return acc
    }, {} as Record<
      Currency,
      {
        expense: { name: string; value: number }[]
        income: { name: string; value: number }[]
      }
    >)
  }, [transactionsByCurrency])

  /* =====================
     棒グラフ用（貯金額＝累積収支）
     1日ごとの net（収入-支出）→ 月内で累積
  ===================== */
  const balanceBarByCurrency = useMemo(() => {
    return CURRENCIES.reduce((acc, currency) => {
      const list = transactionsByCurrency[currency]

      const start = currentMonth.startOf('month')
      const end = currentMonth.endOf('month')
      const daysInMonth = end.date()

      // date(YYYY-MM-DD) => net（その日の収支）
      const netMap: Record<string, number> = {}

      list.forEach((t) => {
        const key = t.date
        const delta = t.type === 'income' ? t.amount : -t.amount
        netMap[key] = (netMap[key] || 0) + delta
      })

      // 1日〜末日まで累積
      let running = 0
      const data = Array.from({ length: daysInMonth }, (_, i) => {
        const d = start.add(i, 'day')
        const key = d.format('YYYY-MM-DD')
        running += netMap[key] || 0
        return {
          day: String(i + 1), // X軸表示用
          balance: running,   // 累積収支（＝貯金額の推移）
        }
      })

      acc[currency] = data
      return acc
    }, {} as Record<Currency, { day: string; balance: number }[]>)
  }, [transactionsByCurrency, currentMonth])

  return (
    <main className="mx-auto max-w-5xl p-4 bg-gray-200 min-h-screen text-black">
      <div className="mb-4 flex items-center justify-between">
        <button
          className="px-2 text-xl"
          onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
        >
          ‹
        </button>
        <h1 className="text-xl font-semibold">
          {currentMonth.format('YYYY年 M月')} レポート
        </h1>
        <button
          className="px-2 text-xl"
          onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
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
            const totals = totalsByCurrency[currency]
            const pie = pieDataByCurrency[currency]
            const barData = balanceBarByCurrency[currency]

            return (
              <TabsContent key={currency} value={currency}>
                {/* Summary */}
                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                  <Card className="bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500">収入</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-green-600">
                        {totals.income.toLocaleString()} {currency}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500">支出</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-red-600">
                        {totals.expense.toLocaleString()} {currency}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500">収支（貯金額）</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p
                        className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-blue-600' : 'text-red-600'
                          }`}
                      >
                        {totals.balance.toLocaleString()} {currency}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Balance Bar Chart */}
                <Card className="bg-white shadow-lg mb-6">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-500">
                      貯金額（累積収支）の推移
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    {barData.length === 0 ? (
                      <p className="text-sm text-gray-400">データがありません</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" tickMargin={8} />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="balance">
                            {barData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.balance >= 0 ? '#3b82f6' : '#ef4444'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                {/* Pie Charts */}
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Expense */}
                  <Card className="bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500">
                        支出（カテゴリ別）
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                      {pie.expense.length === 0 ? (
                        <p className="text-sm text-gray-400">データがありません</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pie.expense}
                              dataKey="value"
                              nameKey="name"
                              outerRadius={90}
                              label
                            >
                              {pie.expense.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'][i % 5]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  {/* Income */}
                  <Card className="bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500">
                        収入（カテゴリ別）
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                      {pie.income.length === 0 ? (
                        <p className="text-sm text-gray-400">データがありません</p>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pie.income}
                              dataKey="value"
                              nameKey="name"
                              outerRadius={90}
                              label
                            >
                              {pie.income.map((_, i) => (
                                <Cell
                                  key={i}
                                  fill={['#22c55e', '#3b82f6', '#8b5cf6', '#06b6d4'][i % 4]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      )}
    </main>
  )
}
