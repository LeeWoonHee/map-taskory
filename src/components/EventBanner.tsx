export function EventBanner() {
  return (
    <div
      className="bts-banner relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0F0A1E 0%, #1A1232 40%, #2D1B5E 70%, #1A1232 100%)',
        borderBottom: '1px solid rgba(123, 78, 171, 0.4)',
      }}
    >
      {/* 배경 별빛 효과 */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(123,78,171,0.35), transparent 70%)',
        }}
      />

      {/* 반짝이는 별들 */}
      {[
        { top: '20%', left: '8%', delay: '0s', size: '6px' },
        { top: '60%', left: '15%', delay: '0.6s', size: '4px' },
        { top: '30%', left: '85%', delay: '1.2s', size: '5px' },
        { top: '70%', left: '92%', delay: '0.3s', size: '4px' },
        { top: '15%', left: '50%', delay: '0.9s', size: '3px' },
        { top: '75%', left: '60%', delay: '1.5s', size: '5px' },
        { top: '45%', left: '25%', delay: '0.4s', size: '4px' },
        { top: '55%', left: '75%', delay: '1.8s', size: '3px' },
      ].map((star, i) => (
        <div
          key={i}
          className="bts-star pointer-events-none absolute rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            background: 'white',
            animationDelay: star.delay,
            boxShadow: '0 0 4px 1px rgba(255,255,255,0.6)',
          }}
        />
      ))}

      {/* 컨텐츠 */}
      <div className="relative flex flex-col items-center justify-center gap-1 px-4 py-3 sm:flex-row sm:gap-4 sm:py-3.5">
        {/* 날짜 뱃지 */}
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider"
          style={{
            background: 'rgba(123, 78, 171, 0.35)',
            border: '1px solid rgba(155, 110, 196, 0.5)',
            color: '#d8b4fe',
          }}
        >
          <span>📅</span>
          <span>2026.03.21 (토)</span>
        </div>

        {/* 메인 텍스트 */}
        <div className="bts-float flex items-center gap-2">
          <span className="text-xl sm:text-2xl" style={{ filter: 'drop-shadow(0 0 8px #a855f7)' }}>
            💜
          </span>
          <span
            className="bts-shimmer-text text-base font-extrabold tracking-tight sm:text-lg"
          >
            BTS 광화문 무료 공연
          </span>
          <span className="text-xl sm:text-2xl" style={{ filter: 'drop-shadow(0 0 8px #a855f7)' }}>
            💜
          </span>
        </div>

        {/* 서브텍스트 */}
        <div
          className="text-xs font-semibold"
          style={{ color: 'rgba(216, 180, 254, 0.7)' }}
        >
          광화문광장 · 편의시설 안내
        </div>
      </div>

      {/* 하단 보라색 글로우 라인 */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(123,78,171,0.8) 30%, #a855f7 50%, rgba(123,78,171,0.8) 70%, transparent)',
        }}
      />
    </div>
  )
}
