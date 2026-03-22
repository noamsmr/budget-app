"use client"

import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Transaction } from "@/types"

interface DayCellProps {
  date: Date
  transactions: Transaction[]
  isToday: boolean
  isSelected: boolean
  isCurrentMonth: boolean
  onClick: () => void
}

export function DayCell({
  date,
  transactions,
  isToday,
  isSelected,
  isCurrentMonth,
  onClick,
}: DayCellProps) {
  const hasIncome = transactions.some((t) => t.type === "INCOME")
  const hasExpense = transactions.some((t) => t.type === "EXPENSE")

  return (
    <button
      onClick={onClick}
      className={cn(
        "aspect-square flex flex-col items-center justify-start pt-1 rounded-lg transition-colors text-sm",
        isCurrentMonth ? "text-foreground" : "text-muted-foreground/30",
        isToday && !isSelected && "bg-primary/10 font-semibold",
        isSelected && "bg-primary text-primary-foreground",
        !isToday && !isSelected && "hover:bg-muted/50",
        transactions.length === 0 && "cursor-default"
      )}
    >
      <span className="text-xs leading-none">{format(date, "d")}</span>

      {/* Indicator dots */}
      {transactions.length > 0 && (
        <div className="flex gap-0.5 mt-1">
          {hasIncome && (
            <span
              className={cn(
                "w-1 h-1 rounded-full",
                isSelected ? "bg-primary-foreground" : "bg-emerald-500"
              )}
            />
          )}
          {hasExpense && (
            <span
              className={cn(
                "w-1 h-1 rounded-full",
                isSelected ? "bg-primary-foreground" : "bg-red-400"
              )}
            />
          )}
        </div>
      )}
    </button>
  )
}
