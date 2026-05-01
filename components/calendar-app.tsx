"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Settings, ChevronDown, Eye, EyeOff, Plus, LogOut } from "lucide-react"
import { CalendarGrid } from "@/components/calendar-grid"
import { MonthTabs } from "@/components/month-tabs"
import { EmojiPicker } from "@/components/emoji-picker"
import { EntryModal } from "@/components/entry-modal"
import { SettingsModal } from "@/components/settings-modal"
import { ShapedCalendarCard } from "@/components/shaped-calendar-card"
import { LoginScreen } from "@/components/login-screen"
import { useAuth } from "@/components/auth-provider"
import { subscribeUserData, saveUserData, migrateFromLocalStorage } from "@/lib/firestore"
import { cn } from "@/lib/utils"

function getAdjustedToday(dayStartHour: number): Date {
  const now = new Date()
  if (dayStartHour > 0 && now.getHours() < dayStartHour) {
    const prev = new Date(now)
    prev.setDate(prev.getDate() - 1)
    return prev
  }
  return now
}

function emojiKey(year: number, month: number) {
  return `${year}-${month}`
}

export function CalendarApp() {
  const { user, authLoading, signOut } = useAuth()

  const [dayStartHour, setDayStartHour] = useState(0)
  const today = getAdjustedToday(dayStartHour)

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth())
  const [calAnimKey, setCalAnimKey] = useState(0)
  const [calAnim, setCalAnim] = useState<"from-left" | "from-right" | null>(null)
  const swipeStartX = useRef<number | null>(null)

  const [emojiData, setEmojiData] = useState<Record<string, Record<string, string>>>({})
  const [textData, setTextData] = useState<Record<string, Record<string, string>>>({})
  const [dataLoaded, setDataLoaded] = useState(false)

  const [pickerState, setPickerState] = useState<{ day: number; year: number; month: number } | null>(null)
  const [modalState, setModalState] = useState<{ day: number; year: number; month: number; isEditing: boolean } | null>(null)
  const [showYearPicker, setShowYearPicker] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [hideDates, setHideDates] = useState(false)

  // Firestore 저장 디바운스 ref
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- Firestore 구독 ---
  useEffect(() => {
    if (!user) {
      setDataLoaded(false)
      return
    }

    let firstSnapshot = true

    const unsubscribe = subscribeUserData(user.uid, async (data) => {
      if (data === null && firstSnapshot) {
        // 최초 로그인: localStorage 데이터를 Firestore로 마이그레이션
        firstSnapshot = false
        await migrateFromLocalStorage(user.uid)
        // 마이그레이션 후 onSnapshot이 다시 호출됨
        return
      }
      firstSnapshot = false

      if (data) {
        setEmojiData(data.emojis)
        setTextData(data.texts)
        setDayStartHour(data.dayStartHour)
      }
      setDataLoaded(true)
    })

    return () => {
      unsubscribe()
      setDataLoaded(false)
    }
  }, [user])

  // --- Firestore 저장 (디바운스 500ms) ---
  const scheduleSave = useCallback(
    (emojis: Record<string, Record<string, string>>, texts: Record<string, Record<string, string>>) => {
      if (!user) return
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        saveUserData(user.uid, { emojis, texts }).catch(console.error)
      }, 500)
    },
    [user]
  )

  // --- 월 네비게이션 ---
  const navMonth = useCallback((dir: "prev" | "next") => {
    setCalAnim(dir === "next" ? "from-right" : "from-left")
    setCalAnimKey((k) => k + 1)
    if (dir === "next") {
      setViewMonth((m) => { if (m === 11) { setViewYear((y) => y + 1); return 0 } return m + 1 })
    } else {
      setViewMonth((m) => { if (m === 0) { setViewYear((y) => y - 1); return 11 } return m - 1 })
    }
  }, [])

  const handleMonthTabSelect = useCallback((m: number) => {
    if (m === viewMonth) return
    setCalAnim(m > viewMonth ? "from-right" : "from-left")
    setCalAnimKey((k) => k + 1)
    setViewMonth(m)
  }, [viewMonth])

  const onSwipeTouchStart = (e: React.TouchEvent) => { swipeStartX.current = e.touches[0].clientX }
  const onSwipeTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null) return
    const dx = e.changedTouches[0].clientX - swipeStartX.current
    if (dx < -50) navMonth("next")
    else if (dx > 50) navMonth("prev")
    swipeStartX.current = null
  }
  const onSwipeMouseDown = (e: React.MouseEvent) => {
    const startX = e.clientX
    const onUp = (ev: MouseEvent) => {
      const dx = ev.clientX - startX
      if (dx < -50) navMonth("next")
      else if (dx > 50) navMonth("prev")
      document.removeEventListener("mouseup", onUp)
    }
    document.addEventListener("mouseup", onUp)
  }

  const currentEmojis = emojiData[emojiKey(viewYear, viewMonth)] ?? {}
  const currentTexts = textData[emojiKey(viewYear, viewMonth)] ?? {}

  // --- 날짜 클릭 ---
  const handleDayClick = (day: number) => {
    const hasEmoji = !!emojiData[emojiKey(viewYear, viewMonth)]?.[day]
    if (hasEmoji) {
      setModalState({ day, year: viewYear, month: viewMonth, isEditing: true })
    } else {
      setPickerState({ day, year: viewYear, month: viewMonth })
    }
  }

  // --- 이모지 선택 (Trigger A) ---
  const handleEmojiSelect = (emoji: string) => {
    if (!pickerState) return
    const key = emojiKey(pickerState.year, pickerState.month)
    const newEmojis = { ...emojiData, [key]: { ...(emojiData[key] ?? {}), [pickerState.day]: emoji } }
    setEmojiData(newEmojis)
    scheduleSave(newEmojis, textData)
    const { day, year, month } = pickerState
    setPickerState(null)
    setModalState({ day, year, month, isEditing: false })
  }

  const handleClear = () => {
    if (!pickerState) return
    const key = emojiKey(pickerState.year, pickerState.month)
    const updated = { ...(emojiData[key] ?? {}) }
    delete updated[pickerState.day]
    const newEmojis = { ...emojiData, [key]: updated }
    setEmojiData(newEmojis)
    scheduleSave(newEmojis, textData)
    setPickerState(null)
  }

  // --- 모달 저장 ---
  const handleModalSave = (emoji: string, text: string, newDate: Date) => {
    if (!modalState) return
    const oldKey = emojiKey(modalState.year, modalState.month)
    const newKey = emojiKey(newDate.getFullYear(), newDate.getMonth())
    const newDay = newDate.getDate()

    let newEmojis = { ...emojiData }
    let newTexts = { ...textData }

    // 날짜가 바뀐 경우 기존 날짜에서 삭제
    if (oldKey !== newKey || modalState.day !== newDay) {
      const updatedOldEmojis = { ...(newEmojis[oldKey] ?? {}) }
      delete updatedOldEmojis[modalState.day]
      newEmojis = { ...newEmojis, [oldKey]: updatedOldEmojis }

      const updatedOldTexts = { ...(newTexts[oldKey] ?? {}) }
      delete updatedOldTexts[modalState.day]
      newTexts = { ...newTexts, [oldKey]: updatedOldTexts }
    }

    newEmojis = { ...newEmojis, [newKey]: { ...(newEmojis[newKey] ?? {}), [newDay]: emoji } }
    newTexts = { ...newTexts, [newKey]: { ...(newTexts[newKey] ?? {}), [newDay]: text } }

    setEmojiData(newEmojis)
    setTextData(newTexts)
    scheduleSave(newEmojis, newTexts)
    setModalState(null)
  }

  // --- 모달 삭제 ---
  const handleModalDelete = () => {
    if (!modalState) return
    const key = emojiKey(modalState.year, modalState.month)

    const newEmojis = { ...emojiData }
    const updatedEmojis = { ...(newEmojis[key] ?? {}) }
    delete updatedEmojis[modalState.day]
    newEmojis[key] = updatedEmojis

    const newTexts = { ...textData }
    const updatedTexts = { ...(newTexts[key] ?? {}) }
    delete updatedTexts[modalState.day]
    newTexts[key] = updatedTexts

    setEmojiData(newEmojis)
    setTextData(newTexts)
    scheduleSave(newEmojis, newTexts)
    setModalState(null)
  }

  // --- 하루 시작 시간 변경 ---
  const handleChangeDayStartHour = (hour: number) => {
    setDayStartHour(hour)
    if (user) {
      saveUserData(user.uid, { dayStartHour: hour }).catch(console.error)
    }
  }

  const years = [2024, 2025, 2026, 2027]

  // --- 인증 로딩 중 ---
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    )
  }

  // --- 로그인 안 된 경우 ---
  if (!user) {
    return <LoginScreen />
  }

  // --- 데이터 로딩 중 ---
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    )
  }

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
                <EyeOff className="w-6 h-6" strokeWidth={1} />
              ) : (
                <Eye className="w-6 h-6" strokeWidth={1} />
              )}
            </button>
            <button
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Settings"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-6 h-6" strokeWidth={1} />
            </button>
            {/* 유저 프로필 / 로그아웃 */}
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName ?? "profile"}
                className="w-7 h-7 rounded-full opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => signOut()}
                title="로그아웃"
              />
            ) : (
              <button
                className="text-white/60 hover:text-white transition-colors"
                aria-label="로그아웃"
                onClick={() => signOut()}
              >
                <LogOut className="w-6 h-6" strokeWidth={1} />
              </button>
            )}
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

        {/* Month tabs + Calendar card */}
        <div className="flex-1 flex flex-col justify-center" style={{ maxWidth: "390px", margin: "0 auto", width: "100%" }}>
          <div className="mb-2 -mx-4">
            <MonthTabs selectedMonth={viewMonth} onSelect={handleMonthTabSelect} />
          </div>
          {/* Fixed-height wrapper = max 6-row card height (408px) */}
          <div className="w-full" style={{ minHeight: 408 }}>
            <div
              key={calAnimKey}
              className="w-full overflow-hidden"
              style={{
                animation: calAnim === "from-right"
                  ? "calFromRight 280ms ease-out forwards"
                  : calAnim === "from-left"
                  ? "calFromLeft 280ms ease-out forwards"
                  : undefined,
              }}
              onTouchStart={onSwipeTouchStart}
              onTouchEnd={onSwipeTouchEnd}
              onMouseDown={onSwipeMouseDown}
            >
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
        <Plus className="w-7 h-7 text-black" strokeWidth={1.5} />
      </button>

      {/* Trigger A: Emoji picker */}
      {pickerState && (
        <EmojiPicker
          date={new Date(pickerState.year, pickerState.month, pickerState.day)}
          currentEmoji={undefined}
          onSelect={handleEmojiSelect}
          onClear={handleClear}
          onClose={() => setPickerState(null)}
        />
      )}

      {/* Entry modal */}
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
        <div className="fixed inset-0 z-30" onClick={() => setShowYearPicker(false)} />
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
