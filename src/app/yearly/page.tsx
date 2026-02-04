'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useYearlyReport } from '@/hooks/yearly/useYearlyReport'
import { YearlySummary } from './components/YearlySummary'
import { YearlyChart } from './components/YearlyChart'
import { ALL_JPY } from '@/types/currency'

export default function YearlyPage() {
  const {
    currentYear,
    setCurrentYear,
    loading,
    currencyTabs,
    monthlyTotalsByCurrency,
    monthlyTotalsAllJPY,
    yearlySummaryByCurrency,
    yearlySummaryAllJPY,
  } = useYearlyReport()

  return (
    <main className="mx-auto max-w-5xl p-4 bg-gray-200 min-h-screen text-black">
      {/* Year Selector */}
      <div className="mb-6 flex items-center justify-between">
        <button
          className="px-2 text-xl"
          onClick={() => setCurrentYear(currentYear - 1)}
        >
          ‹
        </button>

        <h1 className="text-xl font-semibold">
          {currentYear} 年 年間レポート
        </h1>

        <button
          className="px-2 text-xl"
          onClick={() => setCurrentYear(currentYear + 1)}
        >
          ›
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <Tabs defaultValue="JPY" className="w-full">
          <TabsList className="flex flex-wrap gap-2 mb-6">
            {currencyTabs.map((c) => (
              <TabsTrigger
                key={c}
                value={c}
                className="bg-white text-black hover:bg-gray-500 hover:text-white"
              >
                {c === ALL_JPY ? '全通貨（JPY）' : c}
              </TabsTrigger>
            ))}
          </TabsList>

          {currencyTabs.map((currency) => {
            const isAllJPY = currency === ALL_JPY
            const displayCurrency = isAllJPY ? 'JPY' : currency

            const summary = isAllJPY
              ? yearlySummaryAllJPY
              : yearlySummaryByCurrency[currency]

            const barData = isAllJPY
              ? monthlyTotalsAllJPY
              : monthlyTotalsByCurrency[currency]

            return (
              <TabsContent key={currency} value={currency}>
                {/* Summary */}
                <YearlySummary
                  summary={summary}
                  displayCurrency={displayCurrency}
                  isPositiveBalance={summary.balance >= 0}
                />

                {/* Bar Chart */}
                <YearlyChart data={barData} />
              </TabsContent>
            )
          })}
        </Tabs>
      )}
    </main>
  )
}
