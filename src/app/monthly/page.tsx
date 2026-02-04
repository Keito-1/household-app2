'use client'

import { useState } from 'react'
import dayjs from 'dayjs'

import MonthlyHeader from './components/MonthlyHeader'
import TransactionModal from '@/app/monthly/components/TransactionModal'
import MonthlyCalendar from './components/MonthlyCalendar'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useAuth } from '@/contexts/AuthContext'
import { useMonthlyTransactions } from '@/hooks/monthly/useMonthlyTransactions'

import type { TransactionType, ModalTransaction } from '@/types/transaction'
import type { Category } from '@/types/category'

export default function MonthlyPage() {
  const { user, categories } = useAuth()
  const activeCategories: Category[] = categories.filter(c => c.is_active)

  // Page state
  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // Form state (add)
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newCurrency, setNewCurrency] = useState('JPY')
  const [newType, setNewType] = useState<TransactionType>('expense')

  // Form state (edit)
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editCurrency, setEditCurrency] = useState('JPY')
  const [editType, setEditType] = useState<TransactionType>('expense')

  // Hook: transaction management
  const { transactions, handleAdd, handleDelete, handleUpdate, editingId, setEditingId } =
    useMonthlyTransactions(currentMonth, user)

  return (
    <main className="mx-auto max-w-5xl p-4 bg-gray-200 text-black">
      <MonthlyHeader
        currentMonth={currentMonth}
        onPrev={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
        onNext={() => setCurrentMonth(currentMonth.add(1, 'month'))}
      />

      <MonthlyCalendar
        currentMonth={currentMonth}
        transactions={transactions}
        onSelectDate={(d) => {
          setSelectedDate(d.format('YYYY-MM-DD'))
          setIsOpen(true)
          setEditingId(null)
          setNewCategoryId('')
          setNewAmount('')
        }}
      />

      <TransactionModal
        open={isOpen}
        onOpenChange={setIsOpen}
        selectedDate={selectedDate}
        transactions={transactions.filter((t) => t.date === selectedDate)}
        categories={activeCategories}
        newCategoryId={newCategoryId}
        setNewCategoryId={setNewCategoryId}
        newAmount={newAmount}
        setNewAmount={setNewAmount}
        newCurrency={newCurrency}
        setNewCurrency={setNewCurrency}
        newType={newType}
        setNewType={setNewType}
        onAdd={async () => {
          if (!newCategoryId || !newAmount) return
          await handleAdd(selectedDate, newCategoryId, newAmount, newCurrency, newType)
          setNewCategoryId('')
          setNewAmount('')
          setNewCurrency('JPY')
          setNewType('expense')
        }}
        editingId={editingId}
        editCategoryId={editCategoryId}
        setEditCategoryId={setEditCategoryId}
        editAmount={editAmount}
        setEditAmount={setEditAmount}
        editCurrency={editCurrency}
        setEditCurrency={setEditCurrency}
        editType={editType}
        setEditType={setEditType}
        onStartEdit={(t: ModalTransaction) => {
          setEditingId(t.id)
          setEditCategoryId(t.category_id ?? '')
          setEditAmount(String(t.amount))
          setEditCurrency(t.currency)
          setEditType(t.type)
        }}
        onUpdate={async () => {
          if (!editingId || !editCategoryId) return
          await handleUpdate(editingId, editCategoryId, editAmount, editCurrency, editType)
          setEditCategoryId('')
          setEditAmount('')
          setEditCurrency('JPY')
          setEditType('expense')
          setIsOpen(false)
        }}
        onDelete={(id) => setDeleteTargetId(id)}
      />

      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(v) => !v && setDeleteTargetId(null)}
        title="削除確認"
        description="本当に削除しますか？"
        onConfirm={async () => {
          if (deleteTargetId) {
            await handleDelete(deleteTargetId)
            setDeleteTargetId(null)
          }
        }}
      />
    </main>
  )
}
