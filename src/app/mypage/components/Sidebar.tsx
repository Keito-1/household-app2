'use client'

import type { MyPageView } from '@/types/mypage'

type Props = {
  view: MyPageView
  setView: (v: MyPageView) => void
}

export function Sidebar({ view, setView }: Props) {
  return (
    <aside className="w-48 shrink-0 space-y-2 bg-gray-100 p-4 shadow">
      {(['categories', 'inactive', 'recurring', 'profile'] as MyPageView[]).map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={`w-full rounded px-3 py-2 text-left transition
            ${view === v
              ? 'bg-gray-500 text-white'
              : 'bg-white text-black hover:bg-gray-500 hover:text-white'
            }`}
        >
          {v === 'categories'
            ? 'カテゴリ管理'
            : v === 'inactive'
              ? '非表示カテゴリ'
              : v === 'recurring'
                ? '連続収支設定'
                : 'ユーザー情報'}

        </button>
      ))}
    </aside>
  )
}
