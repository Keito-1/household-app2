'use client'

import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useRecurringContext } from '@/contexts/RecurringContext'

export function RecurringDeleteDialog() {
  const {
    deleteRecurringTargetId,
    setDeleteRecurringTargetId,
    handleDeleteRecurring,
  } = useRecurringContext()

  return (
    <ConfirmDialog
      open={!!deleteRecurringTargetId}
      onOpenChange={(open) => {
        if (!open) setDeleteRecurringTargetId(null)
      }}
      title="削除確認"
      description="本当に削除しますか？"
      onConfirm={() => {
        if (deleteRecurringTargetId) {
          handleDeleteRecurring(deleteRecurringTargetId)
          setDeleteRecurringTargetId(null)
        }
      }}
    />
  )
}
