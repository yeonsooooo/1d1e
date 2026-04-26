import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// env 없는 환경(빌드 서버 등)에서 초기화 실패해도 크래시 방지
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    auth = getAuth(app)
    db = getFirestore(app)
  } catch (e) {
    console.warn("[Firebase] 초기화 실패:", e)
  }
}

export { auth, db }
