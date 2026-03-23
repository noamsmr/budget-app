export type TransactionType = "INCOME" | "EXPENSE"
export type RecurrenceRule = "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "YEARLY"

export interface Group {
  id: string
  name: string
  color: string | null
  createdAt: string
}

export interface Category {
  id: string
  name: string
  color: string | null
  type: TransactionType
  groupId: string | null
  group?: Group | null
  createdAt: string
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: string
  description: string
  date: string
  categoryId: string | null
  category?: Category | null
  isRecurring: boolean
  recurrenceRule: RecurrenceRule | null
  recurrenceEndDate: string | null
  isInstance?: boolean
  originalId?: string
  createdAt: string
}
