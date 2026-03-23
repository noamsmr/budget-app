"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn, CATEGORY_COLORS } from "@/lib/utils"
import { useCreateCategory } from "@/hooks/useCategories"
import { useGroups } from "@/hooks/useGroups"
import type { TransactionType } from "@/types"

interface CategoryFormProps {
  lockedType?: TransactionType
}

export function CategoryForm({ lockedType }: CategoryFormProps) {
  const createM = useCreateCategory()
  const { data: groups } = useGroups()
  const [name, setName] = useState("")
  const [color, setColor] = useState(() => CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)])
  const [type, setType] = useState<TransactionType>(lockedType ?? "EXPENSE")
  const [groupId, setGroupId] = useState<string>("none")
  const [open, setOpen] = useState(false)

  function randomColor() {
    return CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await createM.mutateAsync({
      name: name.trim(),
      color,
      type,
      groupId: groupId === "none" ? null : groupId,
    })
    setName("")
    setColor(randomColor())
    if (!lockedType) setType("EXPENSE")
    setOpen(false)
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Plus size={14} />
        Add Category
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-card rounded-xl border border-border">
      {!lockedType && (
        <div className="flex rounded-lg bg-muted p-1 gap-1">
          {(["EXPENSE", "INCOME"] as TransactionType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors",
                type === t
                  ? t === "INCOME"
                    ? "bg-emerald-600 text-white"
                    : "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "INCOME" ? "Income" : "Expense"}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="catName">Name</Label>
        <Input
          id="catName"
          placeholder="e.g. Groceries"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Color</Label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                outline: color === c ? `2px solid ${c}` : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Group (optional)</Label>
        <Select value={groupId} onValueChange={(v) => setGroupId(v ?? "none")}>
          <SelectTrigger>
            <SelectValue>
              {(value: string | null) =>
                !value || value === "none"
                  ? "No group"
                  : (groups?.find((g) => g.id === value)?.name ?? value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No group</SelectItem>
            {groups?.map((g) => (
              <SelectItem key={g.id} value={g.id}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={createM.isPending}>
          {createM.isPending ? "Saving..." : "Add"}
        </Button>
      </div>
    </form>
  )
}
