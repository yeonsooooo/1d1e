const cache = new Map<number, Set<string>>()

// Nager.Date에 누락된 날짜 보완 (대체공휴일 + 선거일)
const SUPPLEMENTS: Record<number, string[]> = {
  2026: [
    "2026-03-02", // 삼일절 대체 (03-01 일요일)
    "2026-05-25", // 부처님오신날 대체 (05-24 일요일)
    "2026-06-03", // 제9회 전국동시지방선거
    "2026-08-17", // 광복절 대체 (08-15 토요일)
    "2026-09-28", // 추석 대체 (09-26 토요일)
    "2026-10-05", // 개천절 대체 (10-03 토요일)
  ],
  2027: [
    "2027-02-07", // 설날 본일 (Nager.Date 누락)
    "2027-08-16", // 광복절 대체 (08-15 일요일)
    "2027-10-04", // 개천절 대체 (10-03 일요일)
    "2027-10-11", // 한글날 대체 (10-09 토요일)
    "2027-12-27", // 성탄절 대체 (12-25 토요일)
  ],
  2028: [
    "2028-10-05", // 추석·개천절 겹침 대체 (10-03 동일)
  ],
}

export async function getKoreanHolidays(year: number): Promise<Set<string>> {
  if (cache.has(year)) return cache.get(year)!

  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/KR`)
    if (!res.ok) throw new Error("fetch failed")
    const data: Array<{ date: string }> = await res.json()
    const set = new Set(data.map((h) => h.date))
    for (const d of SUPPLEMENTS[year] ?? []) set.add(d)
    cache.set(year, set)
    return set
  } catch {
    cache.set(year, new Set())
    return new Set()
  }
}
