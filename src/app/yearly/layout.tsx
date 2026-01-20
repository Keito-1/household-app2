'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthGuard } from '@/hooks/useAuthGuard'

type Props = {
  children: ReactNode
}

export default function ReportLayout({ children }: Props) {
  useAuthGuard()
  const { loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}
