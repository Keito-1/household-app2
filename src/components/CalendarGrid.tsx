'use client'

import dayjs from 'dayjs'

type Props = {
  currentMonth: dayjs.Dayjs
  calendarDays: dayjs.Dayjs[]
  onSelectDate: (d: dayjs.Dayjs) => void
  dayHasExpense: (ymd: string) => boolean
  dayHasIncome: (ymd: string) => boolean
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function CalendarGrid({
  currentMonth,
  calendarDays,
  onSelectDate,
  dayHasExpense,
  dayHasIncome,
}: Props) {
  return (
    <div className="rounded-xl bg-[#2C2F3A] p-4">
      {/* Weekdays */}
      <div className="grid grid-cols-7 gap-1 rounded-md bg-white/3 p-1 text-center text-xs">
        {WEEKDAYS.map((w, idx) => {
          const color =
            idx === 0
              ? 'text-red-400'
              : idx === 6
              ? 'text-sky-400'
              : 'text-white'

          return (
            <div key={`${w}-${idx}`} className={`rounded-sm py-1 ${color}`}>
              {w}
            </div>
          )
        })}
      </div>

      {/* Days */}
      <div className="mt-3 grid grid-cols-7 gap-y-3">
        {calendarDays.map((d) => {
          const ymd = d.format('YYYY-MM-DD')
          const isToday = ymd === dayjs().format('YYYY-MM-DD')
          const isCurrent = d.month() === currentMonth.month()
          const dayOfWeek = d.day()

          const textColor =
            dayOfWeek === 0
              ? 'text-red-400'
              : dayOfWeek === 6
              ? 'text-sky-400'
              : 'text-white'

          const muted = !isCurrent ? 'opacity-40' : ''

          return (
            <button
              key={ymd}
              onClick={() => onSelectDate(d)}
              className="flex flex-col items-center"
            >
              <div
                className={[
                  'flex h-9 w-9 items-center justify-center rounded-full text-sm',
                  textColor,
                  muted,
                  isToday && 'bg-gray-500 text-white',
                ].join(' ')}
              >
                {d.date()}
              </div>

              <div className="mt-1 flex gap-1">
                {dayHasExpense(ymd) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                )}
                {dayHasIncome(ymd) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
