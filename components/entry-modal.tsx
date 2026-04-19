"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Trash2, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { EmojiPicker } from "@/components/emoji-picker"
import { cn } from "@/lib/utils"

interface EntryModalProps {
  date: Date
  initialEmoji?: string
  initialText?: string
  /** true = editing existing entry (Trigger B), false = new entry (Trigger A) */
  isEditing: boolean
  hasEntryForDate?: (date: Date) => boolean
  onSave: (emoji: string, text: string, date: Date) => void
  onDelete?: () => void
  onClose: () => void
}

const MONTH_NAMES = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
]
const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"]

function formatKoreanDate(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}년 ${month}월 ${day}일`
}

function buildCells(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  const rem = (7 - (cells.length % 7)) % 7
  for (let i = 0; i < rem; i++) cells.push(null)
  return cells
}

export function EntryModal({
  date,
  initialEmoji = "",
  initialText = "",
  isEditing,
  hasEntryForDate,
  onSave,
  onDelete,
  onClose,
}: EntryModalProps) {
  const [emoji, setEmoji] = useState(initialEmoji)
  const [text, setText] = useState(initialText)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState(date)
  const [pickerYear, setPickerYear] = useState(date.getFullYear())
  const [pickerMonth, setPickerMonth] = useState(date.getMonth())
  const [showConflictConfirm, setShowConflictConfirm] = useState(false)
  const [pendingDate, setPendingDate] = useState<Date | null>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 키보드 높이 감지 — visualViewport API
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKeyboardHeight(kb)
    }
    vv.addEventListener("resize", update)
    vv.addEventListener("scroll", update)
    return () => {
      vv.removeEventListener("resize", update)
      vv.removeEventListener("scroll", update)
    }
  }, [])

  const updateScrollIndicators = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    setCanScrollUp(el.scrollTop > 2)
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 2)
  }, [])

  const handleSave = () => {
    if (!emoji) return
    onSave(emoji, text, selectedDate)
  }

  const handleEmojiSelected = (selected: string) => {
    setEmoji(selected)
    setShowEmojiPicker(false)
  }

  const handleDaySelect = (day: number) => {
    const newDate = new Date(pickerYear, pickerMonth, day)
    const isOriginal =
      newDate.getFullYear() === date.getFullYear() &&
      newDate.getMonth() === date.getMonth() &&
      newDate.getDate() === date.getDate()
    if (!isOriginal && hasEntryForDate?.(newDate)) {
      setPendingDate(newDate)
      setShowConflictConfirm(true)
    } else {
      setSelectedDate(newDate)
      setShowDatePicker(false)
    }
  }

  const prevMonth = () => {
    if (pickerMonth === 0) { setPickerMonth(11); setPickerYear(y => y - 1) }
    else setPickerMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (pickerMonth === 11) { setPickerMonth(0); setPickerYear(y => y + 1) }
    else setPickerMonth(m => m + 1)
  }

  const cells = buildCells(pickerYear, pickerMonth)
  const rows: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))

  const canSave = emoji.length > 0

  return (
    <>
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating detached card */}
      <div
        className="fixed inset-x-4 z-50 rounded-[32px] bg-[#3a3a3a] flex flex-col overflow-hidden"
        style={{
          maxWidth: 420,
          margin: "0 auto",
          ...(keyboardHeight > 0
            ? { bottom: keyboardHeight + 8, top: "auto", transform: "none" }
            : { top: "50%", transform: "translateY(-55%)" }
          ),
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="일기 항목"
      >
        {/* Top nav */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors w-10 h-10 flex items-center justify-start"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>

          {/* Date button with chevron */}
          <button
            onClick={() => setShowDatePicker(v => !v)}
            className="flex items-center gap-1 group flex-1 justify-center"
            aria-label="날짜 변경"
          >
            <span className="text-white font-bold text-base">
              {formatKoreanDate(selectedDate)}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-white/60 transition-transform duration-200",
                showDatePicker && "rotate-180"
              )}
              strokeWidth={1.5}
            />
          </button>

          {isEditing && onDelete ? (
            <button
              onClick={onDelete}
              className="w-10 h-10 flex items-center justify-end hover:opacity-70 transition-opacity"
              style={{ color: "#FF5F57" }}
            >
              <Trash2 className="w-5 h-5" strokeWidth={1.5} />
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>

        {/* Date picker — absolute overlay covering modal body */}
        {showDatePicker && (
          <div
            className="absolute inset-x-0 rounded-[28px] bg-[#3a3a3a] z-10 p-4"
            style={{ top: 60 }}
            onClick={(e) => e.stopPropagation()}
          >
          <div className="rounded-2xl bg-[#2a2a2a] p-4">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="text-white/60 hover:text-white p-1">
                <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <span className="text-white text-sm font-semibold">
                {MONTH_NAMES[pickerMonth]} {pickerYear}
              </span>
              <button onClick={nextMonth} className="text-white/60 hover:text-white p-1">
                <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Day labels */}
            <div className="grid grid-cols-7 mb-1">
              {DAY_LABELS.map((l, i) => (
                <div key={i} className={cn(
                  "text-center text-[11px] font-bold py-1 opacity-40",
                  i === 0 ? "text-[#C191FF]" : "text-white"
                )}>
                  {l}
                </div>
              ))}
            </div>

            {/* Date grid */}
            {rows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-7">
                {row.map((day, ci) => {
                  if (!day) return <div key={ci} className="h-9" />
                  const isSelected =
                    day === selectedDate.getDate() &&
                    pickerMonth === selectedDate.getMonth() &&
                    pickerYear === selectedDate.getFullYear()
                  const isSunday = ci === 0
                  return (
                    <button
                      key={ci}
                      onClick={() => handleDaySelect(day)}
                      className={cn(
                        "h-9 w-full flex items-center justify-center rounded-full text-[13px] transition-colors",
                        isSelected
                          ? "bg-white text-black font-bold"
                          : isSunday
                          ? "text-[#C191FF] hover:bg-white/10"
                          : "text-white hover:bg-white/10"
                      )}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          </div>
        )}

        {/* Emoji circle */}
        <div className="flex justify-center pt-4 pb-4">
          <button
            onClick={() => setShowEmojiPicker(true)}
            className="w-36 h-36 rounded-full bg-[#2a2a2a] flex items-center justify-center active:opacity-70 transition-opacity"
            aria-label={emoji ? "이모지 변경" : "이모지 선택"}
          >
            {emoji ? (
              <span className="text-7xl leading-none">{emoji}</span>
            ) : (
              <span className="text-white/30 text-5xl leading-none select-none">+</span>
            )}
          </button>
        </div>

        {/* Textarea with scroll gradient indicators */}
        <div className="relative flex-1 min-h-0">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => { setText(e.target.value); setTimeout(updateScrollIndicators, 0) }}
            onScroll={updateScrollIndicators}
            placeholder="일기 쓰고 싶은 날엔 여기에 쓸 수 있어요"
            className="w-full h-full bg-transparent text-white text-base leading-relaxed placeholder:text-white/30 resize-none outline-none px-5 min-h-[180px]"
            style={{ fontFamily: "inherit", paddingTop: 20, paddingBottom: 20 }}
          />
          {/* Top fade */}
          {canScrollUp && (
            <div
              className="absolute top-0 left-0 right-0 h-10 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, #3a3a3a, transparent)" }}
            />
          )}
          {/* Bottom fade */}
          {canScrollDown && (
            <div
              className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
              style={{ background: "linear-gradient(to top, #3a3a3a, transparent)" }}
            />
          )}
        </div>

        {/* Save button — filled, bottom */}
        <div className="px-5 pb-5 pt-1">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-3 rounded-2xl bg-white text-black text-base font-bold transition-opacity disabled:opacity-30"
          >
            저장
          </button>
        </div>
      </div>

      {/* Emoji picker — rendered on top of modal */}
      {showEmojiPicker && (
        <EmojiPicker
          date={selectedDate}
          currentEmoji={emoji || undefined}
          onSelect={handleEmojiSelected}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      {/* Conflict confirmation popup */}
      {showConflictConfirm && (
        <>
          <div className="fixed inset-0 bg-black/60" style={{ zIndex: 60 }} onClick={() => setShowConflictConfirm(false)} aria-hidden="true" />
          <div
            className="fixed inset-x-8 top-1/2 -translate-y-1/2 rounded-2xl bg-[#3a3a3a] p-6 flex flex-col gap-5"
            style={{ zIndex: 70, maxWidth: 320, margin: "0 auto" }}
          >
            <p className="text-white text-base text-center leading-relaxed">
              해당 날짜에 이미 저장된 기록이 있어요.<br />정말 변경하시겠어요?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowConflictConfirm(false); setPendingDate(null) }}
                className="flex-1 py-3 rounded-2xl bg-white/10 text-white text-base font-medium"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (pendingDate) setSelectedDate(pendingDate)
                  setPendingDate(null)
                  setShowConflictConfirm(false)
                  setShowDatePicker(false)
                }}
                className="flex-1 py-3 rounded-2xl bg-white text-black text-base font-bold"
              >
                확인
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
