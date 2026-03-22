"use client"

import { format } from "date-fns"
import { parseISO } from "date-fns"
import { Repeat2, Trash2 } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useDeleteTransaction } from "@/hooks/useTransactions"
import { formatCurrency, cn } from "@/lib/utils"
import type { Transaction } from "@/types"

interface DayDetailSheetProps {
  date: string | null
  transactions: Transaction[]
  onClose: () => void
}

export function DayDetailSheet({ date, transactions, onClose }: DayDetailSheetProps) {
  const deleteM = useDeleteTransaction()

  const income = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0)
  const expenses = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + parseFloat(t.amount), 0)

  return (
    <Sheet open={!!date} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader className="pb-4">
          <SheetTitle>
            {date ? format(parseISO(date), "EEEE, MMMM d") : ""}
          </SheetTitle>
          {transactions.length > 0 && (
            <div className="flex gap-4 text-sm">
              {income > 0 && (
                <span className="text-emerald-500">+{formatCurrency(income)}</span>
              )}
              {expenses > 0 && (
                <span className="text-red-400">-{formatCurrency(expenses)}</span>
              )}
            </div>
          )}
        </SheetHeader>

        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No transactions on this day</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-muted/30"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: tx.category?.color ?? "#6b7280" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium truncate">{tx.description}</span>
                    {tx.isRecurring && <Repeat2 size={11} className="text-muted-foreground shrink-0" />}
                  </div>
                  {tx.category && (
                    <span className="text-xs text-muted-foreground">{tx.category.name}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums shrink-0",
                    tx.type === "INCOME" ? "text-emerald-500" : "text-foreground"
                  )}
                >
                  {tx.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(parseFloat(tx.amount))}
                </span>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={<Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" />}
                  >
                    <Trash2 size={12} />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {tx.isRecurring ? "This will delete the entire recurring series." : "This action cannot be undone."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteM.mutate(tx.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
