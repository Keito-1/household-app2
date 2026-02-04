'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

import type { Category } from '@/types/category'

type UseCategoriesReturn = {
  // State
  activeType: Category['type']
  newName: string
  editingId: string | null
  editName: string

  // Setters
  setActiveType: (type: Category['type']) => void
  setNewName: (name: string) => void
  setEditingId: (id: string | null) => void
  setEditName: (name: string) => void

  // Handlers
  addCategory: () => Promise<void>
  updateCategory: (id: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  restoreCategory: (id: string) => Promise<void>
}

export function useCategories(
  user: { id: string } | null,
  categories: Category[],
  fetchCategories: () => Promise<void>
): UseCategoriesReturn {
  const [activeType, setActiveType] = useState<Category['type']>('expense')
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  // Add Category
  const addCategory = async () => {
    const trimmed = newName.trim()
    if (!trimmed) return

    const exists = categories.some(
      (c) => c.name === trimmed && c.type === activeType
    )
    if (exists) {
      alert('同じ名前のカテゴリは既に存在します')
      return
    }

    if (!user) return

    await supabase.from('categories').insert({
      user_id: user.id,
      name: trimmed,
      type: activeType,
      sort_order: categories.length,
      is_active: true,
    })

    setNewName('')
    await fetchCategories()
  }

  // Update Category
  const updateCategory = async (id: string) => {
    if (!editName.trim()) return

    await supabase.from('categories').update({ name: editName }).eq('id', id)

    setEditingId(null)
    setEditName('')
    await fetchCategories()
  }

  // Delete Category (soft delete: is_active = false)
  const deleteCategory = async (id: string) => {
    await supabase.from('categories').update({ is_active: false }).eq('id', id)
    await fetchCategories()
  }

  // Restore Category
  const restoreCategory = async (id: string) => {
    await supabase.from('categories').update({ is_active: true }).eq('id', id)
    await fetchCategories()
  }

  return {
    // State
    activeType,
    newName,
    editingId,
    editName,

    // Setters
    setActiveType,
    setNewName,
    setEditingId,
    setEditName,

    // Handlers
    addCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
  }
}
