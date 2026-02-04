import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface YearlySummaryProps {
  summary: {
    income: number
    expense: number
    balance: number
  }
  displayCurrency: string
  isPositiveBalance: boolean
}

export function YearlySummary({
  summary,
  displayCurrency,
  isPositiveBalance,
}: YearlySummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3 mb-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm text-gray-500">年間収入</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-green-600">
            {summary.income.toLocaleString()} {displayCurrency}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm text-gray-500">年間支出</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-red-600">
            {summary.expense.toLocaleString()} {displayCurrency}
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
            className={`text-2xl font-bold ${
              isPositiveBalance ? 'text-blue-600' : 'text-red-600'
            }`}
          >
            {summary.balance.toLocaleString()} {displayCurrency}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
