import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface YearlyChartProps {
  data: {
    month: number
    balance: number
  }[]
}

export function YearlyChart({ data }: YearlyChartProps) {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-sm text-gray-500">
          月別 収支（貯金額）
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickFormatter={(m) => `${m}月`} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="balance">
              {data.map((d, i) => (
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
  )
}
