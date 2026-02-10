'use client'

import type { Dayjs } from 'dayjs'

type Props = {
  currentPeriod: Dayjs
  onPrev: () => void
  onNext: () => void
  onChangeView?: (v: string) => void
}

export default function ReportHeader({ currentPeriod, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center justify-between my-6">
      <button onClick={onPrev} className="text-xl">
        ‹
      </button>
      <h2 className="text-xl font-semibold">
        {currentPeriod.format('YYYY年 M月')} 月間レポート
      </h2>
      <button onClick={onNext} className="text-xl">
        ›
      </button>
    </div>
  )
}
