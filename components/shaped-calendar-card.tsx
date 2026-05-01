"use client"

import { useRef, useState, useLayoutEffect, useId } from "react"

interface ShapedCalendarCardProps {
  year: number
  month: number // 0-indexed
  children: React.ReactNode
  className?: string
}

const HEADER_H = 36  // day-labels row height (py-2 + text = ~36px)
const ROW_H = 46     // each calendar row (h-[46px])
const GAP = 12       // gap-3 between rows, and mb-3 after header (both 12px)
const PAD = 12       // uniform padding on all four sides (card padding: 12px)
const R = 36         // corner radius

/**
 * Build an SVG path string for the L-shaped / stair-step card.
 *
 * The shape:
 *   - Full-width rectangle for all rows except the last
 *   - Last row: only spans from left edge to (lastColIndex + 1) * cellW
 *     creating a step cutout at bottom-right
 *
 * All outer corners are rounded with radius R.
 * The inner step corner (top-right of the short last row) has a concave
 * fillet — achieved with a small arc turning the other way.
 */
function buildPath(
  W: number,        // total card width
  H: number,        // total card height (all rows + padding)
  lastColEnd: number, // x coordinate where last row ends (0..W)
  stepY: number,    // y coordinate where the step begins (top of last row)
  isFullLastRow: boolean // if last row spans full width, no step needed
): string {
  const r = Math.min(R, W / 4, H / 4)
  const sr = r // concave inner step corner — same radius as outer corners

  if (isFullLastRow) {
    // Simple rounded rectangle
    return [
      `M ${r} 0`,
      `L ${W - r} 0`,
      `Q ${W} 0 ${W} ${r}`,
      `L ${W} ${H - r}`,
      `Q ${W} ${H} ${W - r} ${H}`,
      `L ${r} ${H}`,
      `Q 0 ${H} 0 ${H - r}`,
      `L 0 ${r}`,
      `Q 0 0 ${r} 0`,
      `Z`,
    ].join(" ")
  }

  // L-shaped path (clockwise from top-left)
  // Top-left corner → top-right corner → right side down to step →
  // step across → down to bottom-right of short row →
  // bottom-right corner of short row → bottom-left corner → up to start
  return [
    // Start: top-left after radius
    `M ${r} 0`,
    // Top edge →
    `L ${W - r} 0`,
    // Top-right corner
    `Q ${W} 0 ${W} ${r}`,
    // Right edge down to where step begins
    `L ${W} ${stepY - sr}`,
    // Concave inner corner at top-right of step (curves inward)
    `Q ${W} ${stepY} ${W - sr} ${stepY}`,
    // Step horizontal edge ← to where short row ends
    `L ${lastColEnd + sr} ${stepY}`,
    // Concave inner corner at top-left of cutout (curves inward)
    `Q ${lastColEnd} ${stepY} ${lastColEnd} ${stepY + sr}`,
    // Short right edge down to bottom of last row
    `L ${lastColEnd} ${H - r}`,
    // Bottom-right corner of short row
    `Q ${lastColEnd} ${H} ${lastColEnd - r} ${H}`,
    // Bottom edge ←
    `L ${r} ${H}`,
    // Bottom-left corner
    `Q 0 ${H} 0 ${H - r}`,
    // Left edge up to start
    `L 0 ${r}`,
    // Top-left corner
    `Q 0 0 ${r} 0`,
    `Z`,
  ].join(" ")
}

export function ShapedCalendarCard({ year, month, children, className }: ShapedCalendarCardProps) {
  const clipId = useId().replace(/:/g, "")
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width)
    })
    obs.observe(el)
    setWidth(el.getBoundingClientRect().width)
    return () => obs.disconnect()
  }, [])

  // Compute grid geometry
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = firstDay + daysInMonth
  const numRows = Math.ceil(totalCells / 7)
  const lastDayCol = (firstDay + daysInMonth - 1) % 7  // 0-indexed col of last day

  // Card dimensions — PAD applied uniformly on all sides
  const contentW = width
  const gridW = contentW - PAD * 2          // grid sits inside left+right padding
  const cellW = gridW / 7
  // cardH includes: top PAD + header + mb-3 (GAP) + rows with gaps between them + bottom PAD
  const cardH = PAD * 2 + HEADER_H + numRows * (ROW_H + GAP)

  // x where last row ends: left pad + (col+1) cells + right pad
  const lastColEnd = PAD + (lastDayCol + 1) * cellW + PAD
  // y where the last row top sits: PAD + header + mb-3 + (numRows-1) rows with gaps
  const stepY = PAD + HEADER_H + GAP + (numRows - 1) * (ROW_H + GAP)

  const isFullLastRow = lastDayCol === 6

  const pathD = width > 0
    ? buildPath(contentW, cardH, lastColEnd, stepY, isFullLastRow)
    : null

  return (
    <div ref={containerRef} className={className} style={{ position: "relative" }}>
      {width > 0 && pathD && (
        <svg
          width={0}
          height={0}
          style={{ position: "absolute", overflow: "hidden" }}
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <path d={pathD} />
            </clipPath>
          </defs>
        </svg>
      )}
      <div
        style={{
          background: "#000000",
          clipPath: width > 0 && pathD ? `url(#${clipId})` : undefined,
          borderRadius: width > 0 && pathD ? 0 : "28px",
          minHeight: cardH > 0 ? cardH : undefined,
          padding: `${PAD}px`,
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
    </div>
  )
}
