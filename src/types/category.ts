export type CategoryType = 'income' | 'expense'

export type Category = {
  id: string
  user_id: string
  name: string
  type: CategoryType
  sort_order: number
  is_active: boolean
}
