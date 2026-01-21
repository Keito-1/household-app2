'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useAuth } from '@/contexts/AuthContext'

import type { Category } from '@/types/category'

type CategoryType = 'expense' | 'income'

type MyPageView = 'categories' | 'inactive' | 'profile'

const DEFAULT_CATEGORIES = [
  { name: '食費', type: 'expense' as const },
  { name: '家賃', type: 'expense' as const },
  { name: '交通費', type: 'expense' as const },
  { name: '給料', type: 'income' as const },
  { name: 'その他収入', type: 'income' as const },
]

export default function MyPage() {
  const { user, categories, fetchCategories } = useAuth()

  const [view, setView] = useState<MyPageView>('categories')
  const [activeType, setActiveType] = useState<CategoryType>('expense')

  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<CategoryType>('expense')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)


  /* =====================
    Profile
  ===================== */

  /* =====================
    Handlers
  ===================== */
  const handleAdd = async () => {
    const trimmed = newName.trim()
    if (!trimmed) return

    const exists = categories.some(
      (c) => c.name === trimmed && c.type === newType
    )
    if (exists) {
      alert('同じ名前のカテゴリは既に存在します')
      return
    }

    if (!user) return

    await supabase.from('categories').insert({
      user_id: user.id,
      name: trimmed,
      type: newType,
      sort_order: categories.length,
      is_active: true,
    })

    setNewName('')
    fetchCategories()
  }

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return

    await supabase.from('categories').update({ name: editName }).eq('id', id)

    setEditingId(null)
    setEditName('')
    fetchCategories()
  }

  const handleDelete = async (id: string) => {
    await supabase.from('categories').update({ is_active: false }).eq('id', id)
    fetchCategories()
  }

  const handleRestore = async (id: string) => {
    await supabase.from('categories').update({ is_active: true }).eq('id', id)
    fetchCategories()
  }

  /* =====================
    Profile
  ===================== */
  useEffect(() => {
    if (view !== 'profile') return

    if (!user) return

    setEmail(user.email ?? '')
    setDisplayName(user.user_metadata?.name ?? '')
  }, [view, user])

  return (
    <main className="p-4">
      <h1 className="mb-6 text-xl font-semibold text-center">マイページ</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-48 shrink-0 space-y-2 bg-gray-100 p-4 shadow">
          {(['categories', 'inactive', 'profile'] as MyPageView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`w-full rounded px-3 py-2 text-left transition
                ${view === v
                  ? 'bg-gray-500 text-white'
                  : 'bg-white text-black hover:bg-gray-500 hover:text-white'
                }`}
            >
              {v === 'categories'
                ? 'カテゴリ管理'
                : v === 'inactive'
                  ? '非表示カテゴリ'
                  : 'ユーザー情報'}
            </button>
          ))}
        </aside>

        {/* Main */}
        <section className="flex-1 bg-white p-4 shadow min-h-screen">
          {/* ===== Categories ===== */}
          {view === 'categories' && (
            <>
              <h2 className="mb-2 font-semibold">カテゴリ管理</h2>

              <div className="mb-4 flex gap-2 items-center">
                <Input
                  placeholder="カテゴリ名"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />

                <div className="flex shrink-0 rounded overflow-hidden border">
                  {(['expense', 'income'] as CategoryType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewType(t)}
                      className={`px-4 py-2 text-sm transition
                        ${newType === t
                          ? 'bg-gray-500 text-white'
                          : 'bg-white text-black hover:bg-gray-500 hover:text-white'
                        }`}
                    >
                      {t === 'expense' ? '支出' : '収入'}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleAdd}
                  className="border-green-400 text-green-600 hover:bg-green-500 hover:text-white"
                >
                  追加
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="mb-4 flex">
                {(['expense', 'income'] as CategoryType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveType(t)}
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
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded border p-2"
                    >
                      {editingId === c.id ? (
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : (
                        <span>{c.name}</span>
                      )}

                      <div className="flex gap-2">
                        {editingId === c.id ? (
                          <>
                            <Button size="sm" onClick={() => handleUpdate(c.id)}>
                              保存
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              キャンセル
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingId(c.id)
                                setEditName(c.name)
                              }}
                              className='border-blue-400 text-blue-600 hover:bg-blue-500 hover:text-white'
                            >
                              編集
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteTargetId(c.id)}
                              className="border-red-400 text-red-600 hover:bg-red-500 hover:text-white"
                            >
                              削除
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* ===== Inactive ===== */}
          {view === 'inactive' && (
            <>
              <h2 className="mb-4 font-semibold">非表示カテゴリ</h2>

              {/* 支出 / 収入 切り替え */}
              <div className="mb-4 flex">
                {(['expense', 'income'] as CategoryType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveType(t)}
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
                {categories.filter(
                  (c) => !c.is_active && c.type === activeType
                ).length === 0 ? (
                  <p className="text-sm text-gray-500">
                    非表示のカテゴリはありません。
                  </p>
                ) : (
                  categories
                    .filter((c) => !c.is_active && c.type === activeType)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded border p-2 bg-gray-50"
                      >
                        <span>{c.name}</span>
                        <Button
                          size="sm"
                          onClick={() => handleRestore(c.id)}
                          className="border border-green-200 text-green-500 hover:bg-green-500 hover:text-white"
                        >
                          復活
                        </Button>
                      </div>
                    ))
                )}
              </div>
            </>
          )}

          {/* ===== Profile ===== */}
          {view === 'profile' && (
            <>
              <h2 className="mb-4 font-semibold">ユーザー情報</h2>

              <div className="mb-3">
                <label className="block text-sm">メール</label>
                <Input value={email} disabled />
              </div>

              <div className="mb-3">
                <label className="block text-sm">表示名</label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>

              <Button
                onClick={async () => {
                  await supabase.auth.updateUser({
                    data: { name: displayName },
                  })
                  alert('更新しました')
                }}
                className='border-green-400 text-green-600 hover:bg-green-500 hover:text-white'
              >
                保存
              </Button>
            </>
          )}
        </section>
      </div>
      <ConfirmDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null)
        }}
        title="カテゴリ削除"
        description="本当にこのカテゴリを削除してもよろしいですか？"
        onConfirm={async () => {
          if (!deleteTargetId) return
          await handleDelete(deleteTargetId)
          setDeleteTargetId(null)
        }}
      />
    </main>
  )
}
