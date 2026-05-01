"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
]

interface MonthTabsProps {
  selectedMonth: number // 0-indexed
  onSelect: (month: number) => void
}

export function MonthTabs({ selectedMonth, onSelect }: MonthTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Scroll selected tab to left with 16px margin
  useEffect(() => {
    const container = containerRef.current
    const tab = tabRefs.current[selectedMonth]
    if (!container || !tab) return

    const tabRect = tab.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    // tab's position within scroll content, then offset to leave 16px left margin
    const targetScrollLeft = tabRect.left - containerRect.left + container.scrollLeft - 16
    container.scrollTo({ left: targetScrollLeft, behavior: "smooth" })
  }, [selectedMonth])

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Select month"
      className="flex flex-nowrap gap-1.5 pb-1 pl-4 pr-4 w-full overflow-x-auto"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {MONTHS.map((name, i) => {
        const isSelected = i === selectedMonth
        return (
          <button
            key={i}
            ref={(el) => { tabRefs.current[i] = el }}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onSelect(i)}
            className={cn(
              "flex-shrink-0 px-5 py-1 rounded-full text-[44px] transition-all duration-200",
              isSelected
                ? "bg-black text-white font-bold"
                : "text-[#555555] font-extralight hover:text-white"
            )}
            style={{  }}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
