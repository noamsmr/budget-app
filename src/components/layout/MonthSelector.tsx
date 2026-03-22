"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatMonth, prevMonth, nextMonth, currentMonth } from "@/lib/utils"

export function MonthSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const month = searchParams.get("month") ?? currentMonth()

  function navigate(target: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("month", target)
    router.push(`?${params.toString()}`)
  }

  const isCurrentMonth = month === currentMonth()

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(prevMonth(month))}
        className="h-8 w-8"
      >
        <ChevronLeft size={16} />
      </Button>
      <button
        onClick={() => navigate(currentMonth())}
        className="text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        {formatMonth(month)}
        {!isCurrentMonth && (
          <span className="ml-2 text-xs text-muted-foreground">(tap to reset)</span>
        )}
      </button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(nextMonth(month))}
        className="h-8 w-8"
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  )
}
