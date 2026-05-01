"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { X, Trash2, Search, ChevronDown, Smile, Users, PawPrint, UtensilsCrossed, Trophy, Plane, Lightbulb, Heart, Flag, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import emojiByGroup from "unicode-emoji-json/data-by-group.json"

// unicode-emoji-json 그룹 순서에 맞는 아이콘
const GROUP_ICONS: LucideIcon[] = [
  Smile,           // Smileys & Emotion
  Users,           // People & Body
  PawPrint,        // Animals & Nature
  UtensilsCrossed, // Food & Drink
  Plane,           // Travel & Places
  Trophy,          // Activities
  Lightbulb,       // Objects
  Heart,           // Symbols
  Flag,            // Flags
]

// 패키지 데이터에서 카테고리 생성
const EMOJI_CATEGORIES = Object.values(emojiByGroup).map((group, i) => ({
  label: group.name,
  icon: GROUP_ICONS[i],
  emojis: group.emojis.map((e: { emoji: string }) => e.emoji),
}))

// 검색용 전체 플랫 리스트 (이모지 + 영문 이름)
const ALL_EMOJIS_FLAT = Object.values(emojiByGroup).flatMap((group) =>
  group.emojis.map((e: { emoji: string; name: string }) => ({
    emoji: e.emoji,
    name: e.name,
  }))
)

interface EmojiPickerProps {
  date: Date
  currentEmoji?: string
  onSelect: (emoji: string) => void
  onClear?: () => void
  onClose: () => void
}

export function EmojiPicker({ date, currentEmoji, onSelect, onClear, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const dragStartY = useRef<number | null>(null)

  const isSearching = searchQuery.trim().length > 0
  const searchResults = isSearching
    ? ALL_EMOJIS_FLAT.filter(({ name, emoji }) =>
        name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        emoji === searchQuery.trim()
      )
    : []

  useEffect(() => {
    const id = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(id)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 280)
  }

  const onHandleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY
  }
  const onHandleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return
    const dy = e.changedTouches[0].clientY - dragStartY.current
    if (!isExpanded && dy < -40) setIsExpanded(true)
    else if (isExpanded && dy > 40) setIsExpanded(false)
    else if (!isExpanded && dy > 40) handleClose()
    dragStartY.current = null
  }
  const onHandleMouseDown = (e: React.MouseEvent) => {
    const startY = e.clientY
    const onUp = (ev: MouseEvent) => {
      const dy = ev.clientY - startY
      if (!isExpanded && dy < -40) setIsExpanded(true)
      else if (isExpanded && dy > 40) setIsExpanded(false)
      document.removeEventListener("mouseup", onUp)
    }
    document.addEventListener("mouseup", onUp)
  }
  const onHandleClick = () => {
    if (isExpanded) setIsExpanded(false)
  }

  const scrollToCategory = (index: number) => {
    const section = sectionRefs.current[index]
    const container = scrollRef.current
    if (!section || !container) return
    // getBoundingClientRect 기반으로 정확한 스크롤 위치 계산
    const sectionTop = section.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
    container.scrollTo({ top: sectionTop, behavior: "smooth" })
    setActiveCategory(index)
  }

  // Update active tab based on scroll position
  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    const scrollTop = container.scrollTop
    const containerTop = container.getBoundingClientRect().top
    let current = 0
    sectionRefs.current.forEach((ref, i) => {
      if (ref) {
        const top = ref.getBoundingClientRect().top - containerTop + scrollTop
        if (top <= scrollTop + 8) current = i
      }
    })
    setActiveCategory(current)
  }, [])

  return (
    <>
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/70"
        style={{ opacity: isVisible ? 1 : 0, transition: "opacity 300ms ease-out" }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] bg-[#353535] border border-white/15 flex flex-col overflow-hidden"
        style={{
          height: isExpanded ? "calc(100dvh - 88px)" : 520,
          transform: isVisible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 300ms ease-out, height 300ms ease-out",
          touchAction: "none",
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onHandleTouchStart}
        onTouchEnd={onHandleTouchEnd}
        onMouseDown={onHandleMouseDown}
        role="dialog"
        aria-modal="true"
        aria-label="이모지 선택"
      >
        {/* Handle */}
        <div
          className="flex justify-center items-center pt-3 pb-1 shrink-0"
          style={{ minHeight: 32, touchAction: "none" }}
          onClick={onHandleClick}
        >
          {isExpanded ? (
            <svg width="40" height="10" viewBox="0 0 40 10" fill="none">
              <path d="M4 3L20 8L36 3" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            <div className="w-10 h-1 rounded-full bg-white/25" />
          )}
        </div>

        {/* Top nav — 삭제 왼쪽, X 오른쪽 */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 shrink-0">
          <div className="w-10 flex justify-start">
            {currentEmoji && onClear && (
              <button
                onClick={onClear}
                className="hover:opacity-70 transition-opacity w-10 h-10 flex items-center justify-start"
                style={{ color: "#FF5F57" }}
              >
                <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              </button>
            )}
          </div>
          <span className="text-white font-bold text-base flex-1 text-center">
            {currentEmoji ? "이모지 변경" : "이모지 선택"}
          </span>
          <button
            onClick={handleClose}
            className="text-white/50 hover:text-white transition-colors w-12 h-12 flex items-center justify-end"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* 검색창 */}
        <div className="px-4 pb-3 shrink-0">
          <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-full px-4 py-2.5">
            <Search className="w-4 h-4 text-white/30 shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색..."
              className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none"
              style={{ fontSize: 16 }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-white/30 hover:text-white/60">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* 스크롤 영역 */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ touchAction: "pan-y" }}
          style={{ scrollbarWidth: "none", paddingBottom: isSearching ? 16 : 80 }}
        >
          {isSearching ? (
            /* 검색 결과 */
            searchResults.length > 0 ? (
              <div className="grid grid-cols-5 gap-2 px-5 py-2">
                {searchResults.map(({ emoji, name }, i) => (
                  <button
                    key={i}
                    onClick={() => onSelect(emoji)}
                    className={cn(
                      "flex items-center justify-center h-14 text-[28px] rounded-2xl transition-all hover:bg-white/10 active:scale-95",
                      currentEmoji === emoji ? "bg-white/20 ring-1 ring-white/40" : ""
                    )}
                    aria-label={name}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <span className="text-4xl">🔍</span>
                <span className="text-white/30 text-sm">검색 결과 없음</span>
              </div>
            )
          ) : (
            /* 카테고리별 전체 목록 */
            EMOJI_CATEGORIES.map((cat, catIndex) => (
              <div
                key={catIndex}
                ref={(el) => { sectionRefs.current[catIndex] = el }}
              >
                <div className="px-5 pt-0 pb-2">
                  <span className="text-white/35 text-xs font-medium tracking-wide uppercase">
                    {cat.label}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 px-5 pb-8">
                  {cat.emojis.map((emoji, emojiIndex) => (
                    <button
                      key={emojiIndex}
                      onClick={() => onSelect(emoji)}
                      className={cn(
                        "flex items-center justify-center h-14 text-[28px] rounded-2xl transition-all hover:bg-white/10 active:scale-95",
                        currentEmoji === emoji ? "bg-white/20 ring-1 ring-white/40" : ""
                      )}
                      aria-label={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating tab bar — 검색 중엔 숨김 */}
        {!isSearching && <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-4"
          style={{
            background: "linear-gradient(to top, #353535 65%, transparent)",
            paddingTop: 24,
          }}
        >
          <div
            className="flex gap-1 rounded-full px-2 py-2"
            style={{ background: "#2a2a2a", scrollbarWidth: "none", overflowX: "auto" }}
          >
            {EMOJI_CATEGORIES.map((cat, i) => {
              const Icon = cat.icon
              const isSelected = activeCategory === i
              return (
                <button
                  key={i}
                  onClick={() => scrollToCategory(i)}
                  aria-label={cat.label}
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isSelected ? "bg-white" : "hover:bg-white/10"
                  )}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isSelected ? "#111111" : "rgba(255,255,255,0.45)" }}
                    strokeWidth={1.5}
                  />
                </button>
              )
            })}
          </div>
        </div>}
      </div>
    </>
  )
}
