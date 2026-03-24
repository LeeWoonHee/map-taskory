import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, useCallback } from 'react'
import { malls, mallFacilityConfig, mallTypeConfig, type Mall, type MallFacilityType } from '../data/mallData'
import { useLanguage } from '../i18n/LanguageContext'
import { useMyLocation } from '../hooks/useMyLocation'

export const Route = createFileRoute('/mall')({
  component: MallPage,
})

const SEOUL_CENTER = { lat: 37.5380, lng: 126.9900 }
const ZOOM = 14

const FACILITY_FILTERS: MallFacilityType[] = ['convenience', 'smoking', 'restroom']

function MallPage() {
  const { t } = useLanguage()
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [selectedMall, setSelectedMall] = useState<Mall | null>(null)
  // 흡연구역을 기본 필터로 설정
  const [activeFilters, setActiveFilters] = useState<Set<MallFacilityType>>(
    new Set<MallFacilityType>(['smoking'])
  )
  const { goToMyLocation, locLoading, locError } = useMyLocation(mapInstanceRef, leafletRef)

  useEffect(() => { setIsMounted(true) }, [])

  // 지도 초기화
  useEffect(() => {
    if (!isMounted || !mapRef.current) return
    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return
      if (mapInstanceRef.current) return

      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      leafletRef.current = L
      const map = L.map(mapRef.current, { zoomControl: true }).setView(
        [SEOUL_CENTER.lat, SEOUL_CENTER.lng],
        ZOOM
      )
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
      renderMarkers(L, map)
    })

    return () => { cancelled = true }
  }, [isMounted])

  const createMallIcon = useCallback((L: any, mall: Mall) => {
    const cfg = mallTypeConfig[mall.type]
    return L.divIcon({
      className: '',
      html: `<div style="
        width:40px;height:40px;border-radius:50%;
        background:rgba(15,23,42,0.92);
        border:2.5px solid ${cfg.color};
        box-shadow:0 0 12px ${cfg.color}55;
        display:flex;align-items:center;justify-content:center;
        font-size:18px;cursor:pointer;
      ">${cfg.emoji}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -44],
    })
  }, [])

  const renderMarkers = useCallback((L: any, map: any) => {
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    malls.forEach((mall) => {
      const icon = createMallIcon(L, mall)
      const marker = L.marker([mall.lat, mall.lng], { icon }).addTo(map)
      marker.on('click', () => setSelectedMall(mall))
      markersRef.current.push(marker)
    })
  }, [createMallIcon])

  useEffect(() => {
    const L = leafletRef.current
    const map = mapInstanceRef.current
    if (!L || !map) return
    renderMarkers(L, map)
  }, [renderMarkers])

  const toggleFilter = (f: MallFacilityType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      next.has(f) ? next.delete(f) : next.add(f)
      return next
    })
  }

  const filteredFacilities = selectedMall?.facilities.filter((f) =>
    activeFilters.has(f.type)
  ) ?? []

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-52px)] text-[rgba(148,163,184,0.6)] text-sm">
        {t.loadingMap}
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-[calc(100dvh-52px)]">
      {/* 필터 바 */}
      <div className="flex-shrink-0 px-3 py-2 flex items-center gap-2 bg-[rgba(15,23,42,0.7)] backdrop-blur border-b border-[rgba(100,116,139,0.2)]">
        <span className="text-xs font-semibold text-[rgba(148,163,184,0.6)] mr-1">
          {t.filterLabel}
        </span>
        {FACILITY_FILTERS.map((f) => {
          const cfg = mallFacilityConfig[f]
          const active = activeFilters.has(f)
          return (
            <button
              key={f}
              onClick={() => toggleFilter(f)}
              style={active ? {
                background: cfg.bgColor,
                borderColor: cfg.borderColor,
                color: cfg.color,
              } : undefined}
              className={[
                'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer',
                active
                  ? 'border-current'
                  : 'bg-transparent border-[rgba(100,116,139,0.2)] text-[rgba(148,163,184,0.5)]',
              ].join(' ')}
            >
              <span>{cfg.emoji}</span>
              <span>{t.mall.facilityTypes[f]}</span>
            </button>
          )
        })}
        <span className="ml-auto text-xs text-[rgba(148,163,184,0.5)]">
          {malls.length}개 쇼핑몰
        </span>
      </div>

      {/* 지도 + 사이드 패널 */}
      <div className="flex-1 relative flex overflow-hidden">
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

        {/* 선택된 쇼핑몰 정보 패널 */}
        <div
          className={[
            'absolute bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto',
            'sm:w-80 sm:flex-shrink-0 overflow-y-auto',
            'bg-[rgba(15,23,42,0.95)] border-t sm:border-t-0 sm:border-l border-[rgba(100,116,139,0.25)]',
            'transition-all duration-300 z-10',
            selectedMall ? 'max-h-[55vh] sm:max-h-full' : 'max-h-0 sm:max-h-full overflow-hidden',
          ].join(' ')}
        >
          {selectedMall ? (
            <MallDetail
              mall={selectedMall}
              filteredFacilities={filteredFacilities}
              onClose={() => setSelectedMall(null)}
              t={t}
            />
          ) : (
            <div className="hidden sm:flex items-center justify-center h-full text-sm text-[rgba(148,163,184,0.4)] p-8 text-center">
              {t.mall.selectMall}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MallDetail({
  mall,
  filteredFacilities,
  onClose,
  t,
}: {
  mall: Mall
  filteredFacilities: ReturnType<typeof mall.facilities.filter>
  onClose: () => void
  t: any
}) {
  const typeCfg = mallTypeConfig[mall.type]

  return (
    <div className="p-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{ color: typeCfg.color, borderColor: `${typeCfg.color}55`, background: `${typeCfg.color}18` }}
            >
              {typeCfg.emoji} {t.mall.mallTypes[mall.type]}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-200 truncate">{mall.name}</h3>
          <p className="text-xs text-[rgba(148,163,184,0.6)] mt-0.5">{mall.address}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 flex-shrink-0 text-[rgba(148,163,184,0.5)] hover:text-slate-200 text-lg leading-none bg-transparent border-none cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* 영업시간 */}
      <div className="flex items-center gap-1.5 mb-3 text-xs text-[rgba(148,163,184,0.7)]">
        <span>🕐</span>
        <span>{t.mall.openHours}: {mall.openHours}</span>
      </div>

      {/* 편의시설 목록 */}
      <div className="mb-3">
        <h4 className="text-xs font-bold text-[rgba(148,163,184,0.7)] uppercase tracking-wider mb-2">
          {t.mall.facilities}
        </h4>
        {filteredFacilities.length === 0 ? (
          <p className="text-xs text-[rgba(148,163,184,0.4)] text-center py-3">
            선택한 필터에 해당하는 시설이 없습니다
          </p>
        ) : (
          <ul className="space-y-1.5">
            {filteredFacilities.map((f, i) => {
              const cfg = mallFacilityConfig[f.type]
              return (
                <li
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg text-xs"
                  style={{ background: cfg.bgColor, border: `1px solid ${cfg.borderColor}` }}
                >
                  <span className="text-sm leading-none mt-0.5">{cfg.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold" style={{ color: cfg.color }}>
                      {t.mall.facilityTypes[f.type]}
                    </span>
                    <span className="text-[rgba(200,200,220,0.8)] ml-1">— {f.location}</span>
                    {f.notes && (
                      <span className="block text-[rgba(148,163,184,0.6)] mt-0.5">{f.notes}</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* 웹사이트 */}
      {mall.website && (
        <a
          href={mall.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[rgba(100,116,139,0.8)] hover:text-slate-200 no-underline"
        >
          🔗 {t.mall.website}
        </a>
      )}
    </div>
  )
}
