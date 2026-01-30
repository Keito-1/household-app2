'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useAuth } from '@/contexts/AuthContext'
import { CURRENCIES } from '@/types/currency'

import type { Category } from '@/types/category'
import type { MyPageView } from '@/types/mypage'
import type { RecurringTransaction } from '@/types/recurring'


const DEFAULT_CATEGORIES: Pick<Category, 'name' | 'type'>[] = [
  { name: '食費', type: 'expense' },
  { name: '家賃', type: 'expense' },
  { name: '交通費', type: 'expense' },
  { name: '給料', type: 'income' },
  { name: 'その他収入', type: 'income' },
]

export default function MyPage() {
  const { user, categories, fetchCategories } = useAuth()

  const [view, setView] = useState<MyPageView>('categories')
  const [activeType, setActiveType] = useState<Category['type']>('expense')

  const [newName, setNewName] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [deleteRecurringTargetId, setDeleteRecurringTargetId] = useState<string | null>(null)

  const [recurringList, setRecurringList] = useState<RecurringTransaction[]>([])
  const [recurringLoading, setRecurringLoading] = useState(false)

  const [newRecurringType, setNewRecurringType] = useState<'income' | 'expense'>('income')
  const [newRecurringAmount, setNewRecurringAmount] = useState('')
  const [newRecurringCurrency, setNewRecurringCurrency] = useState('JPY')
  const [newRecurringCategoryId, setNewRecurringCategoryId] = useState<string | null>(null)
  const [editRecurringCategoryId, setEditRecurringCategoryId] = useState<string | null>(null)

  const [newRecurringCycle, setNewRecurringCycle] = useState<'monthly' | 'weekly'>('monthly')
  const [newRecurringDayOfMonth, setNewRecurringDayOfMonth] = useState(1)
  const [newRecurringDayOfWeek, setNewRecurringDayOfWeek] = useState(0)

  const [editingRecurringId, setEditingRecurringId] = useState<string | null>(null)
  const [editRecurringType, setEditRecurringType] = useState<'income' | 'expense'>('income')
  const [editRecurringAmount, setEditRecurringAmount] = useState('')
  const [editRecurringCurrency, setEditRecurringCurrency] = useState('JPY')
  const [editRecurringCycle, setEditRecurringCycle] = useState<'monthly' | 'weekly'>('monthly')
  const [editRecurringDayOfMonth, setEditRecurringDayOfMonth] = useState(1)
  const [editRecurringDayOfWeek, setEditRecurringDayOfWeek] = useState(0)

  // Handlers
  const handleAdd = async () => {
    const trimmed = newName.trim()
    if (!trimmed) return

    const exists = categories.some(
      (c) => c.name === trimmed && c.type === activeType
    )
    if (exists) {
      alert('同じ名前のカテゴリは既に存在します')
      return
    }

    if (!user) return

    await supabase.from('categories').insert({
      user_id: user.id,
      name: trimmed,
      type: activeType,
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

  // Toggle Recurring
  const handleToggleRecurring = async (id: string, current: boolean) => {
    await supabase
      .from('recurring_transactions')
      .update({ is_active: !current })
      .eq('id', id)

    setRecurringList((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, is_active: !current } : r
      )
    )
  }

  // Add Recurring
  const handleAddRecurring = async () => {
    if (!user) return
    const amount = Number(newRecurringAmount)
    if (!amount || amount <= 0) return

    const payload: any = {
      user_id: user.id,
      type: newRecurringType,
      amount,
      currency: newRecurringCurrency,
      cycle: newRecurringCycle,
      start_date: new Date().toISOString().slice(0, 10),
      is_active: true,
      category_id: newRecurringCategoryId,
    }

    if (newRecurringCycle === 'monthly') {
      payload.day_of_month = newRecurringDayOfMonth
    } else {
      payload.day_of_week = newRecurringDayOfWeek
    }

    const { data, error } = await supabase
      .from('recurring_transactions')
      .insert(payload)
      .select()
      .single()

    if (error) return

    setRecurringList((prev) => [data, ...prev])

    // フォーム初期化
    setNewRecurringAmount('')
    setNewRecurringCategoryId(null)
  }

  // Delete Recurring
  const handleDeleteRecurring = async (id: string) => {
    await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id)

    setRecurringList((prev) => prev.filter((r) => r.id !== id))
  }

  const startEditRecurring = (r: RecurringTransaction) => {
    setEditRecurringCategoryId(r.category_id ?? null)
    setEditingRecurringId(r.id)
    setEditRecurringType(r.type)
    setEditRecurringAmount(String(r.amount))
    setEditRecurringCurrency(r.currency)
    setEditRecurringCycle(r.cycle)
    setEditRecurringDayOfMonth(r.day_of_month ?? 1)
    setEditRecurringDayOfWeek(r.day_of_week ?? 0)
  }

  const handleUpdateRecurring = async (id: string) => {
    const amount = Number(editRecurringAmount)
    if (!amount || amount <= 0) return

    const payload: any = {
      type: editRecurringType,
      amount,
      currency: editRecurringCurrency,
      cycle: editRecurringCycle,
      category_id: editRecurringCategoryId,
    }

    if (editRecurringCycle === 'monthly') {
      payload.day_of_month = editRecurringDayOfMonth
      payload.day_of_week = null
    } else {
      payload.day_of_week = editRecurringDayOfWeek
      payload.day_of_month = null
    }

    const { data, error } = await supabase
      .from('recurring_transactions')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) return

    setRecurringList((prev) => prev.map((r) => (r.id === id ? data : r)))
    setEditingRecurringId(null)
  }

  // Profile
  useEffect(() => {
    if (view !== 'profile') return

    if (!user) return

    setEmail(user.email ?? '')
    setDisplayName(user.user_metadata?.name ?? '')
  }, [view, user])

  // Recurring
  useEffect(() => {
    if (view !== 'recurring') return

    const fetchRecurring = async () => {
      setRecurringLoading(true)

      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setRecurringList(data)
      }

      setRecurringLoading(false)
    }

    fetchRecurring()
  }, [view])

  return (
    <main className="p-4">
      <h1 className="mb-6 text-xl font-semibold text-center">マイページ</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className="w-48 shrink-0 space-y-2 bg-gray-100 p-4 shadow">
          {(['categories', 'inactive', 'recurring', 'profile'] as MyPageView[]).map((v) => (
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
                  : v === 'recurring'
                    ? '連続収支設定'
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

                <Button
                  onClick={handleAdd}
                  className="border border-green-400 text-green-600 hover:bg-green-500 hover:text-white"
                >
                  追加
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="mb-4 flex">
                {(['expense', 'income'] as Category['type'][]).map((t) => (
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
                            <Button
                              size="sm"
                              onClick={() => handleUpdate(c.id)}
                              className='border-green-400 text-green-600 hover:bg-green-500 hover:text-white'
                            >
                              保存
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                              className='border-red-400 text-red-600 hover:bg-red-500 hover:text-white'
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
                {(['expense', 'income'] as Category['type'][]).map((t) => (
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

          {/* ===== Recurring ===== */}
          {view === 'recurring' && (
            <>
              <h2 className="mb-4 font-semibold text-lg">連続収支設定</h2>

              <p className="text-sm text-gray-600 mb-4">
                毎月・毎週など、定期的に自動登録したい収支を設定できます。
              </p>

              <div className="mb-6 rounded border bg-white p-4 shadow-sm space-y-4">
                <h3 className="font-medium text-gray-600">連続収支を追加</h3>

                <div className="flex gap-2">
                  <select
                    value={newRecurringType}
                    onChange={(e) =>
                      setNewRecurringType(e.target.value as 'income' | 'expense')
                    }
                    className="border rounded px-2 py-1"
                  >
                    <option value="income">収入</option>
                    <option value="expense">支出</option>
                  </select>

                  <input
                    placeholder="金額"
                    value={newRecurringAmount}
                    onChange={(e) => setNewRecurringAmount(e.target.value)}
                    className="border rounded px-2 py-1 w-32"
                  />

                  <select
                    value={newRecurringCurrency}
                    onChange={(e) => setNewRecurringCurrency(e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2">
                  <select
                    value={newRecurringCycle}
                    onChange={(e) =>
                      setNewRecurringCycle(e.target.value as 'monthly' | 'weekly')
                    }
                    className="border rounded px-2 py-1"
                  >
                    <option value="monthly">毎月</option>
                    <option value="weekly">毎週</option>
                  </select>

                  {newRecurringCycle === 'monthly' ? (
                    <input
                      min={1}
                      max={31}
                      value={newRecurringDayOfMonth}
                      onChange={(e) =>
                        setNewRecurringDayOfMonth(Number(e.target.value))
                      }
                      className="border rounded px-2 py-1 w-24"
                    />
                  ) : (
                    <select
                      value={newRecurringDayOfWeek}
                      onChange={(e) =>
                        setNewRecurringDayOfWeek(Number(e.target.value))
                      }
                      className="border rounded px-2 py-1"
                    >
                      {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
                        <option key={i} value={i}>{d}</option>
                      ))}
                    </select>
                  )}

                  <select
                    value={newRecurringCategoryId ?? ''}
                    onChange={(e) =>
                      setNewRecurringCategoryId(e.target.value || null)
                    }
                    className="border rounded px-2 py-1"
                  >
                    <option value="">カテゴリなし</option>

                    {categories
                      .filter(
                        (c) =>
                          c.is_active &&
                          c.type === newRecurringType
                      )
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>

                </div>

                <button
                  onClick={handleAddRecurring}
                  className="rounded px-4 py-1.5 text-sm border border-green-400 text-green-600 hover:bg-green-500 hover:text-white"
                >
                  追加
                </button>
              </div>

              <div className="rounded border bg-gray-50 p-4 text-sm text-gray-500">
                {recurringLoading ? (
                  <p className="text-sm text-gray-500">読み込み中...</p>
                ) : recurringList.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    まだ連続収支は登録されていません。
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recurringList.map((r) => (
                      <div
                        key={r.id}
                        className="rounded border bg-white p-4 shadow-sm"
                      >
                        {editingRecurringId === r.id ? (
                          // ===== 編集モード =====
                          <div className="space-y-3">
                            <h2 className='text-lg font-semibold text-black'>編集画面</h2>
                            <div className="flex gap-2">
                              <select
                                value={editRecurringType}
                                onChange={(e) => {
                                  const nextType = e.target.value as 'income' | 'expense'
                                  setEditRecurringType(nextType)
                                  setEditRecurringCategoryId(null)
                                }}
                                className="border rounded px-2 py-1"
                              >
                                <option value="income">収入</option>
                                <option value="expense">支出</option>
                              </select>

                              <input
                                value={editRecurringAmount}
                                onChange={(e) => setEditRecurringAmount(e.target.value)}
                                className="border rounded px-2 py-1 w-32"
                                placeholder="金額"
                              />

                              <select
                                value={editRecurringCurrency}
                                onChange={(e) => setEditRecurringCurrency(e.target.value)}
                                className="border rounded px-2 py-1"
                              >
                                {CURRENCIES.map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>

                            <div className="flex gap-2">
                              <select
                                value={editRecurringCycle}
                                onChange={(e) =>
                                  setEditRecurringCycle(e.target.value as 'monthly' | 'weekly')
                                }
                                className="border rounded px-2 py-1"
                              >
                                <option value="monthly">毎月</option>
                                <option value="weekly">毎週</option>
                              </select>

                              {editRecurringCycle === 'monthly' ? (
                                <input
                                  min={1}
                                  max={31}
                                  value={editRecurringDayOfMonth}
                                  onChange={(e) =>
                                    setEditRecurringDayOfMonth(Number(e.target.value))
                                  }
                                  className="border rounded px-2 py-1 w-24"
                                />
                              ) : (
                                <select
                                  value={editRecurringDayOfWeek}
                                  onChange={(e) =>
                                    setEditRecurringDayOfWeek(Number(e.target.value))
                                  }
                                  className="border rounded px-2 py-1"
                                >
                                  {['日', '月', '火', '水', '木', '金', '土'].map((d, i) => (
                                    <option key={i} value={i}>{d}</option>
                                  ))}
                                </select>
                              )}
                              <select
                                value={editRecurringCategoryId ?? ''}
                                onChange={(e) =>
                                  setEditRecurringCategoryId(e.target.value || null)
                                }
                                className="border rounded px-2 py-1"
                              >
                                <option value="">カテゴリなし</option>
                                {categories
                                  .filter((c) => c.is_active && c.type === editRecurringType)
                                  .map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                              </select>

                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleUpdateRecurring(r.id)}
                                className="rounded px-4 py-1.5 text-sm border border-green-400 text-green-600 hover:bg-green-500 hover:text-white"
                              >
                                保存
                              </button>
                              <button
                                onClick={() => {
                                  setEditingRecurringId(null);
                                  setEditRecurringCategoryId(null);
                                }}
                                className="rounded px-4 py-1.5 text-sm border border-red-400 text-red-600 hover:bg-red-500 hover:text-white"
                              >
                                キャンセル
                              </button>
                            </div>
                          </div>
                        ) : (
                          // ===== 表示モード =====
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">
                                {r.type === 'income' ? '収入' : '支出'}
                                {r.amount.toLocaleString()} {r.currency}
                              </p>
                              <p className="text-sm text-gray-500">
                                {r.cycle === 'monthly'
                                  ? `毎月 ${r.day_of_month} 日`
                                  : `毎週 ${['日', '月', '火', '水', '木', '金', '土'][r.day_of_week ?? 0]}`}
                              </p>
                              <p className="text-sm text-gray-500">
                                カテゴリ：
                                {r.category_id
                                  ? categories.find((c) => c.id === r.category_id)?.name ?? '不明'
                                  : '未設定'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEditRecurring(r)}
                                className="text-xs px-2 py-1 rounded transition border border-blue-400 text-blue-600 hover:bg-blue-500 hover:text-white"
                              >
                                編集
                              </button>

                              <button
                                onClick={() => handleToggleRecurring(r.id, r.is_active)}
                                className={`text-xs px-2 py-1 rounded transition
                                ${r.is_active
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                                  }`}
                              >
                                {r.is_active ? 'ON' : 'OFF'}
                              </button>

                              <button
                                onClick={() => setDeleteRecurringTargetId(r.id)}
                                className="text-xs px-2 py-1 rounded transition border border-red-400 text-red-600 hover:bg-red-500 hover:text-white"
                              >
                                削除
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
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
                className="border-green-400 text-green-600 hover:bg-green-500 hover:text-white"
              >
                保存
              </Button>
            </>
          )}

        </section>
      </div>
      <ConfirmDialog
        open={deleteRecurringTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteRecurringTargetId(null)
        }}
        title="連続収支の削除"
        description="この連続収支を完全に削除してもよろしいですか？（元に戻せません）"
        onConfirm={async () => {
          if (!deleteRecurringTargetId) return
          await handleDeleteRecurring(deleteRecurringTargetId)
          setDeleteRecurringTargetId(null)
        }}
      />
    </main>
  )
}