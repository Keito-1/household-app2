'use client'

import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore' 
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/contexts/AuthContext'

import type { Transaction } from '@/types/transaction'
import { ALL_JPY, CURRENCIES } from '@/types/currency'


import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ReportHeader from './components/ReportHeader'
import SummarySection from './components/SummarySection'
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

dayjs.extend(isSameOrBefore)

/* =====================
   Page
===================== */
export default function ReportPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [exchangeRates, setExchangeRates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const selectedDate = currentMonth.endOf('month').format('YYYY-MM-DD')

  /* =====================
     取引取得
  ===================== */
  const fetchTransactions = async () => {
    if (!user) {
      router.push('/signin')
      return
    }

    setLoading(true)

    const start = currentMonth.startOf('month').format('YYYY-MM-DD')
    const end = currentMonth.endOf('month').format('YYYY-MM-DD')

    const { data } = await supabase
      .from('transactions')
      .select('*, category: categories(name)')
      .gte('date', start)
      .lte('date', end)

    setTransactions((data ?? []) as Transaction[])
    setLoading(false)
  }

  /* =====================
     為替取得
  ===================== */
  const fetchExchangeRates = async () => {
    const start = currentMonth.startOf('month').format('YYYY-MM-DD')
    const end = currentMonth.endOf('month').format('YYYY-MM-DD')

    const { data } = await supabase
      .from('exchange_rates')
      .select('rate_date, target_currency, rate')
      .gte('rate_date', start)
      .lte('rate_date', end)

    setExchangeRates(data ?? [])
  }

  useEffect(() => {
    fetchTransactions()
    fetchExchangeRates()
  }, [currentMonth, user])

  /* =====================
     🔥 日次レート換算（唯一の追加ロジック）
     UIには一切影響しない
  ===================== */
  const transactionsWithJPY = useMemo(() => {
    return transactions.map((t) => {
      if (t.currency === 'JPY') {
        return { ...t, amount_jpy: t.amount }
      }

      const rate = exchangeRates
        .filter(
          (r) =>
            r.target_currency === t.currency &&
            r.rate_date <= t.date
        )
        .sort((a, b) => b.rate_date.localeCompare(a.rate_date))[0]

      return {
        ...t,
        amount_jpy: rate ? Math.round(t.amount / rate.rate) : 0,
        used_rate_date: rate?.rate_date ?? null,
      }
    })
  }, [transactions, exchangeRates])

  /* =====================
     フォールバック表示用メタ
  ===================== */
  const fxMeta = useMemo(() => {
    if (exchangeRates.length === 0) return null

    const selected = dayjs(selectedDate)

    // selectedDate(=月末日) 以前で取得できている「最新の為替日」を日付として求める
    const latestRateDate = exchangeRates
      .map((r) => r.rate_date)
      .filter(Boolean)
      .filter((d) => dayjs(d).isValid() && dayjs(d).isSameOrBefore(selected))
      .sort((a, b) => dayjs(a).valueOf() - dayjs(b).valueOf())
      .at(-1)

    if (!latestRateDate) return null

    return {
      rate_date: latestRateDate,
    }
  }, [exchangeRates, selectedDate])

  /* =====================
     集計（JPY換算後）
  ===================== */
  const totalIncomeJPY = useMemo(
    () =>
      transactionsWithJPY
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + (t.amount_jpy ?? 0), 0),
    [transactionsWithJPY]
  )

  const totalExpenseJPY = useMemo(
    () =>
      transactionsWithJPY
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + (t.amount_jpy ?? 0), 0),
    [transactionsWithJPY]
  )

  const balanceJPY = totalIncomeJPY - totalExpenseJPY

  //  貯金額推移（累積）を作る関数（タブごとに使う）
  const buildBarChartData = (
    baseTransactions: any[],
    isAllJPY: boolean,
    currentMonth: dayjs.Dayjs
  ) => {
    let cumulative = 0

    return Array.from({ length: currentMonth.daysInMonth() }, (_, i) => {
      const day = i + 1

      const daily = baseTransactions.filter(
        (t) => dayjs(t.date).date() === day
      )

      const dailyIncome = daily
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + (isAllJPY ? (t.amount_jpy ?? 0) : t.amount), 0)

      const dailyExpense = daily
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + (isAllJPY ? (t.amount_jpy ?? 0) : t.amount), 0)

      // ✅ ここがポイント：日ごとの収支を「累積」する
      cumulative += dailyIncome - dailyExpense

      return { day, balance: cumulative }
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <ReportHeader
        currentPeriod={currentMonth}
        onPrev={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
        onNext={() => setCurrentMonth(currentMonth.add(1, 'month'))}
      />

      <Tabs defaultValue="JPY">
        <TabsList className="flex flex-wrap gap-2 mb-4">
          {CURRENCIES.map((c) => (
            <TabsTrigger
              key={c}
              value={c}
              className="bg-white text-black hover:bg-gray-500 hover:text-white"
            >
              {c}
            </TabsTrigger>
          ))}
          <TabsTrigger
            value={ALL_JPY}
            className="bg-white text-black hover:bg-gray-500 hover:text-white"
          >
            全通貨（JPY換算）
          </TabsTrigger>
        </TabsList>

        {fxMeta?.rate_date && fxMeta.rate_date !== selectedDate && (
          <p className="text-xs text-orange-500 mb-2">
            ※指定日({selectedDate})の為替が無いため、
            直近営業日のレート({fxMeta.rate_date})を使用しています
          </p>
        )}

        {[...CURRENCIES, ALL_JPY].map((currency) => {
          const isAllJPY = currency === ALL_JPY

          const baseTransactions = isAllJPY
            ? transactionsWithJPY
            : transactions.filter((t) => t.currency === currency)

          const income = baseTransactions
            .filter((t) => t.type === 'income')
            .reduce(
              (sum, t) => sum + (isAllJPY ? (t.amount_jpy ?? 0) : t.amount),
              0
            )

          const expense = baseTransactions
            .filter((t) => t.type === 'expense')
            .reduce(
              (sum, t) => sum + (isAllJPY ? (t.amount_jpy ?? 0) : t.amount),
              0
            )

          const balance = income - expense

          const barChartData = buildBarChartData(
            baseTransactions as any[],
            isAllJPY,
            currentMonth
          )

          return (
            <TabsContent key={currency} value={currency}>
              <SummarySection
                totalIncome={income}
                totalExpense={expense}
                balance={balance}
              />

              {/* ===== 貯金額推移（棒グラフ） ===== */}
              <Card className="bg-white shadow-lg mb-6">
                <CardHeader>
                  <CardTitle className="text-sm text-gray-500">
                    貯金額推移
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="balance" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* ===== 円グラフ ===== */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-500">
                      支出（カテゴリ別）
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={Object.values(
                            baseTransactions
                              .filter((t) => t.type === 'expense')
                              .reduce((acc: any, t: any) => {
                                const key = t.category?.name ?? '未分類'
                                acc[key] =
                                  (acc[key] ?? 0) +
                                  (isAllJPY ? (t.amount_jpy ?? 0) : t.amount)
                                return acc
                              }, {})
                          ).map((v, i) => ({
                            name: Object.keys(
                              baseTransactions
                                .filter((t) => t.type === 'expense')
                                .reduce((acc: any, t: any) => {
                                  acc[t.category?.name ?? '未分類'] = true
                                  return acc
                                }, {})
                            )[i],
                            value: v,
                          }))}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={80}
                          label
                        >
                          {Array.from({ length: 10 }).map((_, i) => (
                            <Cell
                              key={i}
                              fill={[
                                '#f97316',
                                '#ef4444',
                                '#eab308',
                                '#22c55e',
                                '#3b82f6',
                              ][i % 5]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-sm text-gray-500">
                      収入（カテゴリ別）
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={Object.values(
                            baseTransactions
                              .filter((t) => t.type === 'income')
                              .reduce((acc: any, t: any) => {
                                const key = t.category?.name ?? '未分類'
                                acc[key] =
                                  (acc[key] ?? 0) +
                                  (isAllJPY ? (t.amount_jpy ?? 0) : t.amount)
                                return acc
                              }, {})
                          ).map((v, i) => ({
                            name: Object.keys(
                              baseTransactions
                                .filter((t) => t.type === 'income')
                                .reduce((acc: any, t: any) => {
                                  acc[t.category?.name ?? '未分類'] = true
                                  return acc
                                }, {})
                            )[i],
                            value: v,
                          }))}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={80}
                          label
                        >
                          {Array.from({ length: 10 }).map((_, i) => (
                            <Cell
                              key={i}
                              fill={[
                                '#22c55e',
                                '#3b82f6',
                                '#a855f7',
                                '#ec4899',
                                '#14b8a6',
                              ][i % 5]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div >
  )
}
