"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"

export function LoginScreen() {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "로그인에 실패했어요"
      // 팝업 닫은 경우는 에러 무시
      if (!msg.includes("popup-closed")) {
        setError("로그인에 실패했어요. 다시 시도해 주세요.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1C1C1E] flex flex-col items-center justify-center px-8">
      {/* 앱 아이콘 영역 */}
      <div className="mb-10 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-[22px] bg-black flex items-center justify-center text-4xl shadow-lg">
          🗓️
        </div>
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold tracking-tight">1d1e</h1>
          <p className="text-white/40 text-sm mt-1">One Day, One Emoji</p>
        </div>
      </div>

      {/* 로그인 버튼 */}
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="w-full max-w-xs flex items-center justify-center gap-3 bg-white text-black font-semibold text-base py-3.5 px-6 rounded-2xl transition-opacity disabled:opacity-50 active:opacity-70"
      >
        {loading ? (
          <span className="text-sm">로그인 중...</span>
        ) : (
          <>
            {/* Google 로고 SVG */}
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.29-8.16 2.29-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Google로 계속하기
          </>
        )}
      </button>

      {error && (
        <p className="mt-4 text-red-400 text-sm text-center">{error}</p>
      )}

      <p className="mt-8 text-white/20 text-xs text-center leading-relaxed">
        로그인하면 기기 간 동기화가 활성화돼요
      </p>
    </div>
  )
}
