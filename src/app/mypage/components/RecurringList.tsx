'use client'

import { RecurringAddForm } from './RecurringAddForm'
import { RecurringItem } from './RecurringItem'
import { useRecurringContext } from '@/contexts/RecurringContext'

export function RecurringList() {
  const {
    recurringList,
    recurringLoading,
  } = useRecurringContext()

  return (
    <>
      <h2 className="mb-4 font-semibold text-lg">連続収支設定</h2>

      <p className="text-sm text-gray-600 mb-4">
        毎月・毎週など、定期的に自動登録したい収支を設定できます。
      </p>

      <RecurringAddForm />

      <div className="rounded border bg-gray-50 text-sm text-gray-500">
        {recurringLoading ? (
          <p>読み込み中...</p>
        ) : recurringList.length === 0 ? (
          <p>まだ連続収支は登録されていません。</p>
        ) : (
          <div className="space-y-3">
            {recurringList.map((r) => (
              <RecurringItem key={r.id} recurring={r} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
