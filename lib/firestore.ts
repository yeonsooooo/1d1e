import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore"
import { db } from "./firebase"

export interface UserData {
  emojis: Record<string, Record<string, string>>
  texts: Record<string, Record<string, string>>
  dayStartHour: number
}

/** Firestore에서 유저 데이터 실시간 구독. unsubscribe 함수 반환 */
export function subscribeUserData(
  uid: string,
  callback: (data: UserData | null) => void
): () => void {
  const ref = doc(db, "users", uid)
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const d = snap.data()
      callback({
        emojis: d.emojis ?? {},
        texts: d.texts ?? {},
        dayStartHour: d.dayStartHour ?? 0,
      })
    } else {
      callback(null)
    }
  })
}

/** Firestore에 유저 데이터 저장 (merge) */
export async function saveUserData(uid: string, data: Partial<UserData>): Promise<void> {
  const ref = doc(db, "users", uid)
  await setDoc(ref, data, { merge: true })
}

/** localStorage 데이터를 Firestore로 마이그레이션 (최초 1회) */
export async function migrateFromLocalStorage(uid: string): Promise<void> {
  // 이미 Firestore에 데이터가 있으면 스킵
  const ref = doc(db, "users", uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return

  let emojis: Record<string, Record<string, string>> = {}
  let texts: Record<string, Record<string, string>> = {}
  const dayStartHour = parseInt(localStorage.getItem("dayStartHour") ?? "0", 10)

  try {
    const raw = localStorage.getItem("1d1e-entries")
    if (raw) {
      const parsed = JSON.parse(raw)
      emojis = parsed.emojis ?? {}
      texts = parsed.texts ?? {}
    }
  } catch {
    // 파싱 실패 시 빈 데이터로 진행
  }

  await setDoc(ref, {
    emojis,
    texts,
    dayStartHour,
    migratedAt: serverTimestamp(),
  })
}
