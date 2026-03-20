import { Link } from "@tanstack/react-router";
import { useLanguage } from "../i18n/LanguageContext";
import { LANGUAGES } from "../i18n/translations";

export default function Header() {
  const { lang, setLang, t } = useLanguage();

  const legendItems = [
    { emoji: "🏪", label: t.legendLabels.convenience, color: "#10B981" },
    { emoji: "🚬", label: t.legendLabels.smoking, color: "#F59E0B" },
    { emoji: "🚻", label: t.legendLabels.restroom, color: "#3B82F6" },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 bg-[rgba(15,10,30,0.88)] backdrop-blur-xl border-b border-[rgba(123,78,171,0.3)] shadow-[0_2px_20px_rgba(0,0,0,0.3)]">
      <nav className="page-wrap flex items-center gap-x-2 py-3 sm:py-3.5">
        {/* 로고 */}
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-sm font-bold tracking-tight no-underline transition hover:scale-105 bg-[rgba(123,78,171,0.2)] border-[1.5px] border-[rgba(155,110,196,0.4)] text-[#d8b4fe] shadow-[0_0_12px_rgba(123,78,171,0.2)]"
          >
            <span className="text-base">💜</span>
            <span className="font-bold tracking-tight">{t.appTitle}</span>
          </Link>
        </h2>

        {/* 서브 타이틀 — 데스크탑 전용 */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[rgba(155,110,196,0.6)]">
          <span>{t.appSubTitle}</span>
          <span className="rounded-full px-2 py-0.5 text-xs font-bold bg-[rgba(168,85,247,0.15)] text-[#a855f7] border border-[rgba(168,85,247,0.3)]">
            {t.eventDate}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* 범례 — 데스크탑 전용 */}
          <div className="hidden sm:flex items-center gap-3 mr-1">
            {legendItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: item.color }}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* 언어 스위처 */}
          <div className="flex items-center gap-0.5 rounded-full p-0.5 bg-[rgba(123,78,171,0.12)] border border-[rgba(123,78,171,0.25)]">
            {LANGUAGES.map(({ code, flag, label }) => {
              const isActive = lang === code;
              return (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  title={code.toUpperCase()}
                  className={
                    isActive
                      ? "inline-flex items-center gap-[3px] px-[7px] py-1 rounded-full text-[11px] font-bold cursor-pointer border-none transition-all duration-150 bg-gradient-to-br from-bts-purple to-bts-light text-white shadow-[0_0_8px_rgba(123,78,171,0.5)]"
                      : "inline-flex items-center gap-[3px] px-[7px] py-1 rounded-full text-[11px] font-bold cursor-pointer border-none transition-all duration-150 bg-transparent text-[rgba(155,110,196,0.65)]"
                  }
                >
                  <span style={{ fontSize: "12px" }}>{flag}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </nav>
    </header>
  );
}
