import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchToilets } from '../functions/toilets'
import { type PublicToilet } from '../data/publicToiletsData'
import { useLanguage } from '../i18n/LanguageContext'
import { PageLoader } from '../components/PageLoader'
import { useMyLocation } from '../hooks/useMyLocation'

export const Route = createFileRoute('/toilet')({
  loader: () => fetchToilets(),
  pendingComponent: PageLoader,
  pendingMs: 300,
  component: ToiletPage,
})

const SEOUL_CENTER = { lat: 37.538, lng: 126.99 }

function ToiletPage() {
  const { t } = useLanguage()
  const { toilets } = Route.useLoaderData()
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [modal, setModal] = useState<PublicToilet | null>(null)
  const [show24hOnly, setShow24hOnly] = useState(false)
  const [showDisabledOnly, setShowDisabledOnly] = useState(false)
  const { goToMyLocation, locLoading, locError } = useMyLocation(mapInstanceRef, leafletRef)

  useEffect(() => { setIsMounted(true) }, [])

  const filtered = toilets.filter((t) => {
    if (show24hOnly && !t.isOpen24h) return false
    if (showDisabledOnly && !t.hasDisabled) return false
    return true
  })

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
    })

    return () => { cancelled = true }
  }, [isMounted])

  // 마커 렌더링
  const renderMarkers = useCallback(() => {
    const L = leafletRef.current
    const map = mapInstanceRef.current
    if (!L || !map) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    filtered.forEach((toilet) => {
      const color = toilet.isOpen24h ? '#3B82F6' : '#60A5FA'
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;border-radius:50%;background:rgba(15,23,42,0.92);border:2px solid ${color};box-shadow:0 0 8px ${color}44;display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;">🚻</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })
      const marker = L.marker([toilet.lat, toilet.lng], { icon }).addTo(map)
      marker.on('click', () => setModal(toilet))
      markersRef.current.push(marker)
    })
  }, [filtered])

  useEffect(() => {
    if (isMounted && mapInstanceRef.current) renderMarkers()
  }, [isMounted, renderMarkers])

  // 지도가 초기화된 후 마커 렌더링 (지연)
  useEffect(() => {
    if (!isMounted) return
    const timer = setTimeout(renderMarkers, 500)
    return () => clearTimeout(timer)
  }, [isMounted, renderMarkers])

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-52px)] text-[rgba(148,163,184,0.6)] text-sm">
        {t.toilet.loading}
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-[calc(100dvh-52px)]">
      {/* 필터 바 */}
      <div className="flex-shrink-0 px-3 py-2 flex items-center gap-2 flex-wrap bg-[rgba(15,23,42,0.7)] backdrop-blur border-b border-[rgba(100,116,139,0.2)]">
        <button
          onClick={() => setShow24hOnly((v) => !v)}
          className={[
            'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer',
            show24hOnly
              ? 'bg-[rgba(59,130,246,0.15)] border-[rgba(59,130,246,0.4)] text-[#60A5FA]'
              : 'bg-transparent border-[rgba(100,116,139,0.2)] text-[rgba(148,163,184,0.5)]',
          ].join(' ')}
        >
          🕐 {t.toilet.open24h}
        </button>
        <button
          onClick={() => setShowDisabledOnly((v) => !v)}
          className={[
            'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer',
            showDisabledOnly
              ? 'bg-[rgba(139,92,246,0.15)] border-[rgba(139,92,246,0.4)] text-[#A78BFA]'
              : 'bg-transparent border-[rgba(100,116,139,0.2)] text-[rgba(148,163,184,0.5)]',
          ].join(' ')}
        >
          ♿ {t.toilet.disabled}
        </button>
        <span className="ml-auto text-xs text-[rgba(148,163,184,0.4)]">
          {t.toilet.countBadge(filtered.length)}
        </span>
      </div>

      {/* 지도 */}
      <div ref={mapRef} className="flex-1 z-0" />

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

      {/* 모달 */}
      {modal && (
        <ToiletModal toilet={modal} onClose={() => setModal(null)} t={t} />
      )}
    </div>
  )
}

function ToiletModal({
  toilet,
  onClose,
  t,
}: {
  toilet: PublicToilet
  onClose: () => void
  t: any
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-[rgba(0,0,0,0.6)]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-[rgba(15,23,42,0.98)] border border-[rgba(100,116,139,0.35)] rounded-2xl p-5 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {toilet.isOpen24h && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.35)] text-[#60A5FA]">
                  🕐 {t.toilet.open24h}
                </span>
              )}
              {toilet.hasDisabled && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.35)] text-[#A78BFA]">
                  ♿ {t.toilet.disabled}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-200 leading-snug">
              🚻 {toilet.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[rgba(148,163,184,0.6)] hover:text-slate-200 hover:bg-[rgba(100,116,139,0.2)] bg-transparent border-none cursor-pointer text-base"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {/* 주소 */}
          <Row label={t.toilet.pageTitle === '서울 공공화장실' ? '주소' : t.address} value={toilet.address} />

          {/* 운영시간 */}
          {(toilet.isOpen24h || toilet.openHours) && (
            <Row
              label={t.toilet.openHours}
              value={toilet.isOpen24h ? t.toilet.open24h : (toilet.openHours ?? '')}
              highlight={toilet.isOpen24h}
            />
          )}

          {/* 변기 수 */}
          {(toilet.maleCount || toilet.femaleCount) && (
            <div className="flex gap-2">
              {toilet.maleCount ? (
                <div className="flex-1 text-center p-2 rounded-lg bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)]">
                  <div className="text-lg">🚹</div>
                  <div className="text-xs text-[rgba(148,163,184,0.6)]">{t.toilet.male}</div>
                  <div className="text-sm font-bold text-[#60A5FA]">{toilet.maleCount}칸</div>
                </div>
              ) : null}
              {toilet.femaleCount ? (
                <div className="flex-1 text-center p-2 rounded-lg bg-[rgba(236,72,153,0.08)] border border-[rgba(236,72,153,0.2)]">
                  <div className="text-lg">🚺</div>
                  <div className="text-xs text-[rgba(148,163,184,0.6)]">{t.toilet.female}</div>
                  <div className="text-sm font-bold text-[#F472B6]">{toilet.femaleCount}칸</div>
                </div>
              ) : null}
            </div>
          )}

          {/* 관리기관 */}
          {toilet.managedBy && (
            <Row label={t.toilet.managedBy} value={toilet.managedBy} />
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="shrink-0 text-[rgba(148,163,184,0.55)] w-14">{label}</span>
      <span className={highlight ? 'text-[#60A5FA] font-semibold' : 'text-[rgba(220,210,240,0.85)]'}>
        {value}
      </span>
    </div>
  )
}
