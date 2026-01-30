import type { TransactionType } from './transaction'

export interface Category {
  id: string
  user_id: string
  name: string
  type: TransactionType
}
