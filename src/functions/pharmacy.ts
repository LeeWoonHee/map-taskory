import { createServerFn } from '@tanstack/react-start'

export interface Pharmacy {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  phone?: string
  hours?: Record<string, string>
}

interface CenterInput {
  lat: number
  lng: number
}

function fmt(t?: string): string | undefined {
  if (!t || t.length < 4) return undefined
  return `${t.slice(0, 2)}:${t.slice(2, 4)}`
}

const DAY_KEYS = ['월', '화', '수', '목', '금', '토', '일', '공휴일'] as const

function parseItems(rawItems: any): any[] {
  if (!rawItems) return []
  return Array.isArray(rawItems) ? rawItems : [rawItems]
}

function mapItem(i: any): Pharmacy | null {
  const lat = parseFloat(i.latitude ?? i.wgs84Lat)
  const lng = parseFloat(i.longitude ?? i.wgs84Lon)
  if (!lat || !lng) return null
  // LcinfoInqire: startTime/endTime (단일), BassInfoInqire: dutyTimeNs/dutyTimeNc (요일별)
  let hours: Record<string, string> | undefined
  if (i.startTime != null && i.endTime != null) {
    const s = fmt(String(i.startTime).padStart(4, '0'))
    const c = fmt(String(i.endTime).padStart(4, '0'))
    if (s && c) hours = { '영업': `${s} ~ ${c}` }
  } else {
    const h: Record<string, string> = {}
    DAY_KEYS.forEach((day, idx) => {
      const n = idx + 1
      const s = fmt(i[`dutyTime${n}s`])
      const c = fmt(i[`dutyTime${n}c`])
      if (s && c) h[day] = `${s} ~ ${c}`
    })
    if (Object.keys(h).length) hours = h
  }
  return {
    id: i.hpid ?? `${lat}-${lng}`,
    name: i.dutyName,
    lat,
    lng,
    address: i.dutyAddr ?? '',
    phone: i.dutyTel1 || undefined,
    hours,
  }
}

// getParmacyLcinfoInqire: 중심 좌표 기준 거리순 반환 (WGS84_LON, WGS84_LAT)
export const fetchPharmaciesByBounds = createServerFn({ method: 'GET' })
  .inputValidator((data: unknown) => data as CenterInput)
  .handler(async ({ data }): Promise<{ pharmacies: Pharmacy[]; noKey?: boolean }> => {
    const key = process.env.PHARMACY_API_KEY
    if (!key) return { pharmacies: [], noKey: true }

    const { lat, lng } = data

    try {
      const url = new URL(
        'https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyLcinfoInqire'
      )
      url.searchParams.set('serviceKey', key)
      url.searchParams.set('pageNo', '1')
      url.searchParams.set('numOfRows', '300')
      url.searchParams.set('WGS84_LON', String(lng))
      url.searchParams.set('WGS84_LAT', String(lat))
      url.searchParams.set('_type', 'json')

      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) })
      const json = await res.json()

      const items = parseItems(json?.response?.body?.items?.item)
      const pharmacies = items.map(mapItem).filter(Boolean) as Pharmacy[]
      return { pharmacies }
    } catch {
      return { pharmacies: [] }
    }
  })
