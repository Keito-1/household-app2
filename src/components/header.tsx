'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'

const navItems = [
  { label: 'Monthly', href: '/monthly' },
  { label: 'Report', href: '/report' },
  { label: 'Yearly', href: '/yearly' },
  { label: 'mypage', href: '/mypage' },
]

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignout = async () => {
    await supabase.auth.signOut()
    router.push('/signin')
  }

  return (
    <header className="border-b bg-slate-300 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        {/* ロゴ */}
        <div className="text-lg font-semibold">
          Household Account App
        </div>

        {/* ナビ */}
        <nav className="flex gap-4">
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

        {/* 右側 */}
        <div className="ml-auto flex items-center gap-4">
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
        </div>
      </div>
    </header>
  )
}
