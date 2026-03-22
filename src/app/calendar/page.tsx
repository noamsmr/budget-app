"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { MonthSelector } from "@/components/layout/MonthSelector"
import { CalendarGrid } from "@/components/calendar/CalendarGrid"
import { useTransactions } from "@/hooks/useTransactions"
import { getMonthRange, currentMonth } from "@/lib/utils"

function CalendarContent() {
  const searchParams = useSearchParams()
  const month = searchParams.get("month") ?? currentMonth()
  const { from, to } = getMonthRange(month)

  const { data: transactions = [], isLoading } = useTransactions({
    from: from.toISOString(),
    to: to.toISOString(),
  })

  return (
    <main className="flex flex-col max-w-lg mx-auto w-full">
      <MonthSelector />
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      ) : (
        <CalendarGrid month={month} transactions={transactions} />
      )}
    </main>
  )
}

export default function CalendarPage() {
  return (
    <Suspense>
      <CalendarContent />
    </Suspense>
  )
}
