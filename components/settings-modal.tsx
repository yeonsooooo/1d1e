"use client"

import { useState } from "react"
import { X, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SettingsModalProps {
  dayStartHour: number
  onChangeDayStartHour: (hour: number) => void
  onClose: () => void
}

function formatHour(hour: number): string {
  if (hour === 0) return "자정 (0시)"
  if (hour < 12) return `오전 ${hour}시`
  if (hour === 12) return "오후 12시"
  return `오후 ${hour - 12}시`
}

export function SettingsModal({ dayStartHour, onChangeDayStartHour, onClose }: SettingsModalProps) {
  const [showHourPicker, setShowHourPicker] = useState(false)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60" style={{ zIndex: 40 }} onClick={onClose} />

      {/* Modal card */}
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-[55%] rounded-[28px] bg-[#3a3a3a] flex flex-col overflow-hidden"
        style={{ zIndex: 50, maxWidth: 390, margin: "0 auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <span className="text-white font-bold text-base">설정</span>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors w-10 h-10 flex items-center justify-end"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* Settings list */}
        <div className="px-5 pb-6">
          {/* Day start hour row */}
          <button
            onClick={() => setShowHourPicker((v) => !v)}
            className="flex items-center justify-between w-full py-4"
          >
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-white text-base">오늘 시작 시간</span>
              <span className="text-white/40 text-xs">
                이 시간부터 새로운 날로 인식해요
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="text-white/60 text-sm">{formatHour(dayStartHour)}</span>
              <ChevronRight
                className={cn(
                  "w-4 h-4 text-white/30 transition-transform duration-200",
                  showHourPicker && "rotate-90"
                )}
                strokeWidth={1.5}
              />
            </div>
          </button>

          {/* Hour picker list */}
          {showHourPicker && (
            <div className="mt-2 max-h-52 overflow-y-auto rounded-2xl bg-[#2a2a2a]">
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <button
                  key={hour}
                  onClick={() => {
                    onChangeDayStartHour(hour)
                    setShowHourPicker(false)
                  }}
                  className={cn(
                    "w-full text-left px-5 py-3 text-sm transition-colors",
                    hour === dayStartHour
                      ? "text-white font-bold"
                      : "text-white/50 hover:text-white"
                  )}
                >
                  {formatHour(hour)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
