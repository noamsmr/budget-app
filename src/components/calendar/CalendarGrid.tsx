"use client"

import { useState } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from "date-fns"
import { parseISO } from "date-fns"
import { DayCell } from "./DayCell"
import { DayDetailSheet } from "./DayDetailSheet"
import type { Transaction } from "@/types"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface CalendarGridProps {
  month: string
  transactions: Transaction[]
}

export function CalendarGrid({ month, transactions }: CalendarGridProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const monthDate = parseISO(`${month}-01`)
  const days = eachDayOfInterval({ start: startOfMonth(monthDate), end: endOfMonth(monthDate) })
  const startPad = getDay(days[0]) // 0 = Sunday

  // Build map of date → transactions
  const txByDay = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const key = format(new Date(tx.date), "yyyy-MM-dd")
    if (!txByDay.has(key)) txByDay.set(key, [])
    txByDay.get(key)!.push(tx)
  }

  const selectedTxs = selectedDate ? (txByDay.get(selectedDate) ?? []) : []

  return (
    <>
      <div className="px-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px">
          {/* Padding cells */}
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd")
            const dayTxs = txByDay.get(key) ?? []
            return (
              <DayCell
                key={key}
                date={day}
                transactions={dayTxs}
                isToday={isToday(day)}
                isSelected={selectedDate === key}
                isCurrentMonth={isSameMonth(day, monthDate)}
                onClick={() => setSelectedDate(selectedDate === key ? null : key)}
              />
            )
          })}
        </div>
      </div>

      <DayDetailSheet
        date={selectedDate}
        transactions={selectedTxs}
        onClose={() => setSelectedDate(null)}
      />
    </>
  )
}
