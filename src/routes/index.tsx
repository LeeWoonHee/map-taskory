import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { EventBanner } from '../components/EventBanner'
import { FilterBar } from '../components/FilterBar'
import { MapView } from '../components/MapView'
import { locations, categoryConfig, type Category, type Location } from '../data/locations'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(
    new Set(['convenience', 'smoking', 'restroom']),
  )
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const handleToggle = useCallback((category: Category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }, [])

  const handleSelectLocation = useCallback((location: Location | null) => {
    setSelectedLocation(location)
  }, [])

  const filteredCount = locations.filter((l) => activeCategories.has(l.category)).length

  return (
    <div
      className="flex flex-col"
      style={{
        height: 'calc(100dvh - 57px)',
        background: 'linear-gradient(180deg, #0F0A1E 0%, #1A1232 100%)',
      }}
    >
      {/* BTS 공연 배너 */}
      <EventBanner />

      {/* 필터 바 */}
      <FilterBar
        activeCategories={activeCategories}
        onToggle={handleToggle}
        locations={locations}
      />

      {/* 지도 영역 */}
      <div className="relative flex-1 overflow-hidden">
        <MapView
          locations={locations}
          activeCategories={activeCategories}
          onSelectLocation={handleSelectLocation}
        />

        {/* 선택된 장소 정보 카드 — 모바일: 하단 풀폭 / 데스크탑: 우측 고정 */}
        {selectedLocation && (
          <div className="absolute bottom-24 left-3 right-3 sm:bottom-5 sm:left-auto sm:right-4 sm:w-80 z-[1000]">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(15, 10, 30, 0.94)',
                backdropFilter: 'blur(20px)',
                border: `1.5px solid ${categoryConfig[selectedLocation.category].color}55`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.45), 0 0 24px ${categoryConfig[selectedLocation.category].color}22`,
              }}
            >
              {/* 헤더 */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderBottom: `1px solid ${categoryConfig[selectedLocation.category].color}33`,
                  background: `linear-gradient(135deg, ${categoryConfig[selectedLocation.category].bgColor}, transparent)`,
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl flex-shrink-0">{categoryConfig[selectedLocation.category].emoji}</span>
                  <div className="min-w-0">
                    <div
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: categoryConfig[selectedLocation.category].color }}
                    >
                      {categoryConfig[selectedLocation.category].label}
                    </div>
                    <div className="text-sm font-bold text-white leading-tight truncate">
                      {selectedLocation.name}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLocation(null)}
                  className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-sm transition hover:scale-110 ml-2"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>

              {/* 본문 */}
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-start gap-2 text-xs" style={{ color: 'rgba(216,180,254,0.7)' }}>
                  <span className="mt-0.5 flex-shrink-0">📍</span>
                  <span className="leading-relaxed">{selectedLocation.address}</span>
                </div>
                {selectedLocation.description && (
                  <div
                    className="rounded-xl px-3 py-2 text-xs leading-relaxed"
                    style={{
                      background: 'rgba(123,78,171,0.15)',
                      color: '#d8b4fe',
                      border: '1px solid rgba(123,78,171,0.25)',
                    }}
                  >
                    💡 {selectedLocation.description}
                  </div>
                )}
                {selectedLocation.brand && (
                  <div className="flex items-center gap-1.5">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{
                        background: categoryConfig[selectedLocation.category].bgColor,
                        color: categoryConfig[selectedLocation.category].color,
                        border: `1px solid ${categoryConfig[selectedLocation.category].borderColor}`,
                      }}
                    >
                      {selectedLocation.brand}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 장소 개수 뱃지 — 우측 상단 (좌측은 Leaflet +/- 버튼) */}
        <div
          className="absolute top-3 right-3 z-[1000] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
          style={{
            background: 'rgba(15, 10, 30, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(123, 78, 171, 0.4)',
            color: '#d8b4fe',
            boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}
        >
          <span>📍</span>
          <span>{filteredCount}개 표시 중</span>
        </div>
      </div>
    </div>
  )
}
