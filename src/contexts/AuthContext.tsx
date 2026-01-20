'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
