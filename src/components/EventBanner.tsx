import { useLanguage } from "../i18n/LanguageContext";

export function EventBanner() {
  const { t } = useLanguage();

  return (
    <div className="bts-banner relative overflow-hidden bg-[linear-gradient(135deg,#0F0A1E_0%,#1A1232_40%,#2D1B5E_70%,#1A1232_100%)] border-b border-[rgba(123,78,171,0.4)]">
      {/* 배경 글로우 */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(123,78,171,0.35),transparent_70%)]" />

      {/* 별빛 */}
      {[
        { top: "20%", left: "8%", delay: "0s", size: "6px" },
        { top: "60%", left: "15%", delay: "0.6s", size: "4px" },
        { top: "30%", left: "85%", delay: "1.2s", size: "5px" },
        { top: "70%", left: "92%", delay: "0.3s", size: "4px" },
        { top: "15%", left: "50%", delay: "0.9s", size: "3px" },
        { top: "75%", left: "60%", delay: "1.5s", size: "5px" },
        { top: "45%", left: "25%", delay: "0.4s", size: "4px" },
        { top: "55%", left: "75%", delay: "1.8s", size: "3px" },
      ].map((star, i) => (
        <div
          key={i}
          className="bts-star pointer-events-none absolute rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            background: "white",
            animationDelay: star.delay,
            boxShadow: "0 0 4px 1px rgba(255,255,255,0.6)",
          }}
        />
      ))}

      {/* 컨텐츠 */}
      <div className="relative flex flex-col items-center justify-center gap-1 px-4 py-3 sm:flex-row sm:gap-4 sm:py-3.5">
        {/* 날짜 뱃지 */}
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider bg-[rgba(123,78,171,0.35)] border border-[rgba(155,110,196,0.5)] text-[#d8b4fe]">
          <span>📅</span>
          <span>{t.eventDate}</span>
        </div>

        {/* 메인 텍스트 */}
        <div className="bts-float flex items-center gap-2">
          <span
            className="text-xl sm:text-2xl"
            style={{ filter: "drop-shadow(0 0 8px #a855f7)" }}
          >
            💜
          </span>
          <span className="bts-shimmer-text text-base font-extrabold tracking-tight sm:text-lg">
            {t.eventName}
          </span>
          <span
            className="text-xl sm:text-2xl"
            style={{ filter: "drop-shadow(0 0 8px #a855f7)" }}
          >
            💜
          </span>
        </div>

        {/* 서브텍스트 */}
        <div className="text-xs font-semibold text-[rgba(216,180,254,0.7)]">
          {t.eventSub}
        </div>
      </div>

      {/* 하단 글로우 라인 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-[linear-gradient(90deg,transparent,rgba(123,78,171,0.8)_30%,#a855f7_50%,rgba(123,78,171,0.8)_70%,transparent)]" />
    </div>
  );
}
