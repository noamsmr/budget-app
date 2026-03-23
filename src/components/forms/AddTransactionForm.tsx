"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, Plus } from "lucide-react"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn, CATEGORY_COLORS } from "@/lib/utils"
import { useCreateTransaction } from "@/hooks/useTransactions"
import { useCategories, useCreateCategory } from "@/hooks/useCategories"
import { useGroups } from "@/hooks/useGroups"
import type { TransactionType, RecurrenceRule } from "@/types"

const RECURRENCE_RULES: { value: RecurrenceRule; label: string }[] = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Every 2 weeks" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
]

function randomColor() {
  return CATEGORY_COLORS[Math.floor(Math.random() * CATEGORY_COLORS.length)]
}

export function AddTransactionForm() {
  const router = useRouter()
  const { data: categories } = useCategories()
  const { data: groups } = useGroups()
  const createM = useCreateTransaction()
  const createCatM = useCreateCategory()

  const [type, setType] = useState<TransactionType>("EXPENSE")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [date, setDate] = useState<Date>(new Date())
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>("MONTHLY")
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("")
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  // Inline new category state
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [newCatColor, setNewCatColor] = useState(randomColor)
  const [newCatGroupId, setNewCatGroupId] = useState<string>("none")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) return
    if (!categoryId) return

    await createM.mutateAsync({
      type,
      amount: numAmount,
      description,
      categoryId,
      date: date.toISOString(),
      isRecurring,
      recurrenceRule: isRecurring ? recurrenceRule : null,
      recurrenceEndDate: isRecurring && recurrenceEndDate ? new Date(recurrenceEndDate).toISOString() : null,
    } as Parameters<typeof createM.mutateAsync>[0])

    router.back()
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return
    const cat = await createCatM.mutateAsync({
      name: newCatName.trim(),
      color: newCatColor,
      type,
      groupId: newCatGroupId === "none" ? null : newCatGroupId,
    })
    setCategoryId(cat.id)
    setNewCatName("")
    setNewCatColor(randomColor())
    setNewCatGroupId("none")
    setShowNewCat(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 py-4">
      {/* Type toggle */}
      <div className="flex rounded-lg bg-muted p-1 gap-1">
        {(["EXPENSE", "INCOME"] as TransactionType[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setType(t); setCategoryId("") }}
            className={cn(
              "flex-1 py-2 text-sm font-medium rounded-md transition-colors",
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

      {/* Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₪</span>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="pl-7"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="e.g. Groceries, Salary..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select
          value={categoryId}
          onValueChange={(v) => {
            if (v === "__new__") {
              setShowNewCat(true)
            } else {
              setCategoryId(v)
              setShowNewCat(false)
            }
          }}
        >
          <SelectTrigger>
            <SelectValue>
              {(value: string | null) => {
                if (!value || value === "__new__") return "Select category"
                const cat = categories?.find((c) => c.id === value)
                if (!cat) return "Select category"
                return (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color ?? "#6b7280" }} />
                    {cat.name}
                  </div>
                )
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories?.filter((c) => c.type === type).map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color ?? "#6b7280" }} />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
            <SelectItem value="__new__">
              <div className="flex items-center gap-2 text-primary">
                <Plus size={12} />
                New category
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Inline new category form */}
        {showNewCat && (
          <div className="flex flex-col gap-3 p-3 bg-muted/50 rounded-lg border border-border mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="newCatName">Name</Label>
              <Input
                id="newCatName"
                placeholder="e.g. Groceries"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCatColor(c)}
                    className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                    style={{
                      backgroundColor: c,
                      outline: newCatColor === c ? `2px solid ${c}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Group (optional)</Label>
              <Select value={newCatGroupId} onValueChange={(v) => setNewCatGroupId(v ?? "none")}>
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowNewCat(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={createCatM.isPending || !newCatName.trim()}
                onClick={handleCreateCategory}
              >
                {createCatM.isPending ? "Saving..." : "Create"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label>Date</Label>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger render={<Button variant="outline" className="w-full justify-start text-left font-normal" />}>
            <CalendarIcon size={14} className="mr-2" />
            {format(date, "PPP")}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3">
              <Input
                type="date"
                value={format(date, "yyyy-MM-dd")}
                onChange={(e) => {
                  if (e.target.value) {
                    setDate(new Date(e.target.value + "T12:00:00"))
                    setDatePickerOpen(false)
                  }
                }}
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Recurring toggle */}
      <div className="flex items-center justify-between">
        <Label htmlFor="recurring" className="cursor-pointer">
          Recurring
        </Label>
        <button
          type="button"
          id="recurring"
          role="switch"
          aria-checked={isRecurring}
          onClick={() => setIsRecurring(!isRecurring)}
          className={cn(
            "relative w-10 h-5.5 rounded-full transition-colors",
            isRecurring ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform",
              isRecurring && "translate-x-4.5"
            )}
          />
        </button>
      </div>

      {/* Recurrence options */}
      {isRecurring && (
        <div className="space-y-3 pl-1 border-l-2 border-muted ml-1">
          <div className="space-y-1.5">
            <Label>Repeats</Label>
            <Select
              value={recurrenceRule}
              onValueChange={(v) => v && setRecurrenceRule(v as RecurrenceRule)}
            >
              <SelectTrigger>
                <SelectValue>
                  {(value: string | null) =>
                    RECURRENCE_RULES.find((r) => r.value === value)?.label ?? value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {RECURRENCE_RULES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="endDate">End date (optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={recurrenceEndDate}
              onChange={(e) => setRecurrenceEndDate(e.target.value)}
            />
          </div>
        </div>
      )}

      <Button type="submit" className="mt-2" disabled={createM.isPending || !categoryId}>
        {createM.isPending ? "Saving..." : `Add ${type === "INCOME" ? "Income" : "Expense"}`}
      </Button>
    </form>
  )
}
