'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function useAuthGuard() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 認証状態が確定してから判定
    if (!loading && !user) {
      router.push('/signin')
    }
  }, [loading, user, router])
}
