"use client"

import { cn } from "@/lib/utils"

interface SlideDotsProps {
  count: number
  active: number
  onSelect: (index: number) => void
}

export function SlideDots({ count, active, onSelect }: SlideDotsProps) {
  return (
    <div className="flex justify-center gap-1.5 py-3">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={cn(
            "rounded-full transition-all",
            i === active
              ? "w-4 h-1.5 bg-primary"
              : "w-1.5 h-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
          )}
          aria-label={`Go to slide ${i + 1}`}
        />
      ))}
    </div>
  )
}
