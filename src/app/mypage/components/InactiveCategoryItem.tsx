'use client'

import { Button } from '@/components/ui/button'

import type { Category } from '@/types/category'

type Props = {
  category: Category
  onRestore: () => void
}

export function InactiveCategoryItem({ category, onRestore }: Props) {
  return (
    <div className="flex items-center justify-between rounded border p-2 bg-gray-50">
      <span>{category.name}</span>
      <Button
        size="sm"
        onClick={onRestore}
        className="border border-green-200 text-green-500 hover:bg-green-500 hover:text-white"
      >
        復活
      </Button>
    </div>
  )
}
