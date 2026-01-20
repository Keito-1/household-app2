'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAuthGuard } from '@/hooks/useAuthGuard'

type Props = {
  children: ReactNode
}

export default function ReportLayout({ children }: Props) {
  // 未ログインなら /signin に飛ばす（副作用のみ）
  useAuthGuard()

  // 認証状態の取得（値はここから）
  const { loading } = useAuth()

  // 認証確認中は描画しない
  if (loading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}
