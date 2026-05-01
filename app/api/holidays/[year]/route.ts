import { NextRequest, NextResponse } from "next/server"

const MONTHS = ["01","02","03","04","05","06","07","08","09","10","11","12"]

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params
  const key = process.env.HOLIDAYS_API_KEY
  if (!key) return NextResponse.json({ error: "missing key" }, { status: 500 })

  const dates = new Set<string>()

  await Promise.all(
    MONTHS.map(async (month) => {
      const url =
        `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo` +
        `?serviceKey=${encodeURIComponent(key)}&solYear=${year}&solMonth=${month}&numOfRows=20`
      try {
        const res = await fetch(url, { next: { revalidate: 86400 } })
        const xml = await res.text()
        const matches = xml.matchAll(/<locdate>(\d{8})<\/locdate>/g)
        for (const m of matches) {
          const d = m[1] // "20260101"
          dates.add(`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`)
        }
      } catch {}
    })
  )

  return NextResponse.json({ dates: [...dates] })
}
