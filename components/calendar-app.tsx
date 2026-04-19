"use client"

import { useState, useEffect } from "react"
import { Settings, ChevronDown, Eye, EyeOff } from "lucide-react"
import { CalendarGrid } from "@/components/calendar-grid"
import { MonthTabs } from "@/components/month-tabs"
import { EmojiPicker } from "@/components/emoji-picker"
import { EntryModal } from "@/components/entry-modal"
import { SettingsModal } from "@/components/settings-modal"
import { ShapedCalendarCard } from "@/components/shaped-calendar-card"
import { cn } from "@/lib/utils"

function getStoredDayStartHour(): number {
  if (typeof window === "undefined") return 0
  return parseInt(localStorage.getItem("dayStartHour") ?? "0", 10)
}

function getAdjustedToday(dayStartHour: number): Date {
  const now = new Date()
  if (dayStartHour > 0 && now.getHours() < dayStartHour) {
    const prev = new Date(now)
    prev.setDate(prev.getDate() - 1)
    return prev
  }
  return now
}

const STORAGE_KEY = "1d1e-entries"

function loadEntries() {
  if (typeof window === "undefined") return { emojis: {}, texts: {} }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { emojis: {}, texts: {} }
    const parsed = JSON.parse(raw)
    return {
      emojis: parsed.emojis ?? {},
      texts: parsed.texts ?? {},
    }
  } catch {
    return { emojis: {}, texts: {} }
  }
}

function saveEntries(
  emojis: Record<string, Record<number, string>>,
  texts: Record<string, Record<number, string>>
) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ emojis, texts }))
  } catch {
    // storage quota exceeded 등 무시
  }
}

function emojiKey(year: number, month: number) {
  return `${year}-${month}`
}

export function CalendarApp() {
  const [dayStartHour, setDayStartHour] = useState(getStoredDayStartHour)
  const today = getAdjustedToday(dayStartHour)

  const [viewYear, setViewYear] = useState(() => getAdjustedToday(getStoredDayStartHour()).getFullYear())
  const [viewMonth, setViewMonth] = useState(() => getAdjustedToday(getStoredDayStartHour()).getMonth())
  const [emojiData, setEmojiData] = useState<Record<string, Record<number, string>>>(
    () => loadEntries().emojis
  )
  const [textData, setTextData] = useState<Record<string, Record<number, string>>>(
    () => loadEntries().texts
  )

  // emojiData 또는 textData가 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    saveEntries(emojiData, textData)
  }, [emojiData, textData])

  // pickerState: quick emoji picker (Trigger A — new entry, no emoji yet)
  const [pickerState, setPickerState] = useState<{
    day: number
    year: number
    month: number
  } | null>(null)

  // modalState: full entry modal
  const [modalState, setModalState] = useState<{
    day: number
    year: number
    month: number
    isEditing: boolean
  } | null>(null)

  const [showYearPicker, setShowYearPicker] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [hideDates, setHideDates] = useState(false)

  const currentEmojis = emojiData[emojiKey(viewYear, viewMonth)] ?? {}
  const currentTexts = textData[emojiKey(viewYear, viewMonth)] ?? {}

  const handleDayClick = (day: number) => {
    const hasEmoji = !!emojiData[emojiKey(viewYear, viewMonth)]?.[day]
    if (hasEmoji) {
      // Trigger B: open modal directly with existing data
      setModalState({ day, year: viewYear, month: viewMonth, isEditing: true })
    } else {
      // Trigger A: show emoji picker first
      setPickerState({ day, year: viewYear, month: viewMonth })
    }
  }

  // Called after Trigger A emoji selection — transition to entry modal
  const handleEmojiSelect = (emoji: string) => {
    if (!pickerState) return
    const key = emojiKey(pickerState.year, pickerState.month)
    setEmojiData((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), [pickerState.day]: emoji },
    }))
    const { day, year, month } = pickerState
    setPickerState(null)
    setModalState({ day, year, month, isEditing: false })
  }

  const handleClear = () => {
    if (!pickerState) return
    const key = emojiKey(pickerState.year, pickerState.month)
    setEmojiData((prev) => {
      const updated = { ...(prev[key] ?? {}) }
      delete updated[pickerState.day]
      return { ...prev, [key]: updated }
    })
    setPickerState(null)
  }

  const handleModalSave = (emoji: string, text: string, newDate: Date) => {
    if (!modalState) return
    const oldKey = emojiKey(modalState.year, modalState.month)
    const newKey = emojiKey(newDate.getFullYear(), newDate.getMonth())
    const newDay = newDate.getDate()

    // Remove from old date if date changed
    if (oldKey !== newKey || modalState.day !== newDay) {
      setEmojiData((prev) => {
        const updated = { ...(prev[oldKey] ?? {}) }
        delete updated[modalState.day]
        return { ...prev, [oldKey]: updated }
      })
      setTextData((prev) => {
        const updated = { ...(prev[oldKey] ?? {}) }
        delete updated[modalState.day]
        return { ...prev, [oldKey]: updated }
      })
    }

    setEmojiData((prev) => ({
      ...prev,
      [newKey]: { ...(prev[newKey] ?? {}), [newDay]: emoji },
    }))
    setTextData((prev) => ({
      ...prev,
      [newKey]: { ...(prev[newKey] ?? {}), [newDay]: text },
    }))
    setModalState(null)
  }

  const handleModalDelete = () => {
    if (!modalState) return
    const key = emojiKey(modalState.year, modalState.month)
    setEmojiData((prev) => {
      const updated = { ...(prev[key] ?? {}) }
      delete updated[modalState.day]
      return { ...prev, [key]: updated }
    })
    setTextData((prev) => {
      const updated = { ...(prev[key] ?? {}) }
      delete updated[modalState.day]
      return { ...prev, [key]: updated }
    })
    setModalState(null)
  }

  const handleChangeDayStartHour = (hour: number) => {
    setDayStartHour(hour)
    localStorage.setItem("dayStartHour", String(hour))
  }

  const years = [2024, 2025, 2026, 2027]

  return (
    <div className="relative min-h-screen bg-[#1C1C1E]">
      {/* Mobile frame */}
      <div className="w-full max-w-sm min-h-screen flex flex-col px-4 pt-6 pb-28 relative mx-auto">

        {/* Top bar */}
        <header className="flex items-center justify-between mb-6 px-1">
          <button
            className="flex items-center gap-1.5 group"
            onClick={() => setShowYearPicker(!showYearPicker)}
            aria-label="Select year"
          >
            <span className="text-white text-[24px] font-light">{viewYear}</span>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-white transition-transform duration-200",
                showYearPicker && "rotate-180"
              )}
              strokeWidth={1.5}
            />
          </button>
          <div className="flex items-center gap-6">
            <button
              className={cn(
                "transition-colors",
                hideDates ? "text-white" : "text-white/60 hover:text-white"
              )}
              onClick={() => setHideDates((v) => !v)}
              aria-label={hideDates ? "Show dates" : "Hide dates"}
              aria-pressed={hideDates}
            >
              {hideDates ? (
                <EyeOff className="w-8 h-8" strokeWidth={1} />
              ) : (
                <Eye className="w-8 h-8" strokeWidth={1} />
              )}
            </button>
            <button
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Settings"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-8 h-8" strokeWidth={1} />
            </button>
          </div>
        </header>

        {/* Year picker dropdown */}
        {showYearPicker && (
          <div className="absolute top-16 left-4 z-40 bg-[#1a1a1a] rounded-2xl p-2 shadow-xl border border-white/10">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => {
                  setViewYear(y)
                  setShowYearPicker(false)
                }}
                className={cn(
                  "block w-full text-left px-5 py-2.5 rounded-xl text-base transition-colors",
                  y === viewYear
                    ? "bg-white text-black font-bold"
                    : "text-white hover:bg-white/10"
                )}
              >
                {y}
              </button>
            ))}
          </div>
        )}

        {/* Month tabs + Calendar card — vertically centered in remaining space */}
        <div className="flex-1 flex flex-col justify-center" style={{ maxWidth: '390px', margin: '0 auto', width: '100%' }}>
          <div className="mb-2 -mx-4">
            <MonthTabs selectedMonth={viewMonth} onSelect={setViewMonth} />
          </div>
          <ShapedCalendarCard year={viewYear} month={viewMonth} className="w-full">
            <CalendarGrid
              year={viewYear}
              month={viewMonth}
              today={today}
              emojiMap={currentEmojis}
              onDayClick={handleDayClick}
              hideDates={hideDates}
            />
          </ShapedCalendarCard>
        </div>
      </div>

      {/* Floating "+" button */}
      <button
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform z-30"
        onClick={() => {
          const day = (viewYear === today.getFullYear() && viewMonth === today.getMonth())
            ? today.getDate()
            : 1
          const hasEmoji = !!emojiData[emojiKey(viewYear, viewMonth)]?.[day]
          if (hasEmoji) {
            setModalState({ day, year: viewYear, month: viewMonth, isEditing: true })
          } else {
            setPickerState({ day, year: viewYear, month: viewMonth })
          }
        }}
        aria-label="Add emoji"
      >
        <span className="text-black text-3xl font-light leading-none">+</span>
      </button>

      {/* Trigger A: Emoji picker (new entry — pick emoji first) */}
      {pickerState && (
        <EmojiPicker
          date={new Date(pickerState.year, pickerState.month, pickerState.day)}
          currentEmoji={undefined}
          onSelect={handleEmojiSelect}
          onClear={handleClear}
          onClose={() => setPickerState(null)}
        />
      )}

      {/* Entry modal (shown after emoji selection or when editing existing entry) */}
      {modalState && (
        <EntryModal
          date={new Date(modalState.year, modalState.month, modalState.day)}
          initialEmoji={emojiData[emojiKey(modalState.year, modalState.month)]?.[modalState.day] ?? ""}
          initialText={textData[emojiKey(modalState.year, modalState.month)]?.[modalState.day] ?? ""}
          isEditing={modalState.isEditing}
          hasEntryForDate={(d) => !!emojiData[emojiKey(d.getFullYear(), d.getMonth())]?.[d.getDate()]}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          onClose={() => setModalState(null)}
        />
      )}

      {/* Backdrop for year picker */}
      {showYearPicker && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowYearPicker(false)}
        />
      )}

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          dayStartHour={dayStartHour}
          onChangeDayStartHour={handleChangeDayStartHour}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
