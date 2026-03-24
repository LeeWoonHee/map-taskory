import { Link, useLocation } from "@tanstack/react-router";
import { useLanguage } from "../i18n/LanguageContext";
import { LANGUAGES } from "../i18n/translations";

const NAV_ITEMS = [
  { to: "/mall", key: "mall" as const, emoji: "🚬" },
  { to: "/toilet", key: "toilet" as const, emoji: "🚻" },
  { to: "/pharmacy", key: "pharmacy" as const, emoji: "💊" },
] as const;

export default function Header() {
  const { lang, setLang, t } = useLanguage();
  const location = useLocation();

  const isActive = (to: string) => location.pathname.startsWith(to);

  return (
    <header className="sticky top-0 z-50 px-3 bg-[rgba(15,23,42,0.95)] backdrop-blur-xl border-b border-[rgba(100,116,139,0.15)] shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
      <nav className="flex items-center gap-1.5 py-2.5 max-w-[1800px] mx-auto">
        {/* 로고 */}
        <Link
          to="/mall"
          className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-bold no-underline transition hover:opacity-80 bg-[rgba(30,41,59,0.8)] border border-[rgba(100,116,139,0.25)] text-slate-200"
        >
          <span>🗺️</span>
        </Link>

        {/* 페이지 탭 */}
        <div className="flex items-center gap-0.5">
          {NAV_ITEMS.map(({ to, key, emoji }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={[
                  "inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold no-underline transition-all duration-150 whitespace-nowrap",
                  active
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[rgba(30,41,59,0.8)]",
                ].join(" ")}
              >
                <span>{emoji}</span>
                <span>{t.nav[key]}</span>
              </Link>
            );
          })}
        </div>

        {/* 언어 스위처 */}
        <div className="ml-auto flex items-center gap-0.5 rounded-full p-0.5 bg-[rgba(30,41,59,0.6)] border border-[rgba(100,116,139,0.15)]">
          {LANGUAGES.map(({ code, flag, label }) => {
            const active = lang === code;
            return (
              <button
                key={code}
                onClick={() => setLang(code)}
                title={code.toUpperCase()}
                className={
                  active
                    ? "inline-flex items-center gap-[3px] px-[7px] py-1 rounded-full text-[11px] font-bold cursor-pointer border-none transition-all duration-150 bg-slate-600 text-white"
                    : "inline-flex items-center gap-[3px] px-[7px] py-1 rounded-full text-[11px] font-bold cursor-pointer border-none transition-all duration-150 bg-transparent text-slate-400"
                }
              >
                <span style={{ fontSize: "12px" }}>{flag}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
