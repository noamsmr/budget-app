import { z } from "zod"

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive(),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.string().min(1),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z
    .enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"])
    .optional()
    .nullable(),
  recurrenceEndDate: z.string().optional().nullable(),
})

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required"),
  type: z.enum(["INCOME", "EXPENSE"]),
  groupId: z.string().optional().nullable(),
})

export const groupSchema = z.object({
  name: z.string().min(1, "Name is required"),
})

export type TransactionInput = z.infer<typeof transactionSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type GroupInput = z.infer<typeof groupSchema>
