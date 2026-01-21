'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import type { Category } from '@/types/category'

type AuthContextType = {
  user: User | null
  loading: boolean
  categories: Category[]
  fetchCategories: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  categories: [],
  fetchCategories: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])

  const fetchCategories = async () => {
    if (!user) return

    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order')

    if (!data || data.length === 0) {
      const { count } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (count === 0) {
        const DEFAULT_CATEGORIES = [
          { name: '食費', type: 'expense' as const },
          { name: '家賃', type: 'expense' as const },
          { name: '交通費', type: 'expense' as const },
          { name: '給料', type: 'income' as const },
          { name: 'その他収入', type: 'income' as const },
        ]
        await supabase.from('categories').insert(
          DEFAULT_CATEGORIES.map((c, i) => ({
            user_id: user.id,
            name: c.name,
            type: c.type,
            sort_order: i,
            is_active: true,
          }))
        )
      }

      const { data: created } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order')

      setCategories(created ?? [])
      return
    }

    setCategories(data)
  }

  useEffect(() => {
    // ① localStorage から即復元（高速）
    const cached = localStorage.getItem('auth_user')
    if (cached) {
      setUser(JSON.parse(cached))
    }

    // ② Supabase を正として再検証
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
      } else {
        setUser(null)
        localStorage.removeItem('auth_user')
      }
      setLoading(false)
    })

    // ③ ログイン・ログアウト同期
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        if (u) {
          localStorage.setItem('auth_user', JSON.stringify(u))
        } else {
          localStorage.removeItem('auth_user')
        }
        // ログイン時にcategoriesをフェッチ
        if (u) {
          fetchCategories()
        } else {
          setCategories([])
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // userが変わったらcategoriesをフェッチ
  useEffect(() => {
    if (user) {
      fetchCategories()
    } else {
      setCategories([])
    }
  }, [user])

  return (
    <AuthContext.Provider value={{ user, loading, categories, fetchCategories }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
