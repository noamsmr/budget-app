"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Group } from "@/types"
import type { GroupInput } from "@/lib/validations"

export function useGroups() {
  return useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: async () => {
      const res = await fetch("/api/groups")
      if (!res.ok) throw new Error("Failed to fetch groups")
      return res.json()
    },
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: GroupInput) => {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create group")
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["groups"] }),
  })
}

export function useUpdateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: GroupInput & { id: string }) => {
      const res = await fetch(`/api/groups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update group")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] })
      qc.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}

export function useDeleteGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/groups/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete group")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"] })
      qc.invalidateQueries({ queryKey: ["categories"] })
    },
  })
}
