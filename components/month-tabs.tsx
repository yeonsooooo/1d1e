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

  // Center the selected tab within the scroll container
  useEffect(() => {
    const container = containerRef.current
    const tab = tabRefs.current[selectedMonth]
    if (!container || !tab) return

    container.scrollTo({ left: tab.offsetLeft - 16, behavior: "smooth" })
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
        scrollSnapType: "x mandatory",
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
              "flex-shrink-0 px-5 py-1 rounded-full text-[28px] transition-all duration-200",
              isSelected
                ? "bg-black text-white font-bold"
                : "border border-[#505050] text-[#999999] font-light hover:text-white"
            )}
            style={{ scrollSnapAlign: "center" }}
          >
            {name}
          </button>
        )
      })}
    </div>
  )
}
