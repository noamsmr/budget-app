"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface ChartSlice {
  id: string
  name: string
  value: number
  color: string
}

interface PieChartCardProps {
  title: string
  total: number
  data: ChartSlice[]
  activeIds: string[]
  onSliceClick: (id: string) => void
  emptyMessage?: string
}

const FALLBACK_COLOR = "#6366f1"

export function PieChartCard({
  title,
  total,
  data,
  activeIds,
  onSliceClick,
  emptyMessage = "No data",
}: PieChartCardProps) {
  const hasFilters = activeIds.length > 0

  const isEmpty = data.length === 0 || total === 0

  return (
    <div className="flex flex-col items-center gap-2 px-4 w-full">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-semibold tabular-nums">{formatCurrency(total)}</p>

      {isEmpty ? (
        <div className="flex items-center justify-center h-40 w-full">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              onClick={(entry) => onSliceClick((entry as unknown as ChartSlice).id)}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={entry.color || FALLBACK_COLOR}
                  opacity={hasFilters && !activeIds.includes(entry.id) ? 0.25 : 1}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-center max-w-xs">
        {data.slice(0, 5).map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSliceClick(entry.id)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor: entry.color || FALLBACK_COLOR,
                opacity: hasFilters && !activeIds.includes(entry.id) ? 0.3 : 1,
              }}
            />
            <span
              className={
                hasFilters && !activeIds.includes(entry.id) ? "opacity-30" : ""
              }
            >
              {entry.name}
            </span>
          </button>
        ))}
        {data.length > 5 && (
          <span className="text-xs text-muted-foreground">+{data.length - 5} more</span>
        )}
      </div>
    </div>
  )
}
