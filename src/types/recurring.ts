import type { Currency } from './currency'
import type { TransactionType } from './transaction'

export type RecurringCycle = 'monthly' | 'weekly'

export interface RecurringTransaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  currency: Currency
  category_id: string | null

  cycle: RecurringCycle
  day_of_month?: number
  day_of_week?: number

  start_date: string
  end_date?: string
  is_active: boolean
}
