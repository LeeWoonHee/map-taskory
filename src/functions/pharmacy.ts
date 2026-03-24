import { createServerFn } from '@tanstack/react-start'

export interface Pharmacy {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  phone?: string
  hours?: Record<string, string>
  isLateNight?: boolean // endTime === 0 or 2400 (자정/24시 영업)
}

interface CenterInput {
  lat: number
  lng: number
}

interface PharmacyApiItem {
  latitude?: string
  longitude?: string
  wgs84Lat?: string
  wgs84Lon?: string
  startTime?: unknown
  endTime?: unknown
  hpid?: string
  dutyName?: string
  dutyAddr?: string
  dutyTel1?: string
  [key: string]: unknown
}

function fmt(t?: string): string | undefined {
  if (!t || t.length < 4) return undefined
  return `${t.slice(0, 2)}:${t.slice(2, 4)}`
}

const DAY_KEYS = ['월', '화', '수', '목', '금', '토', '일', '공휴일'] as const

function parseItems(rawItems: unknown): PharmacyApiItem[] {
  if (!rawItems) return []
  return Array.isArray(rawItems)
    ? (rawItems as PharmacyApiItem[])
    : [rawItems as PharmacyApiItem]
}

function mapItem(i: PharmacyApiItem): Pharmacy | null {
  const lat = parseFloat((i.latitude ?? i.wgs84Lat) as string)
  const lng = parseFloat((i.longitude ?? i.wgs84Lon) as string)
  if (!lat || !lng) return null
  // LcinfoInqire: startTime/endTime (단일), BassInfoInqire: dutyTimeNs/dutyTimeNc (요일별)
  let hours: Record<string, string> | undefined
  if (i.startTime != null && i.endTime != null) {
    const s = fmt(String(i.startTime).padStart(4, '0'))
    const c = fmt(String(i.endTime).padStart(4, '0'))
    if (s && c) hours = { 영업: `${s} ~ ${c}` }
  } else {
    const h: Record<string, string> = {}
    DAY_KEYS.forEach((day, idx) => {
      const n = idx + 1
      const s = fmt(i[`dutyTime${n}s`] as string | undefined)
      const c = fmt(i[`dutyTime${n}c`] as string | undefined)
      if (s && c) h[day] = `${s} ~ ${c}`
    })
    if (Object.keys(h).length) hours = h
  }
  const endTime = i.endTime != null ? Number(i.endTime) : undefined
  const isLateNight = endTime === 0 || endTime === 2400

  return {
    id: (i.hpid as string | undefined) ?? `${lat}-${lng}`,
    name: i.dutyName as string,
    lat,
    lng,
    address: (i.dutyAddr as string | undefined) ?? '',
    phone: (i.dutyTel1 as string | undefined) || undefined,
    hours,
    isLateNight,
  }
}

function validateCenterInput(data: unknown): CenterInput {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid input: expected object')
  }
  const { lat, lng } = data as Record<string, unknown>
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('Invalid input: lat and lng must be numbers')
  }
  if (lat < -90 || lat > 90) throw new Error('Invalid lat: must be between -90 and 90')
  if (lng < -180 || lng > 180) throw new Error('Invalid lng: must be between -180 and 180')
  return { lat, lng }
}

// getParmacyLcinfoInqire: 중심 좌표 기준 거리순 반환 (WGS84_LON, WGS84_LAT)
export const fetchPharmaciesByBounds = createServerFn({ method: 'GET' })
  .inputValidator(validateCenterInput)
  .handler(async ({ data }): Promise<{ pharmacies: Pharmacy[]; noKey?: boolean }> => {
    const key = process.env.PHARMACY_API_KEY
    if (!key) return { pharmacies: [], noKey: true }

    const { lat, lng } = data

    try {
      const url = new URL(
        'https://apis.data.go.kr/B552657/ErmctInsttInfoInqireService/getParmacyLcinfoInqire',
      )
      url.searchParams.set('serviceKey', key)
      url.searchParams.set('pageNo', '1')
      url.searchParams.set('numOfRows', '300')
      url.searchParams.set('WGS84_LON', String(lng))
      url.searchParams.set('WGS84_LAT', String(lat))
      url.searchParams.set('_type', 'json')

      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) return { pharmacies: [] }
      const json = (await res.json()) as Record<string, unknown>

      const body = (json?.response as Record<string, unknown> | undefined)?.body as
        | Record<string, unknown>
        | undefined
      const items = parseItems((body?.items as Record<string, unknown> | undefined)?.item)
      const pharmacies = items.map(mapItem).filter(Boolean) as Pharmacy[]
      return { pharmacies }
    } catch {
      return { pharmacies: [] }
    }
  })
