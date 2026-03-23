"use client"

import { useState } from "react"
import { Trash2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CategoryForm } from "@/components/forms/CategoryForm"
import { useCategories, useDeleteCategory, useUpdateCategory } from "@/hooks/useCategories"
import { useGroups } from "@/hooks/useGroups"
import { cn, CATEGORY_COLORS } from "@/lib/utils"
import type { Category, TransactionType } from "@/types"

function EditCategoryRow({
  cat,
  onDone,
}: {
  cat: Category
  onDone: () => void
}) {
  const updateM = useUpdateCategory()
  const { data: groups } = useGroups()
  const [name, setName] = useState(cat.name)
  const [color, setColor] = useState(cat.color ?? CATEGORY_COLORS[0])
  const [type, setType] = useState<TransactionType>(cat.type)
  const [groupId, setGroupId] = useState(cat.groupId ?? "none")

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await updateM.mutateAsync({
      id: cat.id,
      name: name.trim(),
      color,
      type,
      groupId: groupId === "none" ? null : groupId,
    })
    onDone()
  }

  return (
    <form
      onSubmit={handleSave}
      className="flex flex-col gap-3 py-3 px-4 bg-card rounded-xl border border-border/50"
    >
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
      <div className="space-y-1.5">
        <Label>Name</Label>
        <Input
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
        <Button type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={updateM.isPending}>
          {updateM.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  )
}

function CategoryRow({
  cat,
  onEdit,
  onDelete,
  deleteIsPending,
}: {
  cat: Category
  onEdit: () => void
  onDelete: () => void
  deleteIsPending: boolean
}) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 bg-card rounded-xl border border-border/50">
      <span
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: cat.color ?? "#6b7280" }}
      />
      <span className="flex-1 text-sm font-medium">{cat.name}</span>
      {cat.group && (
        <Badge variant="secondary" className="text-xs">
          {cat.group.name}
        </Badge>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={onEdit}
      >
        <Pencil size={13} />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              disabled={deleteIsPending}
            />
          }
        >
          <Trash2 size={13} />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{cat.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Transactions using this category will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories()
  const deleteM = useDeleteCategory()
  const [editingId, setEditingId] = useState<string | null>(null)

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE")
  const incomeCategories = categories.filter((c) => c.type === "INCOME")

  function renderList(list: Category[]) {
    if (list.length === 0) {
      return <p className="text-sm text-muted-foreground py-2">None yet</p>
    }
    return (
      <div className="space-y-2">
        {list.map((cat) =>
          editingId === cat.id ? (
            <EditCategoryRow key={cat.id} cat={cat} onDone={() => setEditingId(null)} />
          ) : (
            <CategoryRow
              key={cat.id}
              cat={cat}
              onEdit={() => setEditingId(cat.id)}
              onDelete={() => deleteM.mutate(cat.id)}
              deleteIsPending={deleteM.isPending}
            />
          )
        )}
      </div>
    )
  }

  return (
    <main className="flex flex-col max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-base font-semibold">Categories</h1>
      </div>

      <div className="px-4 space-y-6">
        <CategoryForm />

        {isLoading ? (
          <div className="text-center py-8">
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <>
            <section className="space-y-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Expense Categories
              </h2>
              {renderList(expenseCategories)}
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Income Categories
              </h2>
              {renderList(incomeCategories)}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
