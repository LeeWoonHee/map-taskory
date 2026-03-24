import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchPharmaciesByBounds, type Pharmacy } from '../functions/pharmacy'
import { useLanguage } from '../i18n/LanguageContext'
import { useMyLocation } from '../hooks/useMyLocation'

export const Route = createFileRoute('/pharmacy')({
  component: PharmacyPage,
})

const SEOUL_CENTER = { lat: 37.538, lng: 126.99 }
const DEBOUNCE_MS = 600

function PharmacyPage() {
  const { t } = useLanguage()
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isMounted, setIsMounted] = useState(false)
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [noKey, setNoKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<Pharmacy | null>(null)

  const { goToMyLocation, locLoading, locError } = useMyLocation(mapInstanceRef, leafletRef)

  useEffect(() => { setIsMounted(true) }, [])

  // 마커 렌더링
  const renderMarkers = useCallback((items: Pharmacy[]) => {
    const L = leafletRef.current
    const map = mapInstanceRef.current
    if (!L || !map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    items.forEach((ph) => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:30px;height:30px;border-radius:50%;background:rgba(15,23,42,0.92);border:2px solid #10B981;box-shadow:0 0 8px #10B98144;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;">💊</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      })
      const marker = L.marker([ph.lat, ph.lng], { icon }).addTo(map)
      marker.on('click', () => setModal(ph))
      markersRef.current.push(marker)
    })
  }, [])

  // 현재 지도 중심으로 API 호출
  const fetchByCurrentBounds = useCallback(async () => {
    const map = mapInstanceRef.current
    if (!map) return

    const center = map.getCenter()
    setLoading(true)
    try {
      const result = await fetchPharmaciesByBounds({
        data: {
          lat: center.lat,
          lng: center.lng,
        },
      })
      if (result.noKey) {
        setNoKey(true)
        setPharmacies([])
      } else {
        setNoKey(false)
        setPharmacies(result.pharmacies)
        renderMarkers(result.pharmacies)
      }
    } finally {
      setLoading(false)
    }
  }, [renderMarkers])

  // 지도 초기화
  useEffect(() => {
    if (!isMounted || !mapRef.current || mapInstanceRef.current) return
    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      leafletRef.current = L
      const map = L.map(mapRef.current).setView([SEOUL_CENTER.lat, SEOUL_CENTER.lng], 14)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(map)
      mapInstanceRef.current = map

      // 지도 이동/줌 완료 시 디바운스 호출
      const onMoveEnd = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
          fetchByCurrentBounds()
        }, DEBOUNCE_MS)
      }

      map.on('moveend', onMoveEnd)
      map.on('zoomend', onMoveEnd)

      // 초기 로드
      setTimeout(() => fetchByCurrentBounds(), 300)
    })

    return () => {
      cancelled = true
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [isMounted, fetchByCurrentBounds])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-52px)] text-[rgba(148,163,184,0.6)] text-sm">
        {t.pharmacy.loading}
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-[calc(100dvh-52px)]">
      {/* 상태 바 */}
      <div className="flex-shrink-0 px-3 py-2 flex items-center gap-2 bg-[rgba(15,23,42,0.7)] backdrop-blur border-b border-[rgba(100,116,139,0.2)]">
        <span className="text-xs font-semibold text-[rgba(16,185,129,0.8)]">💊</span>
        <span className="text-xs text-[rgba(148,163,184,0.7)]">{t.pharmacy.pageSubTitle}</span>
        <span className="ml-auto text-xs text-[rgba(148,163,184,0.4)]">
          {noKey ? (
            <span className="text-[rgba(245,158,11,0.7)]">⚠ API 키 미설정</span>
          ) : loading ? (
            <span className="text-[rgba(148,163,184,0.5)]">검색 중...</span>
          ) : (
            t.pharmacy.countBadge(pharmacies.length)
          )}
        </span>
      </div>

      {/* 지도 */}
      <div ref={mapRef} className="flex-1 z-0" />

      {/* 로딩 오버레이 */}
      {loading && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-1000 px-3 py-1.5 rounded-full text-xs bg-[rgba(15,23,42,0.9)] border border-[rgba(16,185,129,0.3)] text-[rgba(16,185,129,0.8)] shadow-lg">
          <span className="animate-pulse">💊 약국 검색 중...</span>
        </div>
      )}

      {/* 내 위치 버튼 */}
      <div className="absolute bottom-4 right-3 z-1000 flex flex-col items-end gap-2 pointer-events-none">
        {locError && (
          <div className="pointer-events-auto px-3 py-1.5 rounded-lg text-xs bg-[rgba(15,23,42,0.95)] border border-[rgba(100,116,139,0.3)] text-slate-300 shadow-lg">
            ⚠️ {locError}
          </div>
        )}
        <button
          onClick={goToMyLocation}
          disabled={locLoading}
          title="내 위치"
          className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-[rgba(15,23,42,0.92)] border border-[rgba(100,116,139,0.3)] text-slate-300 text-lg shadow-md hover:text-white hover:border-slate-400 transition-all cursor-pointer"
        >
          {locLoading ? <span className="animate-spin text-sm inline-block">⟳</span> : '🧭'}
        </button>
      </div>

      {/* API 키 없을 때 안내 */}
      {noKey && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-1000 w-[90%] max-w-sm">
          <div className="bg-[rgba(15,23,42,0.96)] border border-[rgba(245,158,11,0.4)] rounded-xl p-4 text-xs text-[rgba(245,158,11,0.9)] text-center shadow-lg">
            <div className="text-base mb-1">⚠️</div>
            {t.pharmacy.noKey}
          </div>
        </div>
      )}

      {/* 모달 */}
      {modal && (
        <PharmacyModal pharmacy={modal} onClose={() => setModal(null)} t={t} />
      )}
    </div>
  )
}

function CopyButton({ text, label, copied: copiedLabel }: { text: string; label: string; copied: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={[
        'shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold border cursor-pointer transition-all',
        copied
          ? 'bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.4)] text-venue-green'
          : 'bg-[rgba(100,116,139,0.15)] border-[rgba(100,116,139,0.3)] text-[rgba(148,163,184,0.8)] hover:text-slate-200',
      ].join(' ')}
    >
      {copied ? copiedLabel : label}
    </button>
  )
}

function PharmacyModal({
  pharmacy,
  onClose,
  t,
}: {
  pharmacy: Pharmacy
  onClose: () => void
  t: any
}) {
  const pt = t.pharmacy

  return (
    <div
      className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center p-4 bg-[rgba(0,0,0,0.6)]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-[rgba(15,23,42,0.98)] border border-[rgba(16,185,129,0.3)] rounded-2xl p-5 shadow-[0_8px_40px_rgba(0,0,0,0.6)] max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-base font-bold text-slate-200 leading-snug flex-1 pr-2">
            💊 {pharmacy.name}
          </h3>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[rgba(148,163,184,0.6)] hover:text-slate-200 hover:bg-[rgba(100,116,139,0.2)] bg-transparent border-none cursor-pointer text-base"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {/* 전화번호 */}
          {pharmacy.phone && (
            <div>
              <div className="text-[10px] font-semibold text-[rgba(148,163,184,0.5)] uppercase tracking-wider mb-1">
                {pt.phone}
              </div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.2)]">
                <a
                  href={`tel:${pharmacy.phone}`}
                  className="text-sm font-semibold text-venue-green no-underline"
                >
                  {pharmacy.phone}
                </a>
                <CopyButton text={pharmacy.phone} label={pt.copy} copied={pt.copied} />
              </div>
            </div>
          )}

          {/* 주소 */}
          <div>
            <div className="text-[10px] font-semibold text-[rgba(148,163,184,0.5)] uppercase tracking-wider mb-1">
              {pt.address}
            </div>
            <div className="flex items-start justify-between gap-2 p-2 rounded-lg bg-[rgba(100,116,139,0.06)] border border-[rgba(100,116,139,0.2)]">
              <span className="text-xs text-[rgba(220,210,240,0.85)] leading-relaxed flex-1">
                {pharmacy.address}
              </span>
              <CopyButton text={pharmacy.address} label={pt.copy} copied={pt.copied} />
            </div>
          </div>

          {/* 영업시간 */}
          {pharmacy.hours && (
            <div>
              <div className="text-[10px] font-semibold text-[rgba(148,163,184,0.5)] uppercase tracking-wider mb-1">
                {pt.hours}
              </div>
              <div className="rounded-lg bg-[rgba(100,116,139,0.06)] border border-[rgba(100,116,139,0.2)] divide-y divide-[rgba(100,116,139,0.15)]">
                {Object.entries(pharmacy.hours).map(([day, time]) => (
                  <div key={day} className="flex items-center justify-between px-3 py-1.5 text-xs">
                    <span className="text-[rgba(148,163,184,0.7)] w-10">{pt.dayLabels?.[day] ?? day}</span>
                    <span className="text-[rgba(220,210,240,0.85)]">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
