'use client'

import { CURRENCIES } from '@/types/currency'
import { WEEK_DAYS } from '@/constants/date'
import type { Category } from '@/types/category'

type Props = {
  newRecurringType: 'income' | 'expense'
  onTypeChange: (type: 'income' | 'expense') => void
  newRecurringAmount: string
  onAmountChange: (value: string) => void
  newRecurringCurrency: string
  onCurrencyChange: (value: string) => void
  newRecurringCycle: 'monthly' | 'weekly'
  onCycleChange: (value: 'monthly' | 'weekly') => void
  newRecurringDayOfMonth: number
  onDayOfMonthChange: (value: number) => void
  newRecurringDayOfWeek: number
  onDayOfWeekChange: (value: number) => void
  newRecurringCategoryId: string | null
  onCategoryIdChange: (value: string | null) => void
  categories: Category[]
  onAdd: () => void
  disabled: boolean
}

export function RecurringAddForm({
  newRecurringType,
  onTypeChange,
  newRecurringAmount,
  onAmountChange,
  newRecurringCurrency,
  onCurrencyChange,
  newRecurringCycle,
  onCycleChange,
  newRecurringDayOfMonth,
  onDayOfMonthChange,
  newRecurringDayOfWeek,
  onDayOfWeekChange,
  newRecurringCategoryId,
  onCategoryIdChange,
  categories,
  onAdd,
  disabled,
}: Props) {
  return (
    <div className="mb-6 rounded border bg-white p-4 shadow-sm space-y-4">
      <h3 className="font-medium text-gray-600">連続収支を追加</h3>

      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={newRecurringType}
          onChange={(e) => {
            const nextType = e.target.value as 'income' | 'expense'
            onTypeChange(nextType)
            onCategoryIdChange(null)
          }}
          className="border rounded px-2 py-1 w-full sm:w-auto"
        >
          <option value="income">収入</option>
          <option value="expense">支出</option>
        </select>

        <input
          placeholder="金額"
          value={newRecurringAmount}
          onChange={(e) => {
            const v = e.target.value
            if (/^\d*$/.test(v)) {
              onAmountChange(v)
            }
          }}
          className="border rounded px-2 py-1 w-32 sm:w-auto"
        />

        <select
          value={newRecurringCurrency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={newRecurringCycle}
          onChange={(e) =>
            onCycleChange(e.target.value as 'monthly' | 'weekly')
          }
          className="border rounded px-2 py-1"
        >
          <option value="monthly">毎月</option>
          <option value="weekly">毎週</option>
        </select>

        {newRecurringCycle === 'monthly' ? (
          <input
            min={1}
            max={31}
            value={newRecurringDayOfMonth}
            onChange={(e) =>
              onDayOfMonthChange(Number(e.target.value))
            }
            className="border rounded px-2 py-1 w-24"
          />
        ) : (
          <select
            value={newRecurringDayOfWeek}
            onChange={(e) =>
              onDayOfWeekChange(Number(e.target.value))
            }
            className="border rounded px-2 py-1"
          >
            {WEEK_DAYS.map((d, i) => (
              <option key={i} value={i}>{d}</option>
            ))}
          </select>
        )}

        <select
          value={newRecurringCategoryId ?? ''}
          onChange={(e) =>
            onCategoryIdChange(e.target.value || null)
          }
          className="border rounded px-2 py-1"
        >
          <option value="">カテゴリなし</option>

          {categories
            .filter(
              (c) =>
                c.is_active &&
                c.type === newRecurringType
            )
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>

      </div>

      <button
        onClick={onAdd}
        disabled={disabled}
        className={`
          rounded px-4 py-1.5 text-sm
          ${disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'border border-green-400 text-green-600 hover:bg-green-500 hover:text-white'
          }
        `}
      >
        追加
      </button>
    </div>
  )
}
