import { Link, useLocation } from "@tanstack/react-router";
import { useLanguage } from "../i18n/LanguageContext";

const NAV_ITEMS = [
  {
    to: "/mall",
    key: "mall" as const,
    emoji: "🏬",
    color: "#EA580C",
    activeBg: "#FFF7ED",
    activeBorder: "#FED7AA",
  },
  {
    to: "/toilet",
    key: "toilet" as const,
    emoji: "🚻",
    color: "#2563EB",
    activeBg: "#EFF6FF",
    activeBorder: "#BFDBFE",
  },
  {
    to: "/pharmacy",
    key: "pharmacy" as const,
    emoji: "💊",
    color: "#059669",
    activeBg: "#ECFDF5",
    activeBorder: "#A7F3D0",
  },
] as const;

export default function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();
  const isActive = (to: string) => location.pathname.startsWith(to);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-around bg-white border-t-2 border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
      {NAV_ITEMS.map(({ to, key, emoji, color, activeBg, activeBorder }) => {
        const active = isActive(to);
        return (
          <Link key={to} to={to} className="flex-1 max-w-36 no-underline">
            <div
              className="flex flex-col items-center gap-1 py-1.5 mx-2 rounded-2xl transition-all duration-150"
              style={
                active
                  ? { background: activeBg, border: `1.5px solid ${activeBorder}` }
                  : { border: "1.5px solid transparent" }
              }
            >
              <span className="text-2xl leading-none">{emoji}</span>
              <span
                className="text-[11px] font-bold leading-none"
                style={{ color: active ? color : "#9CA3AF" }}
              >
                {t.nav[key]}
              </span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
