export type TxType = 'income' | 'expense'

export type JoinedCategory = {
  name: string
}

export type Transaction = {
  id: string
  user_id: string
  date: string

  category_id: string | null

  // 👇 JOIN 結果（Report / Yearly 用）
  category?: JoinedCategory

  amount: number
  currency: string
  type: TxType
  created_at?: string
}
