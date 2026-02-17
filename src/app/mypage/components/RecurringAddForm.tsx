'use client'

import { CURRENCIES } from '@/types/currency'
import { WEEK_DAYS } from '@/constants/date'
import { useRecurringContext } from '@/contexts/RecurringContext'

export function RecurringAddForm() {
  const {
    newRecurringType,
    newRecurringAmount,
    newRecurringCurrency,
    newRecurringCycle,
    newRecurringDayOfMonth,
    newRecurringDayOfWeek,
    newRecurringCategoryId,

    setNewRecurringType,
    setNewRecurringAmount,
    setNewRecurringCurrency,
    setNewRecurringCycle,
    setNewRecurringDayOfMonth,
    setNewRecurringDayOfWeek,
    setNewRecurringCategoryId,

    handleAddRecurring,
    editingRecurringId,
    categories,
  } = useRecurringContext()

  return (
    <div className="mb-6 rounded border bg-white p-4 shadow-sm space-y-4">
      <h3 className="font-medium text-gray-600">連続収支を追加</h3>

      <div className="flex flex-col sm:flex-row gap-2">
        <select
          value={newRecurringType}
          onChange={(e) => {
            const nextType = e.target.value as 'income' | 'expense'
            setNewRecurringType(nextType)
            setNewRecurringCategoryId(null)
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
              setNewRecurringAmount(v)
            }
          }}
          className="border rounded px-2 py-1 w-32 sm:w-auto"
        />

        <select
          value={newRecurringCurrency}
          onChange={(e) => setNewRecurringCurrency(e.target.value)}
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
            setNewRecurringCycle(e.target.value as 'monthly' | 'weekly')
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
            value={
              Number.isNaN(newRecurringDayOfMonth)
                ? ''
                : newRecurringDayOfMonth
            }
            onChange={(e) => {
              const v = e.target.value
              setNewRecurringDayOfMonth(
                v === '' ? NaN : Number(v)
              )
            }}
            className="border rounded px-2 py-1 w-24"
          />
        ) : (
          <select
            value={newRecurringDayOfWeek}
            onChange={(e) =>
              setNewRecurringDayOfWeek(Number(e.target.value))
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
            setNewRecurringCategoryId(e.target.value || null)
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
        onClick={handleAddRecurring}
        disabled={editingRecurringId !== null}
        className={`
          rounded px-4 py-1.5 text-sm
          ${editingRecurringId !== null
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
