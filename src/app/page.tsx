'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (loading) return;

    if(user){
      router.replace('/monthly');
    } else {
      router.replace('/signin');
    }
  }, [user, loading, router]);

  return null;
}

