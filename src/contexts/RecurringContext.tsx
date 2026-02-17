'use client'

import { createContext, useContext } from 'react'
import { useRecurring } from '@/hooks/mypage/useRecurring'
import { useAuth } from '@/contexts/AuthContext'

type RecurringContextType =
  ReturnType<typeof useRecurring> & {
    categories: ReturnType<typeof useAuth>['categories']
  }


const RecurringContext = createContext<RecurringContextType | null>(null)

export function RecurringProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, categories } = useAuth()
  const recurring = useRecurring(user)

  return (
    <RecurringContext.Provider
      value={{
        ...recurring,
        categories,
      }}
    >
      {children}
    </RecurringContext.Provider>
  )
}

export function useRecurringContext() {
  const context = useContext(RecurringContext)
  if (!context) {
    throw new Error('useRecurringContext must be used within RecurringProvider')
  }
  return context
}
