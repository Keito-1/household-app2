'use client'

import dayjs from 'dayjs'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'


import type { Transaction, TxType } from '@/types/transaction'
import type { Category } from '@/types/category'

type ModalTransaction = Pick<
  Transaction,
  'id' | 'amount' | 'currency' | 'type' | 'category_id'
>

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  selectedDate: string

  transactions: ModalTransaction[]
  categories: Category[]

  // add
  newCategoryId: string
  setNewCategoryId: (v: string) => void
  newAmount: string
  setNewAmount: (v: string) => void
  newCurrency: string
  setNewCurrency: (v: string) => void
  newType: TxType
  setNewType: (v: TxType) => void
  onAdd: () => void

  // edit
  editingId: string | null
  editCategoryId: string
  setEditCategoryId: (v: string) => void
  editAmount: string
  setEditAmount: (v: string) => void
  editCurrency: string
  setEditCurrency: (v: string) => void
  editType: TxType
  setEditType: (v: TxType) => void
  onStartEdit: (t: ModalTransaction) => void
  onUpdate: () => void
  onDelete: (id: string) => void
}

export default function TransactionModal(props: Props) {
  const {
    open,
    onOpenChange,
    selectedDate,
    transactions,
    categories,

    newCategoryId,
    setNewCategoryId,
    newAmount,
    setNewAmount,
    newCurrency,
    setNewCurrency,
    newType,
    setNewType,
    onAdd,

    editingId,
    editCategoryId,
    setEditCategoryId,
    editAmount,
    setEditAmount,
    editCurrency,
    setEditCurrency,
    editType,
    setEditType,
    onStartEdit,
    onUpdate,
    onDelete,
  } = props

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[70vh] w-[40vw] max-w-none flex-col bg-white">
        <DialogHeader>
          <DialogTitle>
            {dayjs(selectedDate).format('YYYY年M月D日')}
          </DialogTitle>
        </DialogHeader>

        {/* Add / Edit */}
        <div className="space-y-2">
          <Label>カテゴリ</Label>

          <Select
            value={editingId ? editCategoryId : newCategoryId}
            onValueChange={(v) =>
              editingId ? setEditCategoryId(v) : setNewCategoryId(v)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択" />
            </SelectTrigger>

            <SelectContent className="bg-white text-black z-50 shadow-lg">
              {categories
                .filter((c) => c.type === (editingId ? editType : newType))
                .map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Label>金額</Label>
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            value={editingId ? editAmount : newAmount}
            onChange={(e) => {
              const value = e.target.value

              // 半角数字 or 空文字のみ許可
              if (!/^\d*$/.test(value)) return

              if (editingId) {
                setEditAmount(value)
              } else {
                setNewAmount(value)
              }
            }}
          />


          <div className="flex gap-2">
            <Select
              value={editingId ? editCurrency : newCurrency}
              onValueChange={(v) =>
                editingId ? setEditCurrency(v) : setNewCurrency(v)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white text-black shadow-lg">
                <SelectItem value="JPY">JPY</SelectItem>
                <SelectItem value="AUD">AUD</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="NZD">NZD</SelectItem>
                <SelectItem value="PHP">PHP</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={editingId ? editType : newType}
              onValueChange={(v) =>
                editingId
                  ? setEditType(v as TxType)
                  : setNewType(v as TxType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white text-black shadow-lg">
                <SelectItem value="expense">支出</SelectItem>
                <SelectItem value="income">収入</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editingId ? (
            <div className="flex gap-2">
              <Button 
              variant="outline"
              className="flex-1 border-gray-200 text-green-500 hover:bg-green-500 hover:text-white"
              onClick={onUpdate}>
                更新
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-200 text-gray-500 hover:bg-gray-500 hover:text-white"
                onClick={() => onOpenChange(false)}
              >
                キャンセル
              </Button>
            </div>
          ) : (
            <Button className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white" onClick={onAdd}>
              追加
            </Button>
          )}
        </div>

        <Separator className="my-3" />

        {/* List */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-2">
            {transactions.map((t) => {
              const cat = categories.find((c) => c.id === t.category_id)

              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-md border p-2"
                >
                  <div>
                    <div className="text-sm">
                      {cat?.name ?? '未分類'}
                    </div>
                    <div
                      className={
                        t.type === 'expense'
                          ? 'text-red-500'
                          : 'text-green-500'
                      }
                    >
                      {t.type === 'expense' ? '-' : '+'}
                      {t.amount} {t.currency}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-blue-400 text-blue-600 hover:bg-blue-500 hover:text-white"
                      onClick={() => onStartEdit(t)}
                    >
                      編集
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-400 text-red-600 hover:bg-red-500 hover:text-white"
                      onClick={() => onDelete(t.id)}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
