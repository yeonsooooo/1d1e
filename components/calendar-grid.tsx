"use client"

import { cn } from "@/lib/utils"

const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"]

interface CalendarGridProps {
  year: number
  month: number // 0-indexed
  today: Date
  emojiMap: Record<number, string> // day number -> emoji
  onDayClick: (day: number) => void
  hideDates?: boolean
  holidays?: Set<string> // "YYYY-MM-DD"
}

export function CalendarGrid({ year, month, today, emojiMap, onDayClick, hideDates = false, holidays }: CalendarGridProps) {
  const firstDay = new Date(year, month, 1).getDay() // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const isToday = (day: number) =>
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day

  // Build cells: null for empty leading/trailing slots, day number for current month
  const cells: (number | null)[] = []

  for (let i = 0; i < firstDay; i++) {
    cells.push(null)
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d)
  }
  // Pad to complete the last row with nulls
  const remaining = (7 - (cells.length % 7)) % 7
  for (let i = 0; i < remaining; i++) {
    cells.push(null)
  }

  const rows: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }

  return (
    <div className="w-full">
      {/* Day headers — 24px bold with 50% opacity */}
      <div className="grid grid-cols-7 gap-0.5 mb-3">
        {DAY_HEADERS.map((h, i) => (
          <div
            key={i}
            className={cn(
              "text-center text-[22px] font-bold leading-none py-1",
              i === 0 ? "text-[#C191FF] opacity-50" : "text-white opacity-50"
            )}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Calendar rows — 12px gap between rows, 2px between columns */}
      <div className="flex flex-col gap-3">
        {rows.map((row, ri) => (
          <div key={ri} className="grid grid-cols-7 gap-0.5">
            {row.map((day, ci) => {
              // Blank cell — completely empty, no interaction
              if (day === null) {
                return <div key={ci} className="w-[46px] h-[46px]" aria-hidden="true" />
              }

              const isSunday = ci === 0
              const todayCell = isToday(day)
              const emoji = emojiMap[day]
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
              const isHoliday = holidays?.has(dateStr) ?? false

              return (
                <button
                  key={ci}
                  onClick={() => onDayClick(day)}
                  className={cn(
                    "flex items-center justify-center w-[46px] h-[46px] text-[24px] font-light select-none",
                    "transition-opacity duration-150 cursor-pointer hover:opacity-70"
                  )}
                  aria-label={`${day}${emoji ? ` - ${emoji}` : ""}`}
                >
                  {todayCell && !hideDates ? (
                    // Today: white circle wrapping emoji or date number
                    <span className="flex items-center justify-center w-11 h-11 rounded-full bg-white text-black font-light text-[24px]">
                      {emoji
                        ? <span className="text-[28px] leading-none">{emoji}</span>
                        : day
                      }
                    </span>
                  ) : emoji ? (
                    // Has emoji: show emoji plainly
                    <span className="text-[28px] leading-none">{emoji}</span>
                  ) : hideDates ? (
                    // Hide-dates mode, no emoji: small dot
                    <span className="text-white/30 text-xl leading-none select-none">•</span>
                  ) : (
                    // Normal date number — 24px light
                    <span className={cn(
                      "text-[24px] font-light",
                      isSunday || isHoliday ? "text-[#C191FF]" : "text-white"
                    )}>
                      {day}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
