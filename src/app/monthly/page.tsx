'use client'

import { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

import { Button } from '@/components/ui/button'
import TransactionModal from '@/components/TransactionModal'
import CalendarGrid from '@/components/CalendarGrid'

import type { Transaction, TxType } from '@/types/transaction'
import type { Category } from '@/types/category'

export default function MonthlyPage() {
  const router = useRouter()

  const [currentMonth, setCurrentMonth] = useState(dayjs())
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  // modal
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))

  // add
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newCurrency, setNewCurrency] = useState('JPY')
  const [newType, setNewType] = useState<TxType>('expense')

  // edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCategoryId, setEditCategoryId] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editCurrency, setEditCurrency] = useState('JPY')
  const [editType, setEditType] = useState<TxType>('expense')

  /* =====================
     Fetch
  ===================== */
  const fetchTransactions = async () => {
    setLoading(true)

    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      router.push('/signin')
      setLoading(false)
      return
    }

    const start = currentMonth.startOf('month').format('YYYY-MM-DD')
    const end = currentMonth.endOf('month').format('YYYY-MM-DD')

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date')

    setTransactions((data ?? []) as Transaction[])
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return

    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', auth.user.id)
      .eq('is_active', true)
      .order('sort_order')

    setCategories(data ?? [])
  }

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [currentMonth])

  /* =====================
     Calendar helpers
  ===================== */
  const calendarDays = useMemo(() => {
    const start = currentMonth.startOf('month').startOf('week')
    return Array.from({ length: 42 }, (_, i) => start.add(i, 'day'))
  }, [currentMonth])

  const dayTx = (ymd: string) =>
    transactions.filter((t) => t.date === ymd)

  /* =====================
     Handlers
  ===================== */
  const openModal = (d: dayjs.Dayjs) => {
    setSelectedDate(d.format('YYYY-MM-DD'))
    setIsOpen(true)
    setEditingId(null)
    setNewCategoryId('')
    setNewAmount('')
  }

  // add
  const handleAdd = async () => {
    if (!newCategoryId || !newAmount) return

    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return

    await supabase.from('transactions').insert({
      user_id: auth.user.id,
      date: selectedDate,
      category_id: newCategoryId,
      amount: Number(newAmount),
      currency: newCurrency,
      type: newType,
    })

    fetchTransactions()
  }

  // delete
  const handleDelete = async (id: string) => {
    await supabase.from('transactions').delete().eq('id', id)
    fetchTransactions()
  }

  // edit
  const startEdit = (t: Transaction) => {
    setEditingId(t.id)
    setEditCategoryId(t.category_id ?? '')
    setEditAmount(String(t.amount))
    setEditCurrency(t.currency)
    setEditType(t.type)
  }

  // update
  const handleUpdate = async () => {
    if (!editingId || !editCategoryId) return

    await supabase
      .from('transactions')
      .update({
        category_id: editCategoryId,
        amount: Number(editAmount),
        currency: editCurrency,
        type: editType,
      })
      .eq('id', editingId)

    setEditingId(null)
    fetchTransactions()
  }

  return (
    <main className="mx-auto max-w-4xl p-4 bg-gray-200 text-black">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}>
          ‹
        </Button>
        <h1 className="text-lg font-semibold">
          {currentMonth.format('MMMM YYYY')}
        </h1>
        <Button variant="ghost" onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}>
          ›
        </Button>
      </div>

      <CalendarGrid
        currentMonth={currentMonth}
        calendarDays={calendarDays}
        onSelectDate={openModal}
        dayHasExpense={(ymd) => dayTx(ymd).some((t) => t.type === 'expense')}
        dayHasIncome={(ymd) => dayTx(ymd).some((t) => t.type === 'income')}
      />

      <TransactionModal
        open={isOpen}
        onOpenChange={setIsOpen}
        selectedDate={selectedDate}
        transactions={dayTx(selectedDate)}
        categories={categories}

        newCategoryId={newCategoryId}
        setNewCategoryId={setNewCategoryId}
        newAmount={newAmount}
        setNewAmount={setNewAmount}
        newCurrency={newCurrency}
        setNewCurrency={setNewCurrency}
        newType={newType}
        setNewType={setNewType}
        onAdd={handleAdd}

        editingId={editingId}
        editCategoryId={editCategoryId}
        setEditCategoryId={setEditCategoryId}
        editAmount={editAmount}
        setEditAmount={setEditAmount}
        editCurrency={editCurrency}
        setEditCurrency={setEditCurrency}
        editType={editType}
        setEditType={setEditType}
        onStartEdit={startEdit}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </main>
  )
}
