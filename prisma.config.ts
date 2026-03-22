import "dotenv/config"
import { defineConfig } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
    // Use DIRECT_URL for direct connections (bypassing connection pooling)
    // Required for Neon with pgBouncer
    ...(process.env["DIRECT_URL"] ? { url: process.env["DIRECT_URL"] } : {}),
  },
})
