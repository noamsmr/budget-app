import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isWithinInterval,
  isBefore,
  isAfter,
} from "date-fns"

export type RecurrenceRule = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY"

export interface BaseTransaction {
  id: string
  type: "INCOME" | "EXPENSE"
  amount: string
  description: string
  date: Date
  isRecurring: boolean
  recurrenceRule: RecurrenceRule | null
  recurrenceEndDate: Date | null
  categoryId: string | null
  category?: {
    id: string
    name: string
    color: string | null
    groupId: string | null
    group?: { id: string; name: string; color: string | null } | null
  } | null
}

export interface ExpandedTransaction extends BaseTransaction {
  instanceDate: Date
  isInstance: boolean
  originalId: string
}

function advanceDate(date: Date, rule: RecurrenceRule): Date {
  switch (rule) {
    case "DAILY":
      return addDays(date, 1)
    case "WEEKLY":
      return addWeeks(date, 1)
    case "BIWEEKLY":
      return addWeeks(date, 2)
    case "MONTHLY":
      return addMonths(date, 1)
    case "YEARLY":
      return addYears(date, 1)
  }
}

export function expandRecurring(
  transactions: BaseTransaction[],
  from: Date,
  to: Date
): ExpandedTransaction[] {
  const result: ExpandedTransaction[] = []

  for (const tx of transactions) {
    if (!tx.isRecurring || !tx.recurrenceRule) {
      const d = new Date(tx.date)
      if (
        isWithinInterval(d, { start: from, end: to }) ||
        d.toDateString() === from.toDateString() ||
        d.toDateString() === to.toDateString()
      ) {
        result.push({
          ...tx,
          instanceDate: d,
          isInstance: false,
          originalId: tx.id,
        })
      }
      continue
    }

    let cursor = new Date(tx.date)
    const endBound = tx.recurrenceEndDate
      ? isBefore(tx.recurrenceEndDate, to)
        ? tx.recurrenceEndDate
        : to
      : to

    while (!isAfter(cursor, endBound)) {
      if (!isBefore(cursor, from)) {
        result.push({
          ...tx,
          date: cursor,
          instanceDate: cursor,
          isInstance: true,
          originalId: tx.id,
          id: `${tx.id}_${cursor.toISOString()}`,
        })
      }
      const next = advanceDate(cursor, tx.recurrenceRule)
      if (next.getTime() === cursor.getTime()) break // guard against infinite loop
      cursor = next
    }
  }

  return result.sort((a, b) => a.instanceDate.getTime() - b.instanceDate.getTime())
}
