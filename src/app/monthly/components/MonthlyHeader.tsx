'use client'

import type dayjs from 'dayjs'
import { Button } from '@/components/ui/button'

type Props = {
  currentMonth: dayjs.Dayjs
  onPrev: () => void
  onNext: () => void
}

export default function MonthlyHeader({ currentMonth, onPrev, onNext }: Props) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <Button variant="ghost"
        className="text-2xl font-bold"
        onClick={onPrev}>
        ‹
      </Button>
      <h1 className="text-lg font-semibold">
        {currentMonth.format('MMMM YYYY')}
      </h1>
      <Button variant="ghost"
        className="text-2xl font-bold"
        onClick={onNext}>
        ›
      </Button>
    </div>
  )
}
