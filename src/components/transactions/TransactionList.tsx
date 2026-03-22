"use client"

import { format } from "date-fns"
import { Repeat2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { useDeleteTransaction } from "@/hooks/useTransactions"
import { formatCurrency, cn } from "@/lib/utils"
import type { Transaction } from "@/types"

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const deleteM = useDeleteTransaction()

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">No transactions found</p>
      </div>
    )
  }

  // Group by date
  const byDate = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const key = format(new Date(tx.date), "yyyy-MM-dd")
    if (!byDate.has(key)) byDate.set(key, [])
    byDate.get(key)!.push(tx)
  }

  const sortedDates = Array.from(byDate.keys()).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-4 px-4">
      {sortedDates.map((dateKey) => {
        const dayTxs = byDate.get(dateKey)!
        const dayIncome = dayTxs.filter((t) => t.type === "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0)
        const dayExpenses = dayTxs.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + parseFloat(t.amount), 0)

        return (
          <div key={dateKey}>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-xs font-medium text-muted-foreground">
                {format(new Date(dateKey), "EEE, MMM d")}
              </span>
              <div className="flex gap-2 text-xs">
                {dayIncome > 0 && <span className="text-emerald-500">+{formatCurrency(dayIncome)}</span>}
                {dayExpenses > 0 && <span className="text-muted-foreground">-{formatCurrency(dayExpenses)}</span>}
              </div>
            </div>
            <div className="space-y-1">
              {dayTxs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-card border border-border/50 group"
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
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          disabled={deleteM.isPending}
                        />
                      }
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
          </div>
        )
      })}
    </div>
  )
}
