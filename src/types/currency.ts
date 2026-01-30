// src/types/currency.ts

export const CURRENCIES = [
  'JPY',
  'USD',
  'AUD',
  'EUR',
  'GBP',
  'CAD',
  'NZD',
  'PHP',
] as const

export type Currency = typeof CURRENCIES[number]

// 「全通貨（JPY換算）」用
export const ALL_JPY = 'ALL_JPY' as const
export type CurrencyTab = Currency | typeof ALL_JPY
