import { Link } from "@tanstack/react-router";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 px-4"
      style={{
        background: "rgba(15, 10, 30, 0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(123, 78, 171, 0.3)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.3)",
      }}
    >
      <nav className="page-wrap flex items-center gap-x-3 py-3 sm:py-3.5">
        {/* 로고 */}
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <a
            href="https://www.netflix.com/kr/title/82157128"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm no-underline transition hover:scale-105 sm:px-4 sm:py-2"
            style={{
              background: "rgba(123, 78, 171, 0.2)",
              border: "1.5px solid rgba(155, 110, 196, 0.4)",
              color: "#d8b4fe",
              boxShadow: "0 0 12px rgba(123,78,171,0.2)",
            }}
          >
            <span className="text-base">💜</span>
            <span className="font-bold tracking-tight">광화문 공연 가이드</span>
          </a>
        </h2>

        {/* 서브 타이틀 - 데스크탑에서만 표시 */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
          <span>BTS 무료 공연 편의시설 안내</span>
          <span
            className="rounded-full px-2 py-0.5 text-xs font-bold"
            style={{
              background: "rgba(168, 85, 247, 0.15)",
              color: "#a855f7",
              border: "1px solid rgba(168,85,247,0.3)",
            }}
          >
            2026.03.21
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* 범례 표시 */}
          <div className="hidden sm:flex items-center gap-3">
            {[
              { emoji: "🏪", label: "편의점", color: "#10B981" },
              { emoji: "🚬", label: "흡연구역", color: "#F59E0B" },
              { emoji: "🚻", label: "화장실", color: "#3B82F6" },
            ].map((item) => (
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

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
