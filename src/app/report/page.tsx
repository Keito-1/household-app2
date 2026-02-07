'use client'

import ReportHeader from './components/ReportHeader'
import SummarySection from './components/SummarySection'
import ChartSection from './components/ChartSection'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ALL_JPY, CURRENCIES } from '@/types/currency'
import { useReport } from '@/hooks/report/useReport'

export default function ReportPage() {
  const { currentPeriod, setCurrentPeriod, reportData, fxMeta } = useReport()

  const selectedDate = currentPeriod.endOf('month').format('YYYY-MM-DD')

  return (
    <div className="max-w-5xl mx-auto px-4 pb-12">
      <ReportHeader
        currentPeriod={currentPeriod}
        onPrev={() => setCurrentPeriod(currentPeriod.subtract(1, 'month'))}
        onNext={() => setCurrentPeriod(currentPeriod.add(1, 'month'))}
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
          <p className="text-xs text-orange-500 mt-5 mb-4 md:mt-0">
            ※指定日({selectedDate})の為替が無いため、直近営業日のレート({fxMeta.rate_date})を使用しています
          </p>
        )}

        {[...CURRENCIES, ALL_JPY].map((currency) => {
          const data = reportData[currency] ?? {
            baseTransactions: [],
            income: 0,
            expense: 0,
            balance: 0,
            expensePieData: [],
            incomePieData: [],
            barChartData: [],
          }

          return (
            <TabsContent key={currency} value={currency}>
              <SummarySection
                totalIncome={data.income}
                totalExpense={data.expense}
                balance={data.balance}
              />

              <ChartSection
                barChartData={data.barChartData}
                expensePieData={data.expensePieData}
                incomePieData={data.incomePieData}
              />
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
