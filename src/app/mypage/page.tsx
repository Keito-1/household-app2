'use client'

import { useState } from 'react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useAuth } from '@/contexts/AuthContext'
import { useCategories } from '@/hooks/mypage/useCategories'
import { useProfile } from '@/hooks/mypage/useProfile'
import { Sidebar } from './components/Sidebar'
import { CategoryList } from './components/CategoryList'
import { InactiveCategoryList } from './components/InactiveCategoryList'
import { RecurringList } from './components/RecurringList'
import { ProfileSection } from './components/ProfileSection'
import { RecurringDeleteDialog } from './components/RecurringDeleteDialog'
import { RecurringProvider } from '@/contexts/RecurringContext'

import type { MyPageView } from '@/types/mypage'

export default function MyPage() {
  const { user, categories, fetchCategories } = useAuth()

  const [view, setView] = useState<MyPageView>('categories')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // ===== Categories =====
  const {
    activeType,
    newName,
    editingId,
    editName,
    setActiveType,
    setNewName,
    setEditingId,
    setEditName,
    addCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
  } = useCategories(user, categories, fetchCategories)

  // ===== Profile =====
  const { email, displayName, setDisplayName, saveProfile } =
    useProfile(user)

  return (
    <main className="p-4">
      <h1 className="mb-6 text-xl font-semibold text-center">
        マイページ
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        <Sidebar view={view} setView={setView} />

        <section className="flex-1 bg-white p-4 shadow min-h-screen">
          <RecurringProvider>
            {/* ===== Categories ===== */}
            {view === 'categories' && (
              <CategoryList
                categories={categories}
                activeType={activeType}
                onTypeChange={setActiveType}
                newName={newName}
                onNewNameChange={setNewName}
                onAdd={addCategory}
                editingId={editingId}
                editName={editName}
                onEditNameChange={setEditName}
                onStartEdit={(categoryId, name) => {
                  setEditingId(categoryId)
                  setEditName(name)
                }}
                onSave={updateCategory}
                onCancel={() => setEditingId(null)}
                onDelete={(categoryId) =>
                  setDeleteTargetId(categoryId)
                }
              />
            )}

            {/* ===== Inactive ===== */}
            {view === 'inactive' && (
              <InactiveCategoryList
                categories={categories}
                activeType={activeType}
                onTypeChange={setActiveType}
                onRestore={restoreCategory}
              />
            )}

            {/* ===== Recurring ===== */}
            {view === 'recurring' && (
              <>
                <RecurringList />
                <RecurringDeleteDialog />
              </>
            )}

            {/* ===== Profile ===== */}
            {view === 'profile' && (
              <ProfileSection
                email={email}
                displayName={displayName}
                onDisplayNameChange={setDisplayName}
                onSave={saveProfile}
              />
            )}
          </RecurringProvider>
        </section>
      </div>

      {/* ===== Category Delete Confirm ===== */}
      <ConfirmDialog
        open={!!deleteTargetId}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null)
        }}
        title="削除確認"
        description="本当に削除しますか？"
        onConfirm={() => {
          if (deleteTargetId) {
            deleteCategory(deleteTargetId)
            setDeleteTargetId(null)
          }
        }}
      />
    </main>
  )
}
