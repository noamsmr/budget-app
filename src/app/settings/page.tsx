"use client"

import { signOut, useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, LogOut, Tag, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <main className="flex flex-col max-w-lg mx-auto w-full">
      <div className="px-4 py-3">
        <h1 className="text-base font-semibold">Settings</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Profile */}
        {session?.user && (
          <div className="flex items-center gap-3 py-3 px-4 bg-card rounded-xl border border-border/50">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                {session.user.name?.[0] ?? "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="space-y-1">
          <Link
            href="/categories"
            className="flex items-center gap-3 py-3 px-4 bg-card rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
          >
            <Tag size={16} className="text-muted-foreground" />
            <span className="flex-1 text-sm">Categories</span>
            <ChevronRight size={14} className="text-muted-foreground" />
          </Link>
          <Link
            href="/groups"
            className="flex items-center gap-3 py-3 px-4 bg-card rounded-xl border border-border/50 hover:bg-muted/50 transition-colors"
          >
            <FolderOpen size={16} className="text-muted-foreground" />
            <span className="flex-1 text-sm">Groups</span>
            <ChevronRight size={14} className="text-muted-foreground" />
          </Link>
        </div>

        {/* Sign out */}
        <Button
          variant="outline"
          className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut size={14} />
          Sign out
        </Button>
      </div>
    </main>
  )
}
