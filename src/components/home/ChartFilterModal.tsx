"use client"

import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Category, Group } from "@/types"

interface FilterState {
  categoryIds: string[]
  groupIds: string[]
}

interface ChartFilterModalProps {
  categories: Category[]
  groups: Group[]
  filters: FilterState
  onChange: (filters: FilterState) => void
}

export function ChartFilterModal({ categories, groups, filters, onChange }: ChartFilterModalProps) {
  const [open, setOpen] = useState(false)
  const hasFilters = filters.categoryIds.length > 0 || filters.groupIds.length > 0

  function toggleCategory(id: string) {
    const next = filters.categoryIds.includes(id)
      ? filters.categoryIds.filter((c) => c !== id)
      : [...filters.categoryIds, id]
    onChange({ ...filters, categoryIds: next })
  }

  function toggleGroup(id: string) {
    const next = filters.groupIds.includes(id)
      ? filters.groupIds.filter((g) => g !== id)
      : [...filters.groupIds, id]
    onChange({ ...filters, groupIds: next })
  }

  function clearAll() {
    onChange({ categoryIds: [], groupIds: [] })
  }

  // Group categories by group
  const ungrouped = categories.filter((c) => !c.groupId)
  const grouped = groups.map((g) => ({
    group: g,
    categories: categories.filter((c) => c.groupId === g.id),
  }))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" className="relative h-8 w-8" />}>
        <SlidersHorizontal size={16} />
        {hasFilters && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Filter Charts
            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2 max-h-[60vh] overflow-y-auto">
          {groups.length > 0 && (
            <section>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Groups
              </p>
              <div className="space-y-1">
                {groups.map((g) => (
                  <label key={g.id} className="flex items-center gap-3 py-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.groupIds.includes(g.id)}
                      onChange={() => toggleGroup(g.id)}
                      className="rounded border-border"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: g.color ?? "#6b7280" }}
                    />
                    <span className="text-sm">{g.name}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {grouped.map(({ group, categories: cats }) => (
            <section key={group.id}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                {group.name}
              </p>
              <div className="space-y-1 pl-2">
                {cats.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 py-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categoryIds.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="rounded border-border"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color ?? "#6b7280" }}
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </section>
          ))}

          {ungrouped.length > 0 && (
            <section>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Uncategorized
              </p>
              <div className="space-y-1">
                {ungrouped.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-3 py-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.categoryIds.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="rounded border-border"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color ?? "#6b7280" }}
                    />
                    <span className="text-sm">{cat.name}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {categories.length === 0 && groups.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No categories or groups yet
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
