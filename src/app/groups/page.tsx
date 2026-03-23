"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { GroupForm } from "@/components/forms/GroupForm"
import { useGroups, useDeleteGroup } from "@/hooks/useGroups"

export default function GroupsPage() {
  const { data: groups = [], isLoading } = useGroups()
  const deleteM = useDeleteGroup()

  return (
    <main className="flex flex-col max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-base font-semibold">Groups</h1>
      </div>

      <div className="px-4 space-y-3">
        <GroupForm />

        {isLoading ? (
          <div className="text-center py-8">
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No groups yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center gap-3 py-3 px-4 bg-card rounded-xl border border-border/50"
              >
                <span className="flex-1 text-sm font-medium">{group.name}</span>
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
                      <AlertDialogTitle>Delete "{group.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Categories in this group will become ungrouped.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteM.mutate(group.id)}
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
