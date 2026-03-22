"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Plus, Repeat2, Trash2 } from "lucide-react"
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

interface InlineTransactionListProps {
  transactions: Transaction[]
}

export function InlineTransactionList({ transactions }: InlineTransactionListProps) {
  const deleteM = useDeleteTransaction()

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-muted-foreground">Transactions</h2>
        <Link href="/add-transaction">
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
            <Plus size={12} />
            Add
          </Button>
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No transactions this month</p>
          <Link href="/add-transaction" className="mt-2 inline-block">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5">
              <Plus size={12} />
              Add your first transaction
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-1">
          {sorted.slice(0, 15).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {/* Color dot */}
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: tx.category?.color ?? "#6b7280" }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate">{tx.description}</span>
                  {tx.isRecurring && (
                    <Repeat2 size={11} className="text-muted-foreground shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {tx.category && (
                    <span className="text-[10px] text-muted-foreground">{tx.category.name}</span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(tx.date), "MMM d")}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <span
                className={cn(
                  "text-sm font-semibold tabular-nums shrink-0",
                  tx.type === "INCOME" ? "text-emerald-500" : "text-foreground"
                )}
              >
                {tx.type === "INCOME" ? "+" : "-"}
                {formatCurrency(parseFloat(tx.amount))}
              </span>

              {/* Delete */}
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
                      {tx.isRecurring
                        ? "This will delete the entire recurring series."
                        : "This action cannot be undone."}
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

          {sorted.length > 15 && (
            <Link
              href="/transactions"
              className="block text-center text-xs text-muted-foreground hover:text-primary py-2 transition-colors"
            >
              View all {sorted.length} transactions →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
