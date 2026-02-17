'use client'

import { CURRENCIES } from '@/types/currency'
import { WEEK_DAYS } from '@/constants/date'
import { useRecurringContext } from '@/contexts/RecurringContext'
import type { RecurringTransaction } from '@/types/recurring'

type Props = {
  recurring: RecurringTransaction
}

export function RecurringItem({ recurring }: Props) {
  const {
    editingRecurringId,
    editRecurringType,
    setEditRecurringType,
    editRecurringAmount,
    setEditRecurringAmount,
    editRecurringCurrency,
    setEditRecurringCurrency,
    editRecurringCycle,
    setEditRecurringCycle,
    editRecurringDayOfMonth,
    setEditRecurringDayOfMonth,
    editRecurringDayOfWeek,
    setEditRecurringDayOfWeek,
    editRecurringCategoryId,
    setEditRecurringCategoryId,
    categories,
    startEditRecurring,
    handleUpdateRecurring,
    handleCancelEditRecurring,
    handleToggleRecurring,
    setDeleteRecurringTargetId,
    savingRecurring,
  } = useRecurringContext()


  const isEditing = editingRecurringId === recurring.id
  const isDisabled = editingRecurringId !== null && editingRecurringId !== recurring.id

  // 以降は既存コードそのまま
  return (
    <div className="rounded border bg-white p-4 shadow-sm">
      {isEditing ? (
        // ===== 編集モード =====
        <div className="space-y-3">
          <h2 className='text-lg font-semibold text-black'>編集画面</h2>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <select
              value={editRecurringType}
              onChange={(e) => {
                const nextType = e.target.value as 'income' | 'expense'
                setEditRecurringType(nextType)
                setEditRecurringCategoryId(null)
              }}
              className="border rounded px-2 py-1"
            >
              <option value="income">収入</option>
              <option value="expense">支出</option>
            </select>

            <input
              value={editRecurringAmount}
              onChange={(e) => {
                const v = e.target.value
                if (/^\d*$/.test(v)) {
                  setEditRecurringAmount(v)
                }
              }}
              className="border rounded px-2 py-1 w-32"
              placeholder="金額"
            />

            <select
              value={editRecurringCurrency}
              onChange={(e) => setEditRecurringCurrency(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <select
              value={editRecurringCycle}
              onChange={(e) =>
                setEditRecurringCycle(e.target.value as 'monthly' | 'weekly')
              }
              className="border rounded px-2 py-1 w-full sm:w-auto"
            >
              <option value="monthly">毎月</option>
              <option value="weekly">毎週</option>
            </select>

            {editRecurringCycle === 'monthly' ? (
              <input
                min={1}
                max={31}
                value={editRecurringDayOfMonth}
                onChange={(e) =>
                  setEditRecurringDayOfMonth(Number(e.target.value))
                }
                className="border rounded px-2 py-1 w-full sm:w-24"
              />
            ) : (
              <select
                value={editRecurringDayOfWeek}
                onChange={(e) =>
                  setEditRecurringDayOfWeek(Number(e.target.value))
                }
                className="border rounded px-2 py-1 w-full sm:w-auto"
              >
                {WEEK_DAYS.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            )}
            <select
              value={editRecurringCategoryId ?? ''}
              onChange={(e) =>
                setEditRecurringCategoryId(e.target.value || null)
              }
              className="border rounded px-2 py-1 w-full sm:w-auto"
            >
              <option value="">カテゴリなし</option>
              {categories
                .filter((c) => c.is_active && c.type === editRecurringType)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>

          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => handleUpdateRecurring(recurring.id)}
              disabled={savingRecurring}
              className={`rounded px-4 py-1.5 text-sm
                ${savingRecurring
                  ? 'opacity-50 cursor-not-allowed'
                  : 'border border-green-400 text-green-600 hover:bg-green-500 hover:text-white'
                }`}
            >
              保存
            </button>
            <button
              onClick={handleCancelEditRecurring}
              className="rounded px-4 py-1.5 text-sm border border-red-400 text-red-600 hover:bg-red-500 hover:text-white"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        // ===== 表示モード =====
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">
              {recurring.type === 'income' ? '収入' : '支出'}
              {recurring.amount.toLocaleString()} {recurring.currency}
            </p>
            <p className="text-sm text-gray-500">
              {recurring.cycle === 'monthly'
                ? `毎月 ${recurring.day_of_month} 日`
                : `毎週 ${WEEK_DAYS[recurring.day_of_week ?? 0]}`}
            </p>
            <p className="text-sm text-gray-500">
              カテゴリ：
              {recurring.category_id
                ? categories.find((c) => c.id === recurring.category_id)?.name ?? '削除済み'
                : '未設定'}
            </p>
          </div>

          <div className="flex gap-2 justify-end items-center">
            <button
              onClick={() => startEditRecurring(recurring)}
              disabled={
                editingRecurringId !== null &&
                editingRecurringId !== recurring.id
              }
              className={`text-xs px-2 py-1 rounded transition border
              ${isDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'border-blue-400 text-blue-600 hover:bg-blue-500 hover:text-white'
                }`}
            >
              編集
            </button>

            <button
              onClick={() =>handleToggleRecurring(recurring.id, recurring.is_active)}
              disabled={isDisabled}
              className={`text-xs px-2 py-1 rounded transition
                  ${isDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : recurring.is_active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`
              }
            >
              {recurring.is_active ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() =>setDeleteRecurringTargetId(recurring.id)}
              disabled={isDisabled}
              className={`text-xs px-2 py-1 rounded transition border
                ${isDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'border-red-400 text-red-600 hover:bg-red-500 hover:text-white'
                }`}
            >
              削除
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
