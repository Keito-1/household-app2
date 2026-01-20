'use client'

import * as React from 'react'

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastProps = {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

const listeners: ((state: ToastProps[]) => void)[] = []
let memoryState: ToastProps[] = []

function emitChange() {
  listeners.forEach((listener) => listener(memoryState))
}

export function toast(props: Omit<ToastProps, 'id'>) {
  const id = crypto.randomUUID()

  memoryState = [{ id, ...props }].slice(0, TOAST_LIMIT)
  emitChange()
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  React.useEffect(() => {
    listeners.push(setToasts)
    return () => {
      const index = listeners.indexOf(setToasts)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return { toast, toasts }
}
