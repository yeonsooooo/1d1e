const cache = new Map<number, Set<string>>()

export async function getKoreanHolidays(year: number): Promise<Set<string>> {
  if (cache.has(year)) return cache.get(year)!

  try {
    const res = await fetch(`/api/holidays/${year}`)
    if (!res.ok) throw new Error("fetch failed")
    const data: { dates: string[] } = await res.json()
    const set = new Set(data.dates)
    cache.set(year, set)
    return set
  } catch {
    cache.set(year, new Set())
    return new Set()
  }
}
