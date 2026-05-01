"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronRight, LogOut } from "lucide-react"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
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
  const { user, signOut, signInWithGoogle } = useAuth()
  const [showHourPicker, setShowHourPicker] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const dragStartY = useRef<number | null>(null)

  useEffect(() => {
    const id = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(id)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 280)
  }

  const handleSwitchAccount = async () => {
    if (!auth) return
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: "select_account" })
    try {
      await signInWithPopup(auth, provider)
    } catch {}
  }

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch {}
  }

  const handleSignOut = () => {
    handleClose()
    setTimeout(() => signOut(), 280)
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

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60"
        style={{ zIndex: 40, opacity: isVisible ? 1 : 0, transition: "opacity 300ms ease-out" }}
        onClick={handleClose}
      />

      <div
        className="fixed inset-x-0 bottom-0 rounded-t-[32px] bg-[#353535] border border-white/15 flex flex-col overflow-hidden"
        style={{
          zIndex: 50,
          height: isExpanded ? "calc(100dvh - 88px)" : undefined,
          transform: isVisible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 300ms ease-out, height 300ms ease-out",
          touchAction: "none",
        }}
        onTouchStart={onHandleTouchStart}
        onTouchEnd={onHandleTouchEnd}
        onMouseDown={onHandleMouseDown}
      >
        {/* Handle */}
        <div
          className="flex justify-center items-center pt-3 pb-1"
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

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-2">
          <span className="text-white font-bold text-base">설정</span>
          <button
            onClick={handleClose}
            className="text-white/50 hover:text-white transition-colors w-12 h-12 flex items-center justify-end"
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-5 pb-6 flex flex-col">

          {/* 계정 영역 */}
          {user ? (
            <button
              onClick={handleSwitchAccount}
              className="flex items-center gap-3 w-full py-4"
            >
              <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
                <span className="text-white text-base font-normal truncate w-full text-left">
                  {user.displayName ?? "사용자"}
                </span>
                <span className="text-white/40 text-xs truncate w-full text-left">
                  {user.email}
                </span>
              </div>
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? "profile"}
                  className="w-8 h-8 rounded-full shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/20 shrink-0 flex items-center justify-center text-white text-xs">
                  {user.displayName?.[0] ?? user.email?.[0] ?? "?"}
                </div>
              )}
              <ChevronRight className="w-5 h-5 text-white/30 shrink-0" strokeWidth={1.5} />
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center gap-3 w-full py-4"
            >
              <div className="flex flex-col items-start gap-0.5 flex-1">
                <span className="text-white text-base font-normal">Google로 로그인</span>
                <span className="text-white/40 text-xs">기기 간 동기화가 활성화돼요</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 48 48" className="shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <ChevronRight className="w-5 h-5 text-white/30 shrink-0" strokeWidth={1.5} />
            </button>
          )}

          <div className="h-px bg-white/10" />

          {/* 하루 시작 시간 */}
          <button
            onClick={() => setShowHourPicker((v) => !v)}
            className="flex items-center justify-between w-full py-4"
          >
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-white text-base">오늘 시작 시간</span>
              <span className="text-white/40 text-xs">이 시간부터 새로운 날로 인식해요</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="text-white/60 text-sm">{formatHour(dayStartHour)}</span>
              <ChevronRight
                className={cn(
                  "w-5 h-5 text-white/30 transition-transform duration-200",
                  showHourPicker && "rotate-90"
                )}
                strokeWidth={1.5}
              />
            </div>
          </button>

          {showHourPicker && (
            <div
              className="mt-2 max-h-52 overflow-y-auto rounded-2xl bg-[#2a2a2a]"
              onTouchStart={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ touchAction: "pan-y" }}
            >
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <button
                  key={hour}
                  onClick={() => { onChangeDayStartHour(hour); setShowHourPicker(false) }}
                  className={cn(
                    "w-full text-left px-5 py-3 text-sm transition-colors",
                    hour === dayStartHour ? "text-white font-normal" : "text-white/50 hover:text-white"
                  )}
                >
                  {formatHour(hour)}
                </button>
              ))}
            </div>
          )}

          {/* 로그아웃 (로그인 상태에서만) */}
          {user && (
            <>
              <div className="h-px bg-white/10 mt-1" />
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full py-4"
                style={{ color: "#FF5F57" }}
              >
                <LogOut className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-base">로그아웃</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  )
}
