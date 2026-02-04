'use client'

import { InactiveCategoryItem } from './InactiveCategoryItem'

import type { Category } from '@/types/category'

type Props = {
  categories: Category[]
  activeType: Category['type']
  onTypeChange: (type: Category['type']) => void
  onRestore: (categoryId: string) => void
}

export function InactiveCategoryList({
  categories,
  activeType,
  onTypeChange,
  onRestore,
}: Props) {
  const inactiveCategories = categories.filter(
    (c) => !c.is_active && c.type === activeType
  )

  return (
    <>
      <h2 className="mb-4 font-semibold">非表示カテゴリ</h2>

      {/* 支出 / 収入 切り替え */}
      <div className="mb-4 flex">
        {(['expense', 'income'] as Category['type'][]).map((t) => (
          <button
            key={t}
            onClick={() => onTypeChange(t)}
            className={`px-4 py-2 border transition
              ${activeType === t
                ? 'bg-gray-500 text-white'
                : 'bg-white text-black hover:bg-gray-500 hover:text-white'
              }`}
          >
            {t === 'expense' ? '支出' : '収入'}
          </button>
        ))}
      </div>

      {/* 非表示カテゴリ一覧 */}
      <div className="space-y-2">
        {inactiveCategories.length === 0 ? (
          <p className="text-sm text-gray-500">
            非表示のカテゴリはありません。
          </p>
        ) : (
          inactiveCategories.map((c) => (
            <InactiveCategoryItem
              key={c.id}
              category={c}
              onRestore={() => onRestore(c.id)}
            />
          ))
        )}
      </div>
    </>
  )
}
