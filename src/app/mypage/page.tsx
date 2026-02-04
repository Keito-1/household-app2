'use client'

import { useEffect, useState } from 'react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useAuth } from '@/contexts/AuthContext'
import { useCategories } from '@/hooks/mypage/useCategories'
import { useRecurring } from '@/hooks/mypage/useRecurring'
import { useProfile } from '@/hooks/mypage/useProfile'
import { Sidebar } from './components/Sidebar'
import { CategoryList } from './components/CategoryList'
import { InactiveCategoryList } from './components/InactiveCategoryList'
import { RecurringList } from './components/RecurringList'
import { ProfileSection } from './components/ProfileSection'

import type { MyPageView } from '@/types/mypage'


export default function MyPage() {
  const { user, categories, fetchCategories } = useAuth()

  const [view, setView] = useState<MyPageView>('categories')

  // profile state handled by useProfile
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  // useCategories hook
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

  // useRecurring hook
  const {
    recurringList,
    recurringLoading,
    savingRecurring,
    newRecurringType,
    newRecurringAmount,
    newRecurringCurrency,
    newRecurringCategoryId,
    newRecurringCycle,
    newRecurringDayOfMonth,
    newRecurringDayOfWeek,
    editingRecurringId,
    editRecurringType,
    editRecurringAmount,
    editRecurringCurrency,
    editRecurringCycle,
    editRecurringDayOfMonth,
    editRecurringDayOfWeek,
    editRecurringCategoryId,
    setNewRecurringType,
    setNewRecurringAmount,
    setNewRecurringCurrency,
    setNewRecurringCategoryId,
    setNewRecurringCycle,
    setNewRecurringDayOfMonth,
    setNewRecurringDayOfWeek,
    setEditRecurringType,
    setEditRecurringAmount,
    setEditRecurringCurrency,
    setEditRecurringCycle,
    setEditRecurringDayOfMonth,
    setEditRecurringDayOfWeek,
    setEditRecurringCategoryId,
    fetchRecurring,
    handleAddRecurring,
    handleDeleteRecurring,
    handleToggleRecurring,
    startEditRecurring,
    handleUpdateRecurring,
    handleCancelEditRecurring,
    deleteRecurringTargetId,
    setDeleteRecurringTargetId,
  } = useRecurring(user)
  const { email, displayName, setDisplayName, saveProfile } = useProfile(user)

  // Profile initialization is handled inside useProfile

  // Recurring
  useEffect(() => {
    if (view !== 'recurring') return
    fetchRecurring()
  }, [view, fetchRecurring])

  return (
    <main className="p-4">
      <h1 className="mb-6 text-xl font-semibold text-center">マイページ</h1>

      <div className="flex gap-6">
        {/* Sidebar */}
        <Sidebar view={view} setView={setView} />

        {/* Main */}
        <section className="flex-1 bg-white p-4 shadow min-h-screen">
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
              onDelete={(categoryId) => setDeleteTargetId(categoryId)}
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
            <RecurringList
              recurringList={recurringList}
              recurringLoading={recurringLoading}
              categories={categories}
              newRecurringType={newRecurringType}
              onNewTypeChange={setNewRecurringType}
              newRecurringAmount={newRecurringAmount}
              onNewAmountChange={setNewRecurringAmount}
              newRecurringCurrency={newRecurringCurrency}
              onNewCurrencyChange={setNewRecurringCurrency}
              newRecurringCycle={newRecurringCycle}
              onNewCycleChange={setNewRecurringCycle}
              newRecurringDayOfMonth={newRecurringDayOfMonth}
              onNewDayOfMonthChange={setNewRecurringDayOfMonth}
              newRecurringDayOfWeek={newRecurringDayOfWeek}
              onNewDayOfWeekChange={setNewRecurringDayOfWeek}
              newRecurringCategoryId={newRecurringCategoryId}
              onNewCategoryIdChange={setNewRecurringCategoryId}
              onAddRecurring={handleAddRecurring}
              editingRecurringId={editingRecurringId}
              editRecurringType={editRecurringType}
              onEditTypeChange={setEditRecurringType}
              editRecurringAmount={editRecurringAmount}
              onEditAmountChange={setEditRecurringAmount}
              editRecurringCurrency={editRecurringCurrency}
              onEditCurrencyChange={setEditRecurringCurrency}
              editRecurringCycle={editRecurringCycle}
              onEditCycleChange={setEditRecurringCycle}
              editRecurringDayOfMonth={editRecurringDayOfMonth}
              onEditDayOfMonthChange={setEditRecurringDayOfMonth}
              editRecurringDayOfWeek={editRecurringDayOfWeek}
              onEditDayOfWeekChange={setEditRecurringDayOfWeek}
              editRecurringCategoryId={editRecurringCategoryId}
              onEditCategoryIdChange={setEditRecurringCategoryId}
              onStartEditRecurring={startEditRecurring}
              onUpdateRecurring={handleUpdateRecurring}
              onCancelEditRecurring={handleCancelEditRecurring}
              onToggleRecurring={handleToggleRecurring}
              onDeleteRecurringStart={(id) => setDeleteRecurringTargetId(id)}
              savingRecurring={savingRecurring}
            />
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

        </section>
      </div>

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
    </main>
  )
}
