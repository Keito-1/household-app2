'use client'

import { ReactNode } from 'react'
import { useAuthGuard } from '@/hooks/useAuthGuard'
import Header from '@/components/header'

type Props = {
  children: ReactNode
}

export default function MyPageLayout({ children }: Props) {
  const { loading } = useAuthGuard()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="bg-gray-200 min-h-screen">
      <Header />
      {children}
    </div>
  )
}
