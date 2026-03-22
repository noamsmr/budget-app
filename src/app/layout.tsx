import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/providers/QueryProvider"
import { SessionProvider } from "@/providers/SessionProvider"
import { BottomNav } from "@/components/layout/BottomNav"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Budget",
  description: "Personal budget tracker",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-background text-foreground min-h-screen pb-20 antialiased">
        <SessionProvider>
          <QueryProvider>
            {children}
            <BottomNav />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
