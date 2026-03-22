"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Transaction } from "@/types"

interface TransactionParams {
  from?: string
  to?: string
  type?: string
  categoryId?: string
  groupId?: string
}

async function fetchTransactions(params: TransactionParams): Promise<Transaction[]> {
  const searchParams = new URLSearchParams()
  if (params.from) searchParams.set("from", params.from)
  if (params.to) searchParams.set("to", params.to)
  if (params.type) searchParams.set("type", params.type)
  if (params.categoryId) searchParams.set("categoryId", params.categoryId)
  if (params.groupId) searchParams.set("groupId", params.groupId)

  const res = await fetch(`/api/transactions?${searchParams}`)
  if (!res.ok) throw new Error("Failed to fetch transactions")
  return res.json()
}

export function useTransactions(params: TransactionParams) {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => fetchTransactions(params),
  })
}

export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Transaction> & { amount: number }) => {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create transaction")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  })
}

export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Transaction> & { id: string; amount: number }) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update transaction")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const baseId = id.includes("_") ? id.split("_")[0] : id
      const res = await fetch(`/api/transactions/${baseId}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete transaction")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  })
}
