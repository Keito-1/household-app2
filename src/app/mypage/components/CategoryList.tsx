'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CategoryItem } from './CategoryItem'

import type { Category } from '@/types/category'

type Props = {
  categories: Category[]
  activeType: Category['type']
  onTypeChange: (type: Category['type']) => void
  newName: string
  onNewNameChange: (value: string) => void
  onAdd: () => void
  editingId: string | null
  editName: string
  onEditNameChange: (value: string) => void
  onStartEdit: (categoryId: string, name: string) => void
  onSave: (categoryId: string) => void
  onCancel: () => void
  onDelete: (categoryId: string) => void
}

export function CategoryList({
  categories,
  activeType,
  onTypeChange,
  newName,
  onNewNameChange,
  onAdd,
  editingId,
  editName,
  onEditNameChange,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
}: Props) {
  return (
    <>
      <h2 className="mb-2 font-semibold">カテゴリ管理</h2>

      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="カテゴリ名"
          value={newName}
          className="w-full sm:w-auto"
          onChange={(e) => onNewNameChange(e.target.value)}
        />

        <Button
          onClick={onAdd}
          className="w-full sm:w-auto border border-green-400 text-green-600 hover:bg-green-500 hover:text-white"
        >
          追加
        </Button>
      </div>

      <Separator className="my-4" />

      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        {(['expense', 'income'] as Category['type'][]).map((t) => (
          <button
            key={t}
            onClick={() => onTypeChange(t)}
            className={`px-4 py-2 border
              ${activeType === t
                ? 'bg-gray-500 text-white'
                : 'bg-white text-black hover:bg-gray-500 hover:text-white'
              }`}
          >
            {t === 'expense' ? '支出' : '収入'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {categories
          .filter((c) => c.is_active && c.type === activeType)
          .map((c) => (
            <CategoryItem
              key={c.id}
              category={c}
              isEditing={editingId === c.id}
              editName={editName}
              onEditNameChange={onEditNameChange}
              onStartEdit={() => onStartEdit(c.id, c.name)}
              onSave={() => onSave(c.id)}
              onCancel={onCancel}
              onDelete={() => onDelete(c.id)}
            />
          ))}
      </div>
    </>
  )
}
