"use client"

import { useState, useMemo, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ChartCarousel } from "@/components/home/ChartCarousel"
import { SavingsBar } from "@/components/home/SavingsBar"
import { ChartFilterModal } from "@/components/home/ChartFilterModal"
import { InlineTransactionList } from "@/components/home/InlineTransactionList"
import { MonthSelector } from "@/components/layout/MonthSelector"
import { useTransactions } from "@/hooks/useTransactions"
import { useCategories } from "@/hooks/useCategories"
import { useGroups } from "@/hooks/useGroups"
import { getMonthRange, currentMonth } from "@/lib/utils"

function HomeContent() {
  const searchParams = useSearchParams()
  const month = searchParams.get("month") ?? currentMonth()
  const { from, to } = getMonthRange(month)

  const [filters, setFilters] = useState<{ categoryIds: string[]; groupIds: string[] }>({
    categoryIds: [],
    groupIds: [],
  })

  const { data: transactions = [], isLoading } = useTransactions({
    from: from.toISOString(),
    to: to.toISOString(),
  })
  const { data: categories = [] } = useCategories()
  const { data: groups = [] } = useGroups()

  const filteredTransactions = useMemo(() => {
    if (filters.categoryIds.length === 0 && filters.groupIds.length === 0) return transactions
    return transactions.filter((tx) => {
      const catMatch =
        filters.categoryIds.length === 0 ||
        (tx.categoryId != null && filters.categoryIds.includes(tx.categoryId))
      const groupMatch =
        filters.groupIds.length === 0 ||
        (tx.category?.groupId != null && filters.groupIds.includes(tx.category.groupId))
      return catMatch || groupMatch
    })
  }, [transactions, filters])

  const income = useMemo(
    () => filteredTransactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0),
    [filteredTransactions]
  )
  const expenses = useMemo(
    () => filteredTransactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + parseFloat(t.amount), 0),
    [filteredTransactions]
  )

  return (
    <main className="flex flex-col max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between pr-4">
        <MonthSelector />
        <ChartFilterModal
          categories={categories}
          groups={groups}
          filters={filters}
          onChange={setFilters}
        />
      </div>

      {/* Charts */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      ) : (
        <ChartCarousel
          transactions={filteredTransactions}
          activeFilters={filters}
          onFilterChange={setFilters}
        />
      )}

      {/* Savings bar */}
      <SavingsBar income={income} expenses={expenses} />

      {/* Transactions */}
      <InlineTransactionList transactions={transactions} />
    </main>
  )
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  )
}
