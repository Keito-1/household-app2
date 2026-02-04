'use client'

import { RecurringAddForm } from './RecurringAddForm'
import { RecurringItem } from './RecurringItem'

import type { Category } from '@/types/category'
import type { RecurringTransaction } from '@/types/recurring'

type Props = {
  recurringList: RecurringTransaction[]
  recurringLoading: boolean
  categories: Category[]
  
  // Add Form Props
  newRecurringType: 'income' | 'expense'
  onNewTypeChange: (type: 'income' | 'expense') => void
  newRecurringAmount: string
  onNewAmountChange: (value: string) => void
  newRecurringCurrency: string
  onNewCurrencyChange: (value: string) => void
  newRecurringCycle: 'monthly' | 'weekly'
  onNewCycleChange: (value: 'monthly' | 'weekly') => void
  newRecurringDayOfMonth: number
  onNewDayOfMonthChange: (value: number) => void
  newRecurringDayOfWeek: number
  onNewDayOfWeekChange: (value: number) => void
  newRecurringCategoryId: string | null
  onNewCategoryIdChange: (value: string | null) => void
  onAddRecurring: () => void
  
  // Item Props
  editingRecurringId: string | null
  editRecurringType: 'income' | 'expense'
  onEditTypeChange: (type: 'income' | 'expense') => void
  editRecurringAmount: string
  onEditAmountChange: (value: string) => void
  editRecurringCurrency: string
  onEditCurrencyChange: (value: string) => void
  editRecurringCycle: 'monthly' | 'weekly'
  onEditCycleChange: (value: 'monthly' | 'weekly') => void
  editRecurringDayOfMonth: number
  onEditDayOfMonthChange: (value: number) => void
  editRecurringDayOfWeek: number
  onEditDayOfWeekChange: (value: number) => void
  editRecurringCategoryId: string | null
  onEditCategoryIdChange: (value: string | null) => void
  onStartEditRecurring: (recurring: RecurringTransaction) => void
  onUpdateRecurring: (id: string) => void
  onCancelEditRecurring: () => void
  onToggleRecurring: (id: string, current: boolean) => void
  onDeleteRecurringStart: (id: string) => void
  savingRecurring: boolean
}

export function RecurringList({
  recurringList,
  recurringLoading,
  categories,
  newRecurringType,
  onNewTypeChange,
  newRecurringAmount,
  onNewAmountChange,
  newRecurringCurrency,
  onNewCurrencyChange,
  newRecurringCycle,
  onNewCycleChange,
  newRecurringDayOfMonth,
  onNewDayOfMonthChange,
  newRecurringDayOfWeek,
  onNewDayOfWeekChange,
  newRecurringCategoryId,
  onNewCategoryIdChange,
  onAddRecurring,
  editingRecurringId,
  editRecurringType,
  onEditTypeChange,
  editRecurringAmount,
  onEditAmountChange,
  editRecurringCurrency,
  onEditCurrencyChange,
  editRecurringCycle,
  onEditCycleChange,
  editRecurringDayOfMonth,
  onEditDayOfMonthChange,
  editRecurringDayOfWeek,
  onEditDayOfWeekChange,
  editRecurringCategoryId,
  onEditCategoryIdChange,
  onStartEditRecurring,
  onUpdateRecurring,
  onCancelEditRecurring,
  onToggleRecurring,
  onDeleteRecurringStart,
  savingRecurring,
}: Props) {
  return (
    <>
      <h2 className="mb-4 font-semibold text-lg">連続収支設定</h2>

      <p className="text-sm text-gray-600 mb-4">
        毎月・毎週など、定期的に自動登録したい収支を設定できます。
      </p>

      <RecurringAddForm
        newRecurringType={newRecurringType}
        onTypeChange={onNewTypeChange}
        newRecurringAmount={newRecurringAmount}
        onAmountChange={onNewAmountChange}
        newRecurringCurrency={newRecurringCurrency}
        onCurrencyChange={onNewCurrencyChange}
        newRecurringCycle={newRecurringCycle}
        onCycleChange={onNewCycleChange}
        newRecurringDayOfMonth={newRecurringDayOfMonth}
        onDayOfMonthChange={onNewDayOfMonthChange}
        newRecurringDayOfWeek={newRecurringDayOfWeek}
        onDayOfWeekChange={onNewDayOfWeekChange}
        newRecurringCategoryId={newRecurringCategoryId}
        onCategoryIdChange={onNewCategoryIdChange}
        categories={categories}
        onAdd={onAddRecurring}
        disabled={editingRecurringId !== null}
      />

      <div className="rounded border bg-gray-50 p-4 text-sm text-gray-500">
        {recurringLoading ? (
          <p className="text-sm text-gray-500">読み込み中...</p>
        ) : recurringList.length === 0 ? (
          <p className="text-sm text-gray-500">
            まだ連続収支は登録されていません。
          </p>
        ) : (
          <div className="space-y-3">
            {recurringList.map((r) => (
              <RecurringItem
                key={r.id}
                recurring={r}
                isEditing={editingRecurringId === r.id}
                editRecurringType={editRecurringType}
                onEditTypeChange={onEditTypeChange}
                editRecurringAmount={editRecurringAmount}
                onEditAmountChange={onEditAmountChange}
                editRecurringCurrency={editRecurringCurrency}
                onEditCurrencyChange={onEditCurrencyChange}
                editRecurringCycle={editRecurringCycle}
                onEditCycleChange={onEditCycleChange}
                editRecurringDayOfMonth={editRecurringDayOfMonth}
                onEditDayOfMonthChange={onEditDayOfMonthChange}
                editRecurringDayOfWeek={editRecurringDayOfWeek}
                onEditDayOfWeekChange={onEditDayOfWeekChange}
                editRecurringCategoryId={editRecurringCategoryId}
                onEditCategoryIdChange={onEditCategoryIdChange}
                categories={categories}
                onStartEdit={() => onStartEditRecurring(r)}
                onSave={() => onUpdateRecurring(r.id)}
                onCancel={onCancelEditRecurring}
                onToggle={() => onToggleRecurring(r.id, r.is_active)}
                onDelete={() => onDeleteRecurringStart(r.id)}
                savingRecurring={savingRecurring}
                disableActions={editingRecurringId !== null && editingRecurringId !== r.id}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
