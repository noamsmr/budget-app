import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function getMonthRange(month: string): { from: Date; to: Date } {
  const date = parseISO(`${month}-01`)
  return { from: startOfMonth(date), to: endOfMonth(date) }
}

export function formatMonth(month: string): string {
  return format(parseISO(`${month}-01`), "MMMM yyyy")
}

export function currentMonth(): string {
  return format(new Date(), "yyyy-MM")
}

export function prevMonth(month: string): string {
  const date = parseISO(`${month}-01`)
  date.setMonth(date.getMonth() - 1)
  return format(date, "yyyy-MM")
}

export function nextMonth(month: string): string {
  const date = parseISO(`${month}-01`)
  date.setMonth(date.getMonth() + 1)
  return format(date, "yyyy-MM")
}

// Default category colors
export const CATEGORY_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#ef4444", // red
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#f97316", // orange
  "#84cc16", // lime
]

