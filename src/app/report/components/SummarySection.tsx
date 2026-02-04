'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  totalIncome: number
  totalExpense: number
  balance: number
}

export default function SummarySection({ totalIncome, totalExpense, balance }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm text-gray-500">収入</CardTitle>
        </CardHeader>
        <CardContent className="text-xl font-bold text-green-600">
          {totalIncome.toLocaleString()} JPY
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm text-gray-500">支出</CardTitle>
        </CardHeader>
        <CardContent className="text-xl font-bold text-red-600">
          {totalExpense.toLocaleString()} JPY
        </CardContent>
      </Card>

      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm text-gray-500">収支（貯金額）</CardTitle>
        </CardHeader>
        <CardContent className="text-xl font-bold text-blue-600">
          {balance.toLocaleString()} JPY
        </CardContent>
      </Card>
    </div>
  )
}
