import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async () => {
  try {
    /* =====================
     * 0. Supabase client
     * ===================== */
    const supabaseUrl = Deno.env.get('PROJECT_URL')!
    const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY')!

    const supabase = createClient(supabaseUrl, supabaseKey)

    /* =====================
     * 1. 今日の日付（JST）
     * ===================== */
    const now = new Date()
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000)

    const today = jst.toISOString().slice(0, 10) // YYYY-MM-DD
    const todayDay = jst.getDate()                // 1 - 31
    const todayWeekday = jst.getDay()             // 0 - 6 (Sun-Sat)

    /* =====================
     * 2. 連続収支ルール取得
     * ===================== */
    const { data: recurrings, error } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('is_active', true)

    if (error) throw error

    let insertedCount = 0

    /* =====================
     * 3. 1件ずつチェック
     * ===================== */
    for (const r of recurrings ?? []) {
      // 開始日チェック
      if (today < r.start_date) continue
      if (r.end_date && today > r.end_date) continue

      let shouldApply = false

      // 月次
      if (r.cycle === 'monthly' && r.day_of_month === todayDay) {
        shouldApply = true
      }

      // 週次
      if (r.cycle === 'weekly' && r.day_of_week === todayWeekday) {
        shouldApply = true
      }

      if (!shouldApply) continue

      /* =====================
       * 4. 二重登録チェック
       * ===================== */
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('user_id', r.user_id)
        .eq('date', today)
        .eq('amount', r.amount)
        .eq('category_id', r.category_id ?? null)
        .limit(1)

      if (existing && existing.length > 0) continue

      /* =====================
       * 5. transactions に追加
       * ===================== */
      const { error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: r.user_id,
          date: today,
          amount: r.amount,
          currency: r.currency,
          type: r.type,
          category_id: r.category_id,
        })

      if (insertError) throw insertError

      insertedCount++
    }

    /* =====================
     * 6. 正常レスポンス
     * ===================== */
    return new Response(
      JSON.stringify({
        success: true,
        date: today,
        inserted: insertedCount,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500 }
    )
  }
})
