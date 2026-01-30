import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const CURRENCIES = ['AUD', 'USD', 'EUR', 'GBP', 'CAD', 'NZD', 'PHP']

serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // バックフィル対象期間
    const START_DATE = '2026-01-01'
    const END_DATE = '2026-01-20'

    const url =
      `https://api.frankfurter.app/${START_DATE}..${END_DATE}` +
      `?from=JPY&to=${CURRENCIES.join(',')}`

    console.log('BACKFILL URL:', url)

    const res = await fetch(url)
    if (!res.ok) {
      throw new Error('Failed to fetch exchange rates')
    }

    const json = await res.json()

    /**
     * json.rates の形：
     * {
     *   "2026-01-04": { "USD": 0.0063, "AUD": 0.0092, ... },
     *   "2026-01-05": { ... }
     * }
     */
    const ratesByDate = json.rates

    for (const [rateDate, rates] of Object.entries(ratesByDate)) {
      const rows = Object.entries(rates as Record<string, number>).map(
        ([currency, rate]) => ({
          base_currency: 'JPY',
          target_currency: currency,
          rate,
          rate_date: rateDate,   // ★ API が返した営業日
          source: 'frankfurter',
        })
      )

      const { error } = await supabase
        .from('exchange_rates')
        .upsert(rows, {
          onConflict: 'base_currency,target_currency,rate_date',
        })

      if (error) {
        console.error('upsert error:', error)
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200 }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500 }
    )
  }
})
