"use client"

import { cn } from "@/lib/utils"

interface SavingsBarProps {
  income: number
  expenses: number
}

export function SavingsBar({ income, expenses }: SavingsBarProps) {
  const profit = income - expenses
  const pct = income > 0 ? Math.round((profit / income) * 100) : 0
  const clamped = Math.max(0, Math.min(100, pct))
  const isPositive = profit >= 0

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">Savings rate</span>
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            isPositive ? "text-emerald-500" : "text-red-500"
          )}
        >
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            isPositive ? "bg-emerald-500" : "bg-red-500"
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
