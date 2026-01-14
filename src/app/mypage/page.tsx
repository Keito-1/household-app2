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

export default function MyPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // add
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'income' | 'expense'>('expense')

  // edit
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  /* =====================
    Fetch
  ===================== */
  const fetchCategories = async () => {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return

    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', auth.user.id)
      .order('sort_order')

    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  /* =====================
     Add
  ===================== */
  const handleAdd = async () => {
    if (!newName) return

    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) return

    await supabase.from('categories').insert({
      user_id: auth.user.id,
      name: newName,
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

              <Button onClick={handleAdd}>追加</Button>
            </div>
          </div>

          <Separator />

          {/* List */}
          {categories.filter((c) => c.is_active).length === 0 ? (
            <p className="text-sm text-gray-500">
              まだカテゴリがありません。追加してください。
            </p>
          ) : (
            <div className="space-y-2">
              {categories
                .filter((c) => c.is_active)
                .map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    {editingId === c.id ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    ) : (
                      <div>
                        <div className="text-sm font-medium">{c.name}</div>
                        <div className="text-xs text-gray-500">
                          {c.type === 'expense' ? '支出' : '収入'}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {editingId === c.id ? (
                        <>
                          <Button size="sm" onClick={handleUpdate}>
                            保存
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null)
                              setEditName('')
                            }}
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
                          >
                            編集
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(c.id)}
                          >
                            削除
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
