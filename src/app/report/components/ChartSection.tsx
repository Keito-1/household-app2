'use client'

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type PieDataItem = { name: string; value: number }

type Props = {
  barChartData: any[]
  expensePieData: PieDataItem[]
  incomePieData: PieDataItem[]
}

export default function ChartSection({ barChartData, expensePieData, incomePieData }: Props) {
  return (
    <>
      <Card className="bg-white shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="text-sm text-gray-500">貯金額推移</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="balance" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500">支出（カテゴリ別）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={expensePieData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Cell
                      key={i}
                      fill={['#f97316', '#ef4444', '#eab308', '#22c55e', '#3b82f6'][i % 5]}
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
            <CardTitle className="text-sm text-gray-500">収入（カテゴリ別）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={incomePieData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Cell
                      key={i}
                      fill={['#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'][i % 5]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
