"use client"

import { useState, useMemo } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { PieChartCard } from "./PieChartCard"
import { SlideDots } from "./SlideDots"
import type { Transaction } from "@/types"
import { CATEGORY_COLORS } from "@/lib/utils"

interface ChartCarouselProps {
  transactions: Transaction[]
  activeFilters: { categoryIds: string[]; groupIds: string[] }
  onFilterChange: (filters: { categoryIds: string[]; groupIds: string[] }) => void
}

function buildChartData(txs: Transaction[], type: "INCOME" | "EXPENSE") {
  const byCategory: Record<string, { name: string; color: string | null; total: number }> = {}
  const uncategorized = { name: "Uncategorized", color: "#6b7280", total: 0 }

  for (const tx of txs) {
    if (tx.type !== type) continue
    const amount = parseFloat(tx.amount)
    if (!tx.categoryId || !tx.category) {
      uncategorized.total += amount
    } else {
      const id = tx.categoryId
      if (!byCategory[id]) {
        byCategory[id] = {
          name: tx.category.name,
          color: tx.category.color,
          total: 0,
        }
      }
      byCategory[id].total += amount
    }
  }

  const entries = Object.entries(byCategory).map(([id, data], i) => ({
    id,
    name: data.name,
    value: data.total,
    color: data.color ?? CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }))

  if (uncategorized.total > 0) {
    entries.push({
      id: "__uncategorized__",
      name: uncategorized.name,
      value: uncategorized.total,
      color: uncategorized.color,
    })
  }

  return entries.sort((a, b) => b.value - a.value)
}

export function ChartCarousel({
  transactions,
  activeFilters,
  onFilterChange,
}: ChartCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false })
  const [selectedIndex, setSelectedIndex] = useState(0)

  emblaApi?.on("select", () => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  })

  // Apply filters
  const filtered = useMemo(() => {
    if (activeFilters.categoryIds.length === 0 && activeFilters.groupIds.length === 0) {
      return transactions
    }
    return transactions.filter((tx) => {
      const catMatch =
        activeFilters.categoryIds.length === 0 ||
        (tx.categoryId && activeFilters.categoryIds.includes(tx.categoryId))
      const groupMatch =
        activeFilters.groupIds.length === 0 ||
        (tx.category?.groupId && activeFilters.groupIds.includes(tx.category.groupId))
      return catMatch || groupMatch
    })
  }, [transactions, activeFilters])

  const income = useMemo(
    () => filtered.filter((t) => t.type === "INCOME").reduce((s, t) => s + parseFloat(t.amount), 0),
    [filtered]
  )
  const expenses = useMemo(
    () => filtered.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + parseFloat(t.amount), 0),
    [filtered]
  )
  const profit = income - expenses

  const incomeData = useMemo(() => buildChartData(filtered, "INCOME"), [filtered])
  const expenseData = useMemo(() => buildChartData(filtered, "EXPENSE"), [filtered])

  // Profit chart: two slices — income vs expenses
  const profitData = [
    {
      id: "income",
      name: "Income",
      value: income,
      color: "#10b981",
    },
    {
      id: "expenses",
      name: "Expenses",
      value: expenses,
      color: "#ef4444",
    },
  ].filter((d) => d.value > 0)

  function handleSliceClick(id: string) {
    if (id === "income" || id === "expenses" || id === "__uncategorized__") return
    const current = activeFilters.categoryIds
    const next = current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
    onFilterChange({ ...activeFilters, categoryIds: next })
  }

  const slides = [
    {
      key: "income",
      title: "Income",
      total: income,
      data: incomeData,
      emptyMessage: "No income this month",
    },
    {
      key: "expenses",
      title: "Expenses",
      total: expenses,
      data: expenseData,
      emptyMessage: "No expenses this month",
    },
    {
      key: "profit",
      title: profit >= 0 ? "Profit" : "Loss",
      total: Math.abs(profit),
      data: profitData,
      emptyMessage: "No transactions",
    },
  ]

  return (
    <div className="w-full">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.key} className="flex-none w-full min-w-0">
              <PieChartCard
                title={slide.title}
                total={slide.total}
                data={slide.data}
                activeIds={activeFilters.categoryIds}
                onSliceClick={handleSliceClick}
                emptyMessage={slide.emptyMessage}
              />
            </div>
          ))}
        </div>
      </div>
      <SlideDots count={3} active={selectedIndex} onSelect={(i) => emblaApi?.scrollTo(i)} />
    </div>
  )
}
