import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface TransferMoneyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  targetLabel: string
  onSubmit: (payload: { amount: number; notes?: string }) => Promise<unknown>
  onSuccess?: () => void
  onError?: (message: string) => void
}

export const TransferMoneyDialog = ({
  open,
  onOpenChange,
  title,
  description,
  targetLabel,
  onSubmit,
  onSuccess,
  onError,
}: TransferMoneyDialogProps) => {
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: onSubmit,
    onSuccess: () => {
      setAmount('')
      setNotes('')
      setFieldError(null)
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: unknown) => {
      const errorResponse = error as {
        response?: { data?: { error?: string; errors?: Record<string, string> } }
      }
      const message =
        errorResponse.response?.data?.error ||
        errorResponse.response?.data?.errors?.amount ||
        'Không thể chuyển credit. Vui lòng thử lại.'
      onError?.(message)
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      setFieldError('Số tiền phải lớn hơn 0')
      return
    }
    setFieldError(null)
    mutation.mutate({
      amount: parsed,
      notes: notes.trim() || undefined,
    })
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setAmount('')
      setNotes('')
      setFieldError(null)
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || `Chuyển credit tới ${targetLabel}.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transfer-target">Người nhận</Label>
            <Input id="transfer-target" value={targetLabel} readOnly tabIndex={0} aria-label="Người nhận" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-amount">Số tiền</Label>
            <Input
              id="transfer-amount"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Nhập số credit"
              aria-label="Số tiền chuyển"
              required
            />
            {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-notes">Ghi chú (tuỳ chọn)</Label>
            <Input
              id="transfer-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              placeholder="Ghi chú"
              aria-label="Ghi chú chuyển credit"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>
              Hủy
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Đang chuyển...' : 'Chuyển credit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
