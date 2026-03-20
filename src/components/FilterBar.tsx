import type { Category, Location } from '../data/locations'
import { categoryConfig } from '../data/locations'

interface FilterBarProps {
  activeCategories: Set<Category>
  onToggle: (category: Category) => void
  locations: Location[]
}

const CATEGORIES: Category[] = ['convenience', 'smoking', 'restroom']

export function FilterBar({ activeCategories, onToggle, locations }: FilterBarProps) {
  const countByCategory = (category: Category) =>
    locations.filter((l) => l.category === category).length

  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto"
      style={{
        background: 'rgba(15, 10, 30, 0.6)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(123, 78, 171, 0.2)',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        flexShrink: 0,
      }}
    >
      <span
        className="text-xs font-bold tracking-widest uppercase flex-shrink-0"
        style={{ color: 'rgba(155, 110, 196, 0.8)' }}
      >
        필터
      </span>
      {CATEGORIES.map((category) => {
        const config = categoryConfig[category]
        const isActive = activeCategories.has(category)
        const count = countByCategory(category)

        return (
          <button
            key={category}
            onClick={() => onToggle(category)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              border: `1.5px solid ${isActive ? config.color : 'rgba(123, 78, 171, 0.25)'}`,
              background: isActive ? config.bgColor : 'rgba(15, 10, 30, 0.4)',
              color: isActive ? config.color : 'rgba(155, 110, 196, 0.6)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: isActive
                ? `0 0 12px ${config.color}33, inset 0 1px 0 rgba(255,255,255,0.08)`
                : 'none',
              transform: isActive ? 'translateY(-1px)' : 'none',
            }}
            aria-pressed={isActive}
          >
            <span style={{ fontSize: '15px', lineHeight: 1 }}>{config.emoji}</span>
            <span>{config.label}</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '20px',
                height: '20px',
                borderRadius: '9999px',
                background: isActive ? config.color : 'rgba(123, 78, 171, 0.2)',
                color: isActive ? 'white' : 'rgba(155, 110, 196, 0.7)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '0 5px',
              }}
            >
              {count}
            </span>
          </button>
        )
      })}

      {/* 구분선 */}
      <div style={{ width: '1px', height: '20px', background: 'rgba(123, 78, 171, 0.25)', flexShrink: 0 }} />

      {/* 전체 토글 */}
      <button
        onClick={() => {
          const allActive = CATEGORIES.every((c) => activeCategories.has(c))
          if (allActive) {
            CATEGORIES.forEach((c) => activeCategories.has(c) && onToggle(c))
          } else {
            CATEGORIES.forEach((c) => !activeCategories.has(c) && onToggle(c))
          }
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '6px 12px',
          borderRadius: '9999px',
          border: '1.5px solid rgba(123, 78, 171, 0.3)',
          background: 'rgba(123, 78, 171, 0.1)',
          color: 'rgba(155, 110, 196, 0.8)',
          fontSize: '12px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.18s ease',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}
      >
        {CATEGORIES.every((c) => activeCategories.has(c)) ? '전체 숨기기' : '전체 보기'}
      </button>
    </div>
  )
}
