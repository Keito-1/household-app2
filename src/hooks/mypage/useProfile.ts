'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

import type { User } from '@supabase/supabase-js'

type UseProfileReturn = {
  email: string
  displayName: string
  setDisplayName: (v: string) => void
  initializeProfile: (u: User | null) => void
  saveProfile: () => Promise<void>
}

export function useProfile(user: User | null): UseProfileReturn {
  const [email, setEmail] = useState<string>('')
  const [displayName, setDisplayName] = useState<string>('')

  const initializeProfile = useCallback((u: User | null) => {
    if (!u) {
      setEmail('')
      setDisplayName('')
      return
    }

    setEmail(u.email ?? '')
    // supabase stores name under user_metadata?.name
    // guard in case user_metadata is undefined
    // @ts-ignore - user_metadata typing may be unknown
    setDisplayName(u.user_metadata?.name ?? '')
  }, [])

  useEffect(() => {
    initializeProfile(user)
  }, [user, initializeProfile])

  const saveProfile = useCallback(async () => {
    try {
      await supabase.auth.updateUser({ data: { name: displayName } })
      alert('更新しました')
    } catch (err) {
      console.error(err)
      alert('更新に失敗しました')
    }
  }, [displayName])

  return {
    email,
    displayName,
    setDisplayName,
    initializeProfile,
    saveProfile,
  }
}
