'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SignupPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    // メール認証後に signin へ
    router.push('/signin')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-200 px-4">
      <Card className="w-full max-w-md shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            新規登録
          </CardTitle>
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
              placeholder="6文字以上"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Button */}
          <Button
            className="w-full border border-green-400 text-green-600 hover:bg-green-500 hover:text-white"
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? '登録中...' : '新規登録'}
          </Button>

          {/* Link */}
          <p className="text-center text-sm text-gray-600">
            すでにアカウントをお持ちですか？
            <button
              onClick={() => router.push('/signin')}
              className="text-blue-600 hover:underline"
            >
              ログインはこちら
            </button>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
