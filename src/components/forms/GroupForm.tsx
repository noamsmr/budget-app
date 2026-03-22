"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateGroup } from "@/hooks/useGroups"
import { CATEGORY_COLORS } from "@/lib/utils"

export function GroupForm() {
  const createM = useCreateGroup()
  const [name, setName] = useState("")
  const [color, setColor] = useState(CATEGORY_COLORS[0])
  const [open, setOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await createM.mutateAsync({ name: name.trim(), color })
    setName("")
    setOpen(false)
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <Plus size={14} />
        Add Group
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-card rounded-xl border border-border">
      <div className="space-y-1.5">
        <Label htmlFor="groupName">Name</Label>
        <Input
          id="groupName"
          placeholder="e.g. Fixed expenses"
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
