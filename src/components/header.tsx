'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import clsx from 'clsx'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'


const navItems = [
  { label: 'Monthly', href: '/monthly' },
  { label: 'Report', href: '/report' },
  { label: 'Yearly', href: '/yearly' },
  { label: 'mypage', href: '/mypage' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()

  // 認証状態確定前は何も描画しない（チラつき防止）
  if (loading) return null

    // サインイン・サインアップでは Header を出さない
  if (pathname === '/signin' || pathname === '/signup') {
    return null
  }

  const handleSignout = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  return (
    <header className="border-b bg-slate-300 shadow-sm">
      <div className="mx-auto flex flex-wrap sm:max-w-6xl items-center gap-6 px-6 py-4">
        {/* ロゴ */}
        <div className="sm:text-lg font-semibold flex-shrink-0">
          Household Account App
        </div>

        {/* ナビ（ログイン時のみ表示） */}
          {user && (
            <nav className="flex gap-4 flex-wrap flex-1 min-w-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'text-sm font-medium transition',
                    pathname === item.href
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-800'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* 右側 */}
          <div className="ml-auto flex items-center gap-4 flex-shrink-0">
            {user ? (
              <>
                <span className="text-sm text-gray-500">
                  ログイン中
                </span>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={handleSignout}
                >
                  ログアウト
                </Button>
              </>
            ) : (
              <Link
                href="/signin"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ログイン
              </Link>
            )}
          </div>

      </div>
    </header>
  )
}
