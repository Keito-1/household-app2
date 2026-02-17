'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

import type { Category } from '@/types/category'
import type { RecurringTransaction } from '@/types/recurring'

type UseRecurringReturn = {
  // State
  recurringList: RecurringTransaction[]
  recurringLoading: boolean
  savingRecurring: boolean

  // Add Form State
  newRecurringType: 'income' | 'expense'
  newRecurringAmount: string
  newRecurringCurrency: string
  newRecurringCategoryId: string | null
  newRecurringCycle: 'monthly' | 'weekly'
  newRecurringDayOfMonth: number
  newRecurringDayOfWeek: number

  // Edit Form State
  editingRecurringId: string | null
  editRecurringType: 'income' | 'expense'
  editRecurringAmount: string
  editRecurringCurrency: string
  editRecurringCycle: 'monthly' | 'weekly'
  editRecurringDayOfMonth: number
  editRecurringDayOfWeek: number
  editRecurringCategoryId: string | null

  // Setters for Add Form
  setNewRecurringType: (type: 'income' | 'expense') => void
  setNewRecurringAmount: (value: string) => void
  setNewRecurringCurrency: (value: string) => void
  setNewRecurringCategoryId: (value: string | null) => void
  setNewRecurringCycle: (value: 'monthly' | 'weekly') => void
  setNewRecurringDayOfMonth: (value: number) => void
  setNewRecurringDayOfWeek: (value: number) => void

  // Setters for Edit Form
  setEditRecurringType: (type: 'income' | 'expense') => void
  setEditRecurringAmount: (value: string) => void
  setEditRecurringCurrency: (value: string) => void
  setEditRecurringCycle: (value: 'monthly' | 'weekly') => void
  setEditRecurringDayOfMonth: (value: number) => void
  setEditRecurringDayOfWeek: (value: number) => void
  setEditRecurringCategoryId: (value: string | null) => void

  // Handlers
  fetchRecurring: () => Promise<void>
  handleAddRecurring: () => Promise<void>
  handleDeleteRecurring: (id: string) => Promise<void>
  handleToggleRecurring: (id: string, current: boolean) => Promise<void>
  startEditRecurring: (r: RecurringTransaction) => void
  handleUpdateRecurring: (id: string) => Promise<void>
  handleCancelEditRecurring: () => void

  // Delete Dialog state
  deleteRecurringTargetId: string | null
  setDeleteRecurringTargetId: (id: string | null) => void
}

export function useRecurring(
  user: { id: string } | null
): UseRecurringReturn {
  // Data State
  const [recurringList, setRecurringList] = useState<RecurringTransaction[]>([])
  const [recurringLoading, setRecurringLoading] = useState(false)

  // Add Form State
  const [newRecurringType, setNewRecurringType] = useState<'income' | 'expense'>('income')
  const [newRecurringAmount, setNewRecurringAmount] = useState('')
  const [newRecurringCurrency, setNewRecurringCurrency] = useState('JPY')
  const [newRecurringCategoryId, setNewRecurringCategoryId] = useState<string | null>(null)
  const [newRecurringCycle, setNewRecurringCycle] = useState<'monthly' | 'weekly'>('monthly')
  const [newRecurringDayOfMonth, setNewRecurringDayOfMonth] = useState(1)
  const [newRecurringDayOfWeek, setNewRecurringDayOfWeek] = useState(0)

  // Edit Form State
  const [editingRecurringId, setEditingRecurringId] = useState<string | null>(null)
  const [editRecurringType, setEditRecurringType] = useState<'income' | 'expense'>('income')
  const [editRecurringAmount, setEditRecurringAmount] = useState('')
  const [editRecurringCurrency, setEditRecurringCurrency] = useState('JPY')
  const [editRecurringCycle, setEditRecurringCycle] = useState<'monthly' | 'weekly'>('monthly')
  const [editRecurringDayOfMonth, setEditRecurringDayOfMonth] = useState(1)
  const [editRecurringDayOfWeek, setEditRecurringDayOfWeek] = useState(0)
  const [editRecurringCategoryId, setEditRecurringCategoryId] = useState<string | null>(null)

  // UI State
  const [savingRecurring, setSavingRecurring] = useState(false)
  const [deleteRecurringTargetId, setDeleteRecurringTargetId] = useState<string | null>(null)

  // Fetch Recurring
  const fetchRecurring = useCallback(async () => {
    if (!user) return
    setRecurringLoading(true)

    const { data, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', user.id)   
      .order('created_at', { ascending: false })


    if (!error && data) {
      setRecurringList(data)
    }

    setRecurringLoading(false)

  }, [user])
  
  useEffect(() => {
  if (!user) return
  fetchRecurring()
}, [user, fetchRecurring])


  // Add Recurring
  const handleAddRecurring = async () => {
    if (!user) return
    const amount = Number(newRecurringAmount)
    if (!amount || amount <= 0) return

    const payload: any = {
      user_id: user.id,
      type: newRecurringType,
      amount,
      currency: newRecurringCurrency,
      cycle: newRecurringCycle,
      start_date: new Date().toISOString().slice(0, 10),
      is_active: true,
      category_id: newRecurringCategoryId,
    }

    if (newRecurringCycle === 'monthly') {
      payload.day_of_month = newRecurringDayOfMonth
    } else {
      payload.day_of_week = newRecurringDayOfWeek
    }

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert(payload)
      .select()
      .single()

    if (error) return

    setRecurringList((prev) => [data, ...prev])

    // フォーム初期化
    setNewRecurringAmount('')
    setNewRecurringCategoryId(null)
  }

  // Toggle Recurring
  const handleToggleRecurring = async (id: string, current: boolean) => {
    await supabase
      .from('recurring_transactions')
      .update({ is_active: !current })
      .eq('id', id)

    setRecurringList((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, is_active: !current } : r
      )
    )
  }

  // Delete Recurring
  const handleDeleteRecurring = async (id: string) => {
    await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id)

    setRecurringList((prev) => prev.filter((r) => r.id !== id))
  }

  // Start Edit Recurring
  const startEditRecurring = (r: RecurringTransaction) => {
    setEditRecurringCategoryId(r.category_id ?? null)
    setEditingRecurringId(r.id)
    setEditRecurringType(r.type)
    setEditRecurringAmount(String(r.amount))
    setEditRecurringCurrency(r.currency)
    setEditRecurringCycle(r.cycle)
    setEditRecurringDayOfMonth(r.day_of_month ?? 1)
    setEditRecurringDayOfWeek(r.day_of_week ?? 0)
  }

  // Update Recurring
  const handleUpdateRecurring = async (id: string) => {
    const amount = Number(editRecurringAmount)
    if (savingRecurring) return
    setSavingRecurring(true)
    try {
      if (!amount || amount <= 0) return

      const payload: any = {
        type: editRecurringType,
        amount,
        currency: editRecurringCurrency,
        cycle: editRecurringCycle,
        category_id: editRecurringCategoryId,
      }

      if (editRecurringCycle === 'monthly') {
        payload.day_of_month = editRecurringDayOfMonth
        payload.day_of_week = null
      } else {
        payload.day_of_week = editRecurringDayOfWeek
        payload.day_of_month = null
      }

      const { data, error } = await supabase
        .from('recurring_transactions')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (error || !data) return

      setRecurringList((prev) => prev.map((r) => (r.id === id ? data : r)))
      setEditingRecurringId(null)
    } finally {
      setSavingRecurring(false)
    }
  }

  // Cancel Edit Recurring
  const handleCancelEditRecurring = () => {
    setEditingRecurringId(null)
    setEditRecurringType('income')
    setEditRecurringAmount('')
    setEditRecurringCurrency('JPY')
    setEditRecurringCycle('monthly')
    setEditRecurringDayOfMonth(1)
    setEditRecurringDayOfWeek(0)
    setEditRecurringCategoryId(null)
  }

  return {
    // State
    recurringList,
    recurringLoading,
    savingRecurring,

    // Add Form State
    newRecurringType,
    newRecurringAmount,
    newRecurringCurrency,
    newRecurringCategoryId,
    newRecurringCycle,
    newRecurringDayOfMonth,
    newRecurringDayOfWeek,

    // Edit Form State
    editingRecurringId,
    editRecurringType,
    editRecurringAmount,
    editRecurringCurrency,
    editRecurringCycle,
    editRecurringDayOfMonth,
    editRecurringDayOfWeek,
    editRecurringCategoryId,

    // Setters for Add Form
    setNewRecurringType,
    setNewRecurringAmount,
    setNewRecurringCurrency,
    setNewRecurringCategoryId,
    setNewRecurringCycle,
    setNewRecurringDayOfMonth,
    setNewRecurringDayOfWeek,

    // Setters for Edit Form
    setEditRecurringType,
    setEditRecurringAmount,
    setEditRecurringCurrency,
    setEditRecurringCycle,
    setEditRecurringDayOfMonth,
    setEditRecurringDayOfWeek,
    setEditRecurringCategoryId,

    // Handlers
    fetchRecurring,
    handleAddRecurring,
    handleDeleteRecurring,
    handleToggleRecurring,
    startEditRecurring,
    handleUpdateRecurring,
    handleCancelEditRecurring,

    // Delete Dialog state
    deleteRecurringTargetId,
    setDeleteRecurringTargetId,
  }
}
