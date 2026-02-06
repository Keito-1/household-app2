'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import type { Category } from '@/types/category'

type Props = {
  category: Category
  isEditing: boolean
  editName: string
  onEditNameChange: (value: string) => void
  onStartEdit: () => void
  onSave: () => void
  onCancel: () => void
  onDelete: () => void
}

export function CategoryItem({
  category,
  isEditing,
  editName,
  onEditNameChange,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-gray-200 p-2">
      {isEditing ? (
        <Input
          value={editName}
          onChange={(e) => onEditNameChange(e.target.value)}
        />
      ) : (
        <span>{category.name}</span>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        {isEditing ? (
          <>
            <Button
              size="sm"
              onClick={onSave}
              className='border-green-400 text-green-600 hover:bg-green-500 hover:text-white'
            >
              保存
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              className='flex flex-wrap gap-2 border-red-400 text-red-600 hover:bg-red-500 hover:text-white'
            >
              キャンセル
            </Button>
          </>
        ) : (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={onStartEdit}
              className='border-blue-400 text-blue-600 hover:bg-blue-500 hover:text-white'
            >
              編集
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="border-red-400 text-red-600 hover:bg-red-500 hover:text-white"
            >
              削除
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
