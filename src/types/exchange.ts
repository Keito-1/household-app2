import type { Currency } from './currency'

export interface ExchangeRate {
  id: string
  date: string          // YYYY-MM-DD
  base_currency: 'JPY'
  currency: Currency
  rate: number
}

export interface ExchangeMeta {
  rate_date: string
  requested_date: string
}
