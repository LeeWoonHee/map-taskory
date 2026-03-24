import { createServerFn } from '@tanstack/react-start'
import type { PublicToilet } from '../data/publicToiletsData'
import toiletRaw from '../data/toillet_location.json'

interface ToiletRecord {
  objectid: number
  conts_name: string
  coord_y: number
  coord_x: number
  addr_new: string
  addr_old: string
  value_02: string
  value_05: string
  value_09: string
}

function parseHours(value02: string): { isOpen24h: boolean; openHours?: string } {
  if (!value02) return { isOpen24h: false }
  if (value02.includes('상시')) return { isOpen24h: true }
  // "기타|06:00~22:00|" or "공원|09:00~21:00|" → extract "HH:MM~HH:MM"
  const parts = value02.split('|').filter(Boolean)
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.includes('~') && trimmed.includes(':')) {
      return { isOpen24h: false, openHours: trimmed }
    }
  }
  return { isOpen24h: false }
}

const staticToilets: PublicToilet[] = (toiletRaw.DATA as ToiletRecord[])
  .filter((r) => r.coord_y && r.coord_x)
  .map((r) => {
    const { isOpen24h, openHours } = parseHours(r.value_02 ?? '')
    const disabled = r.value_05?.trim() ?? ''
    return {
      id: r.objectid.toString(),
      name: r.conts_name,
      lat: r.coord_y,
      lng: r.coord_x,
      address: r.addr_new || r.addr_old || '',
      isOpen24h,
      openHours,
      hasDisabled: disabled !== '' && disabled !== ' ',
      managedBy: r.value_09?.trim() || undefined,
    }
  })

function fmtTime(t?: string): string | undefined {
  if (!t || t.length < 4) return undefined
  return `${t.slice(0, 2)}:${t.slice(2, 4)}`
}

export const fetchToilets = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ toilets: PublicToilet[]; source: 'api' | 'static' }> => {
    const key = process.env.SEOUL_API_KEY
    if (!key) {
      return { toilets: staticToilets, source: 'static' }
    }
    try {
      const url = `http://openapi.seoul.go.kr:8088/${key}/json/SearchPublicToiletPOIService/1/1000/`
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
      const json = await res.json()
      const rows: any[] = json?.SearchPublicToiletPOIService?.row ?? []
      if (!rows.length) return { toilets: staticToilets, source: 'static' }
      const toilets: PublicToilet[] = rows
        .filter((r) => r.X_WGS84 && r.Y_WGS84)
        .map((r) => ({
          id: r.POI_ID ?? `${r.Y_WGS84}-${r.X_WGS84}`,
          name: r.POI_NM ?? '공중화장실',
          lat: parseFloat(r.Y_WGS84),
          lng: parseFloat(r.X_WGS84),
          address: r.RDNMADR || r.LNMADR || '',
          openHours:
            r.OPEN_TM && r.CLOSE_TM
              ? `${fmtTime(r.OPEN_TM)} ~ ${fmtTime(r.CLOSE_TM)}`
              : undefined,
          isOpen24h: r.OPEN_TM === '0000' && (r.CLOSE_TM === '2400' || r.CLOSE_TM === '0000'),
          hasDisabled: r.DISABLED_TOILET_YN === 'Y',
          maleCount: parseInt(r.MALE_STOOL_CNT) || undefined,
          femaleCount: parseInt(r.FEMALE_STOOL_CNT) || undefined,
          managedBy: r.MANAGE_INST_NM || undefined,
        }))
      return { toilets, source: 'api' }
    } catch {
      return { toilets: staticToilets, source: 'static' }
    }
  }
)
