'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type Props = {
  email: string
  displayName: string
  onDisplayNameChange: (value: string) => void
  onSave: () => void
}

export function ProfileSection({
  email,
  displayName,
  onDisplayNameChange,
  onSave,
}: Props) {
  return (
    <>
      <h2 className="mb-4 font-semibold">ユーザー情報</h2>

      <div className="mb-3">
        <label className="block text-sm">メール</label>
        <Input value={email} disabled />
      </div>

      <div className="mb-3">
        <label className="block text-sm">表示名</label>
        <Input
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
        />
      </div>

      <Button
        onClick={onSave}
        className="border-green-400 text-green-600 hover:bg-green-500 hover:text-white"
      >
        保存
      </Button>
    </>
  )
}
