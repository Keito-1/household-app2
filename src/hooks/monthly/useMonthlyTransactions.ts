import { useEffect, useState, useCallback } from 'react'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ui/use-toast'

import type { Transaction, TransactionType } from '@/types/transaction'
import type { User } from '@supabase/supabase-js'

/**
 * MonthlyPage 専用の取引データ管理フック
 * 状態管理: transactions, loading, editingId
 * Supabase操作: 追加・編集・削除
 * 月の変更で自動的に transactions を再取得
 */
export function useMonthlyTransactions(currentMonth: dayjs.Dayjs, user: User | null) {
  const router = useRouter()
  const { toast } = useToast()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  /**
   * 指定月の取引データを Supabase から取得
   * user が null の場合は /signin にリダイレクト
   */
  const fetchTransactions = useCallback(async () => {
    setLoading(true)

    if (!user) {
      router.push('/signin')
      setLoading(false)
      return
    }

    const start = currentMonth.startOf('month').format('YYYY-MM-DD')
    const end = currentMonth.endOf('month').format('YYYY-MM-DD')

    const { data } = await supabase
      .from('transactions')
      .select('*')
      .gte('date', start)
      .lte('date', end)
      .order('date')

    setTransactions((data ?? []) as Transaction[])
    setLoading(false)
  }, [user, currentMonth, router])

  /**
   * currentMonth または user 変更時に自動的に transactions を再取得
   */
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  /**
   * 新規取引を追加
   * @param selectedDate - 取引日付（YYYY-MM-DD）
   * @param categoryId - カテゴリID
   * @param amount - 金額
   * @param currency - 通貨コード
   * @param type - 取引タイプ (income | expense)
   */
  const handleAdd = useCallback(
    async (
      selectedDate: string,
      categoryId: string,
      amount: string,
      currency: string,
      type: TransactionType
    ) => {
      if (!categoryId || !amount) return
      if (!user) return

      await supabase.from('transactions').insert({
        user_id: user.id,
        date: selectedDate,
        category_id: categoryId,
        amount: Number(amount),
        currency: currency,
        type: type,
      })

      fetchTransactions()
    },
    [user, fetchTransactions]
  )

  /**
   * 既存取引を削除
   * @param id - 取引ID
   */
  const handleDelete = useCallback(
    async (id: string) => {
      await supabase.from('transactions').delete().eq('id', id)
      fetchTransactions()

      toast({
        description: '削除が完了しました。',
        variant: 'destructive',
      })
    },
    [fetchTransactions, toast]
  )

  /**
   * 既存取引を更新
   * @param id - 取引ID
   * @param categoryId - カテゴリID
   * @param amount - 金額
   * @param currency - 通貨コード
   * @param type - 取引タイプ (income | expense)
   */
  const handleUpdate = useCallback(
    async (
      id: string,
      categoryId: string,
      amount: string,
      currency: string,
      type: TransactionType
    ) => {
      if (!categoryId) return

      await supabase
        .from('transactions')
        .update({
          category_id: categoryId,
          amount: Number(amount),
          currency: currency,
          type: type,
        })
        .eq('id', id)

      setEditingId(null)
      fetchTransactions()

      toast({
        description: '編集内容が登録されました。',
      })
    },
    [fetchTransactions, toast]
  )

  return {
    transactions,
    loading,
    fetchTransactions,
    handleAdd,
    handleDelete,
    handleUpdate,
    editingId,
    setEditingId,
  }
}
