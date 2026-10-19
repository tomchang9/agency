import { CheckCircle, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

type FeedbackVariant = 'success' | 'error'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  variant: FeedbackVariant
  actionLabel?: string
}

export const FeedbackDialog = ({
  open,
  onOpenChange,
  title,
  description,
  variant,
  actionLabel = 'Đóng',
}: FeedbackDialogProps) => {
  const Icon = variant === 'success' ? CheckCircle : XCircle
  const iconClassName = variant === 'success' ? 'text-green-600' : 'text-destructive'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <Icon className={`h-6 w-6 ${iconClassName} flex-shrink-0`} />
            <div>
              <DialogTitle>{title}</DialogTitle>
              {description ? <DialogDescription>{description}</DialogDescription> : null}
            </div>
          </div>
        </DialogHeader>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>{actionLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

