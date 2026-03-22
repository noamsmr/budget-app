"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { useCategories, useDeleteCategory } from "@/hooks/useCategories"

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories()
  const deleteM = useDeleteCategory()

  return (
    <main className="flex flex-col max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-base font-semibold">Categories</h1>
      </div>

      <div className="px-4 space-y-3">
        <CategoryForm />

        {isLoading ? (
          <div className="text-center py-8">
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No categories yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 py-3 px-4 bg-card rounded-xl border border-border/50"
              >
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
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        disabled={deleteM.isPending}
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
                        onClick={() => deleteM.mutate(cat.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
