'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function SigninPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* =====================
     Email / Password Login
  ===================== */
  const handleSignin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/monthly')
  }

  /* =====================
     Google Login
  ===================== */
  const handleGoogleSignin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://household-app2.vercel.app/monthly',
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-200 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg bg-white">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-semibold">
            Household Account App
          </CardTitle>
          <p className="text-sm text-gray-500">
            ログインしてください
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Signin Button */}
          <Button
            className="w-full border border-green-400 text-green-600 hover:bg-green-500 hover:text-white"
            onClick={handleSignin}
            disabled={loading}
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <div className="flex-1 h-px bg-gray-300" />
            OR
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Google Login Button */}
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 border border-orange-400 text-orange-600 hover:bg-orange-500 hover:text-white"
            onClick={handleGoogleSignin}
            disabled={loading}
          >
            {/* Google icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="h-5 w-5"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.1 0 5.8 1.1 7.9 3.1l5.9-5.9C34.2 3.1 29.5 1 24 1 14.6 1 6.5 6.8 2.9 15.1l6.9 5.3C11.5 14 17.3 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.1 24.5c0-1.7-.2-3.3-.5-4.9H24v9.3h12.4c-.5 2.8-2.1 5.2-4.5 6.8l6.9 5.3c4-3.7 6.3-9.1 6.3-15.5z"
              />
              <path
                fill="#FBBC05"
                d="M9.8 28.4c-.5-1.4-.8-2.9-.8-4.4s.3-3 .8-4.4l-6.9-5.3C1.1 17.3 0 20.6 0 24s1.1 6.7 2.9 9.7l6.9-5.3z"
              />
              <path
                fill="#34A853"
                d="M24 47c5.5 0 10.2-1.8 13.6-4.9l-6.9-5.3c-1.9 1.3-4.4 2.1-6.7 2.1-6.7 0-12.5-4.5-14.5-10.6l-6.9 5.3C6.5 41.2 14.6 47 24 47z"
              />
            </svg>
            Googleでログイン
          </Button>

          {/* Signup Link */}
          <div className="text-center text-sm text-gray-600">
            アカウントをお持ちでない方は{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-blue-600 hover:underline"
            >
              新規登録
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
