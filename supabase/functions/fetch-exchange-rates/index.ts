import { serve } from 'https://deno.land/std/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const today = new Date().toISOString().slice(0, 10)

    const res = await fetch(
      'https://api.frankfurter.app/latest?from=JPY&to=AUD,USD,EUR,GBP,CAD,NZD,PHP'
    )

    if (!res.ok) {
      throw new Error('Failed to fetch exchange rates')
    }

    const json = await res.json()

    if (!json || !json.rates) {
      console.error('Exchange API response invalid', json)
      return new Response(
        JSON.stringify({ success: false }),
        { status: 200 } // ← あえて200
      )
    }
  
    const rates = json.rates as Record<string, number>

  const payload = Object.entries(rates).map(([currency, rate]) => ({
    base_currency: 'JPY',
    target_currency: currency,
    rate,
    rate_date: today,
    source: 'frankfurter',
  }))

  const { error } = await supabase
    .from('exchange_rates')
    .upsert(payload, {
      onConflict: 'base_currency,target_currency,rate_date',
    })

  if (error) {
    throw error
  }

  return new Response(
    JSON.stringify({ success: true, date: today, rates }),
    { status: 200 }
  )
} catch (err) {
  return new Response(
    JSON.stringify({
      success: false,
      error: String(err),
    }),
    { status: 500 }
  )
}
})
