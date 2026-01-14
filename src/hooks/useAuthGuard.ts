'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export const useAuthGuard = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.replace('/signin')
        return
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  return { loading }
}
