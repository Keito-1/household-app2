// src/types/transaction.ts

import type { Currency } from './currency'

export type TransactionType = 'income' | 'expense'

export type TxType = TransactionType

export interface Transaction {
  id: string
  user_id: string
  date: string          // YYYY-MM-DD
  amount: number
  currency: Currency
  type: TransactionType
  category_id: string | null
  // Optional JPY-converted amount and rate metadata (computed client-side)
  amount_jpy?: number
  used_rate_date?: string | null
}

export type ModalTransaction = Pick<
  Transaction,
  'id' | 'amount' | 'currency' | 'type' | 'category_id'
>

