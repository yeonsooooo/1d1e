const cache = new Map<number, Set<string>>()

export async function getKoreanHolidays(year: number): Promise<Set<string>> {
  if (cache.has(year)) return cache.get(year)!

  try {
    const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/KR`)
    if (!res.ok) throw new Error("fetch failed")
    const data: Array<{ date: string }> = await res.json()
    const set = new Set(data.map((h) => h.date)) // "YYYY-MM-DD"
    cache.set(year, set)
    return set
  } catch {
    cache.set(year, new Set())
    return new Set()
  }
}
