"use client"

import { useState, useRef, useCallback } from "react"
import { X, Trash2, Smile, Users, PawPrint, Leaf, UtensilsCrossed, Trophy, Plane, Lightbulb, Heart, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORY_ICONS: LucideIcon[] = [
  Smile, Users, PawPrint, Leaf, UtensilsCrossed, Trophy, Plane, Lightbulb, Heart,
]

const EMOJI_CATEGORIES: { label: string; emojis: string[] }[] = [
  {
    label: "Feelings",
    emojis: [
      "😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙",
      "🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬",
      "😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎",
      "🤓","🧐","😕","😟","🙁","☹️","😮","😯","😲","😳","🥺","🥹","😦","😧","😨","😰","😥","😢","😭","😱",
      "😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻",
      "👽","👾","🤖",
    ],
  },
  {
    label: "People",
    emojis: [
      "👋","🤚","🖐️","✋","🖖","👌","🤌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","👍","👎","✊",
      "👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","💪","🦵","🦶","👂","👃","👀","👅","👄","💋",
      "🧑","👶","🧒","👦","👧","🧔","👱","🧓","👴","👵","🙍","🙎","🙅","🙆","💁","🙋","🧏","🙇","🤦","🤷",
      "💆","💇","🚶","🧍","🧎","🏃","💃","🕺","🧖","🛀","🧑‍🤝‍🧑","👫","👬","👭","💑","💏","👪","🫂",
    ],
  },
  {
    label: "Animals",
    emojis: [
      "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐻‍❄️","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐒",
      "🦆","🐧","🐦","🐤","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🦋","🐛","🐌","🐞","🐜","🦟","🕷️","🦂",
      "🐢","🐍","🦎","🐙","🦑","🦐","🦀","🐡","🐠","🐟","🐬","🐳","🦈","🦭","🐊","🐅","🐆","🦓","🐘","🦛",
      "🦏","🐪","🦒","🦘","🐃","🐄","🐎","🐖","🐑","🦙","🐐","🦌","🐕","🐩","🐈","🐈‍⬛","🐓","🦚","🦜","🦢",
      "🕊️","🐇","🦝","🦦","🦥","🐁","🐀","🐿️","🦔","🐾","🐉","🐲",
    ],
  },
  {
    label: "Nature",
    emojis: [
      "🌵","🎄","🌲","🌳","🌴","🪵","🌱","🌿","☘️","🍀","🎍","🪴","🎋","🍃","🍂","🍁","🍄","🐚","🌾","💐",
      "🌷","🌹","🥀","🌺","🌸","🌼","🌻","🌞","🌝","🌛","🌜","🌚","🌕","🌙","⭐","🌟","🌠","🌌","☀️","⛅",
      "☁️","🌧️","⛈️","🌩️","🌨️","❄️","☃️","⛄","💨","💧","💦","🌊","🌈","⚡","🔥","🌪️","🌫️","🌍","🌎","🌏",
      "🪨","🏔️","🌋","🗻","🏕️","🏖️","🏜️","🏝️","🌁",
    ],
  },
  {
    label: "Food",
    emojis: [
      "🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬",
      "🥒","🌶️","🧄","🧅","🥔","🍠","🥐","🥯","🍞","🥖","🧀","🥚","🍳","🥞","🧇","🥓","🥩","🍗","🍖","🌭",
      "🍔","🍟","🍕","🥪","🥙","🧆","🌮","🌯","🥗","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🍤","🍙","🍚","🍘",
      "🍥","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🍯","🧃","🥤","🧋","☕","🍵","🫖","🍶","🍺",
      "🍻","🥂","🍷","🥃","🍸","🍹","🍾","🧊",
    ],
  },
  {
    label: "Sports",
    emojis: [
      "⚽","🏀","🏈","⚾","🥎","🎾","🏐","🏉","🥏","🎱","🏓","🏸","🏒","🥊","🥋","🛹","🛼","🛷","⛸️","🤺",
      "⛷️","🏂","🪂","🏋️","🤼","🤸","⛹️","🏊","🚴","🤾","🏄","🧘","🧗","🏆","🥇","🥈","🥉","🏅","🎖️",
      "🎪","🤹","🎭","🎨","🎰","🎠","🎡","🎢","🎤","🎧","🎼","🎵","🎶","🎷","🪗","🎸","🎹","🎺","🎻","🥁",
      "🎮","🕹️","🎲","🎯","🎳","🧩","🪀","🪁","🔮","🪄","🎴","🃏","🎀","🎁","🎗️","🎫","🎟️",
    ],
  },
  {
    label: "Travel",
    emojis: [
      "🚗","🚕","🚙","🚌","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍️","🛵","🚲","🛴","🛹","⛽","🚧",
      "⚓","⛵","🚤","🛥️","🚢","✈️","🛩️","🛫","🛬","💺","🚁","🚀","🛸","🛎️","🗺️","🧭","🏔️","⛰️","🌋","🗻",
      "🏕️","🏖️","🏜️","🏝️","🏟️","🏛️","🏗️","🏘️","🏠","🏡","🏢","🏣","🏥","🏦","🏨","🏪","🏫","🏭","🏯","🏰",
      "💒","🗼","🗽","⛪","🕌","⛩️","⛲","⛺","🌃","🏙️","🌄","🌅","🌆","🌇","🌉","🌌",
    ],
  },
  {
    label: "Objects",
    emojis: [
      "⌚","📱","💻","⌨️","🖥️","🖨️","🖱️","💽","💾","💿","📀","🧮","📷","📸","📹","🎥","📞","☎️","📺","📻",
      "🧭","⏰","🕰️","⌛","⏳","📡","🔋","🔌","💡","🔦","🕯️","🪔","💰","💳","🪙","✉️","📦","📝","📁","📂",
      "📅","📊","📋","📌","📍","📎","✂️","🔒","🔓","🔑","🗝️","🔨","⛏️","🛠️","🔧","🔩","⚙️","⚖️","🧲","🪜",
      "⚗️","🧪","🔭","🔬","💊","💉","🩹","🩺","🧻","🧴","🧹","🧺","🧽","🧷","🧵","🧶","👓","🕶️","👔","👗",
      "👘","👙","👚","👛","👜","👝","🎒","🧳","👒","🎩","🧢","👑","💄","💍","💎","🔮","🪬","🧸","🎭","🖼️",
    ],
  },
  {
    label: "Symbols",
    emojis: [
      "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️",
      "✝️","☯️","☪️","🕉️","✡️","🔯","🕎","☦️","⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒",
      "♓","🆔","⚛️","🉑","☢️","☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️","㊗️","🈴",
      "🈵","🈹","🈲","🅰️","🅱️","🆎","🆑","🅾️","🆘","❌","⭕","🛑","⛔","📛","🚫","💯","💢","♨️","🚷","🚯",
      "🚳","🚱","🔞","📵","🔇","🔈","🔉","🔊","📢","📣","🔔","🔕","🎵","🎶","💹","🔱","🔰","♻️",
      "✅","🔛","🔜","🔝","🆒","🆓","🆕","🆙","🆗","⭐","🌟","✨","💫","🎆","🎇","🧨",
    ],
  },
]

interface EmojiPickerProps {
  date: Date
  currentEmoji?: string
  onSelect: (emoji: string) => void
  onClear?: () => void
  onClose: () => void
}

export function EmojiPicker({ date, currentEmoji, onSelect, onClear, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

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
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating card */}
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-[55%] z-50 rounded-[28px] bg-[#3a3a3a] flex flex-col overflow-hidden"
        style={{ maxWidth: 420, margin: "0 auto", height: 500 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="이모지 선택"
      >
        {/* Top nav */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors w-10 h-10 flex items-center justify-start"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <span className="text-white font-bold text-base flex-1 text-center">
            {currentEmoji ? "이모지 변경" : "이모지 선택"}
          </span>
          <div className="w-10 flex justify-end">
            {currentEmoji && onClear && (
              <button
                onClick={onClear}
                className="hover:opacity-70 transition-opacity w-10 h-10 flex items-center justify-end"
                style={{ color: "#FF5F57" }}
              >
                <Trash2 className="w-5 h-5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable emoji list — all categories in sequence */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto"
          style={{ scrollbarWidth: "none", paddingBottom: 80 }}
        >
          {EMOJI_CATEGORIES.map((cat, catIndex) => (
            <div
              key={catIndex}
              ref={(el) => { sectionRefs.current[catIndex] = el }}
            >
              {/* Category label */}
              <div className="px-5 pt-0 pb-2">
                <span className="text-white/35 text-xs font-medium tracking-wide uppercase">
                  {cat.label}
                </span>
              </div>
              {/* Emoji grid */}
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
          ))}
        </div>

        {/* Floating tab bar — bottom overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-4"
          style={{
            background: "linear-gradient(to top, #3a3a3a 65%, transparent)",
            paddingTop: 24,
          }}
        >
          <div
            className="flex gap-1 rounded-full px-2 py-2"
            style={{ background: "#2a2a2a", scrollbarWidth: "none", overflowX: "auto" }}
          >
            {EMOJI_CATEGORIES.map((cat, i) => {
              const Icon = CATEGORY_ICONS[i]
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
        </div>
      </div>
    </>
  )
}
