"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { MonthSelector } from "@/components/layout/MonthSelector"
import { TransactionList } from "@/components/transactions/TransactionList"
import { useTransactions } from "@/hooks/useTransactions"
import { getMonthRange, currentMonth } from "@/lib/utils"

function TransactionsContent() {
  const searchParams = useSearchParams()
  const month = searchParams.get("month") ?? currentMonth()
  const { from, to } = getMonthRange(month)

  const { data: transactions = [], isLoading } = useTransactions({
    from: from.toISOString(),
    to: to.toISOString(),
  })

  return (
    <main className="flex flex-col max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-base font-semibold">Transactions</h1>
      </div>
      <MonthSelector />
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      ) : (
        <TransactionList transactions={transactions} />
      )}
    </main>
  )
}

export default function TransactionsPage() {
  return (
    <Suspense>
      <TransactionsContent />
    </Suspense>
  )
}
