"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddTransactionForm } from "@/components/forms/AddTransactionForm"

export default function AddTransactionPage() {
  const router = useRouter()

  return (
    <main className="flex flex-col max-w-lg mx-auto w-full">
      <div className="flex items-center gap-2 px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ChevronLeft size={18} />
        </Button>
        <h1 className="text-base font-semibold">Add Transaction</h1>
      </div>
      <AddTransactionForm />
    </main>
  )
}
