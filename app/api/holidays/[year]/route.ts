import { NextRequest, NextResponse } from "next/server"

export const preferredRegion = "icn1"

const MONTHS = ["01","02","03","04","05","06","07","08","09","10","11","12"]

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params
  const key = process.env.HOLIDAYS_API_KEY
  if (!key) return NextResponse.json({ error: "missing key" }, { status: 500 })

  const dates = new Set<string>()
  const debug: string[] = []

  await Promise.all(
    MONTHS.map(async (month) => {
      const url =
        `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo` +
        `?serviceKey=${encodeURIComponent(key)}&solYear=${year}&solMonth=${month}&numOfRows=20`
      try {
        const res = await fetch(url, { next: { revalidate: 86400 } })
        const xml = await res.text()
        if (month === "01") debug.push(`status:${res.status}`, `body:${xml.slice(0, 300)}`)
        const matches = xml.matchAll(/<locdate>(\d{8})<\/locdate>/g)
        for (const m of matches) {
          const d = m[1]
          dates.add(`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`)
        }
      } catch (e) {
        if (month === "01") debug.push(`error:${e}`)
      }
    })
  )

  return NextResponse.json({ dates: [...dates], debug })
}
