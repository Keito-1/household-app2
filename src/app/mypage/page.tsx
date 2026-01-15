'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { Category } from '@/types/category'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

export default function MyPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // add
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'income' | 'expense'>('expense')

  // edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  // tab
  const [activeType, setActiveType] = useState<'expense' | 'income'>('expense')

  const DEFAULT_CATEGORIES = [
    { name: '食費', type: 'expense' as const },
    { name: '家賃', type: 'expense' as const },
    { name: '交通費', type: 'expense' as const },
    { name: '給料', type: 'income' as const },
    { name: 'その他収入', type: 'income' as const },
  ]


  /* =====================
    Fetch
  ===================== */
  const fetchCategories = async () => {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('sort_order')

    // 🚫 StrictMode 対策
    if (!data || data.length === 0) {
      // もう一度存在確認（保険）
      const { count } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', auth.user.id)

      if (count === 0) {
        const inserts = DEFAULT_CATEGORIES.map((c, i) => ({
          user_id: auth.user.id,
          name: c.name,
          type: c.type,
          sort_order: i,
          is_active: true,
        }))

        await supabase.from('categories').insert(inserts)
      }

      // 再取得
      const { data: created } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', auth.user.id)
        .order('sort_order')

      setCategories(created ?? [])
      setLoading(false)
      return
    }

    setCategories(data)
    setLoading(false)
  }


  useEffect(() => {
    fetchCategories()
  }, [])

  /* =====================
     Add
  ===================== */
  const handleAdd = async () => {
    const trimmed = newName.trim()
    if (!trimmed) return

    // 🚫 重複チェック（削除済みも含む）
    const exists = categories.some(
      (c) =>
        c.name === trimmed &&
        c.type === newType
    )

    if (exists) {
      alert('同じ名前のカテゴリは既に存在します')
      return
    }

    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return

    await supabase.from('categories').insert({
      user_id: auth.user.id,
      name: trimmed,
      type: newType,
      sort_order: categories.length,
      is_active: true,
    })

    setNewName('')
    fetchCategories()
  }

  /* =====================
    Update
  ===================== */
  const handleUpdate = async () => {
    if (!editingId || !editName) return

    await supabase
      .from('categories')
      .update({ name: editName })
      .eq('id', editingId)

    setEditingId(null)
    setEditName('')
    fetchCategories()
  }

  /* =====================
    Delete（論理削除）
  ===================== */
  const handleDelete = async (id: string) => {
    await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id)

    fetchCategories()
  }

  /* =====================
    Restore（復活）
  ===================== */
  const handleRestore = async (id: string) => {
    await supabase
      .from('categories')
      .update({ is_active: true })
      .eq('id', id)

    fetchCategories()
  }


  if (loading) {
    return <p className="p-4">Loading...</p>
  }

  return (
    <main className="mx-auto max-w-3xl p-4 text-black">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle>カテゴリ管理</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Add */}
          <div className="space-y-2">
            <Label>新しいカテゴリ</Label>

            <div className="flex gap-2">
              <Input
                placeholder="カテゴリ名"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />

              <Select
                value={newType}
                onValueChange={(v) => setNewType(v as 'income' | 'expense')}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">支出</SelectItem>
                  <SelectItem value="income">収入</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handleAdd}
                className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
              >追加</Button>
            </div>
          </div>

          <Separator />

          {/* List */}
          <Tabs
            value={activeType}
            onValueChange={(v) => setActiveType(v as 'expense' | 'income')}
          >
            <TabsList>
              <TabsTrigger value="expense">支出</TabsTrigger>
              <TabsTrigger value="income">収入</TabsTrigger>
            </TabsList>

            <TabsContent value={activeType}>
              {categories.filter(
                (c) => c.is_active && c.type === activeType
              ).length === 0 ? (
                <p className="text-sm text-gray-500">
                  まだカテゴリがありません。
                </p>
              ) : (
                <div className="space-y-2">
                  {categories
                    .filter(
                      (c) => c.is_active && c.type === activeType
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        {/* 左：カテゴリ名 */}
                        {editingId === c.id ? (
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="mr-2"
                          />
                        ) : (
                          <span>{c.name}</span>
                        )}

                        {/* 右：操作ボタン */}
                        <div className="flex gap-2">
                          {editingId === c.id ? (
                            <>
                              <button
                                className=" px-3 text-sm font-medium whitespace-nowrap text-green-500 bg-green-50 border border-green-200 rounded hover:bg-green-100 active:bg-green-200 transition"
                                onClick={() => handleUpdate(c.id)}
                              >
                                保存
                              </button>
                              <button
                                className="px-3 py-1 text-sm font-medium whitespace-nowrap text-gray-600 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 active:bg-gray-200 transition"
                                onClick={() => setEditingId(null)}
                              >
                                キャンセル
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 active:bg-blue-200 transition"
                                onClick={() => {
                                  setEditingId(c.id)
                                  setEditName(c.name)
                                }}
                              >
                                編集
                              </button>
                              <button
                                className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded hover:bg-red-100 active:bg-red-200 transition"
                                onClick={() => handleDelete(c.id)}
                              >
                                削除
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          <Separator className="my-6" />
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">
              非表示カテゴリ
            </h3>

            {categories.filter(
              (c) => !c.is_active && c.type === activeType
            ).length === 0 ? (
              <p className="text-sm text-gray-500">
                非表示のカテゴリはありません。
              </p>
            ) : (
              <div className="space-y-2">
                {categories
                  .filter(
                    (c) => !c.is_active && c.type === activeType
                  )
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-md border p-2 bg-gray-50"
                    >
                      <span className="text-gray-600">{c.name}</span>

                      <button
                        className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 active:bg-blue-200 transition"
                        onClick={() => handleRestore(c.id)}
                      >
                        復活
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
