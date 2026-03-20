import type { Category, Location } from "../data/locations";
import { categoryConfig } from "../data/locations";
import { useLanguage } from "../i18n/LanguageContext";

interface FilterBarProps {
  activeCategories: Set<Category>;
  onToggle: (category: Category) => void;
  locations: Location[];
}

const CATEGORIES: Category[] = ["convenience", "smoking", "restroom"];

export function FilterBar({
  activeCategories,
  onToggle,
  locations,
}: FilterBarProps) {
  const { t } = useLanguage();
  const countByCategory = (category: Category) =>
    locations.filter((l) => l.category === category).length;

  return (
    <div
      className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto bg-[rgba(15,10,30,0.6)] backdrop-blur-xl border-b border-[rgba(123,78,171,0.2)]"
      style={{
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        flexShrink: 0,
      }}
    >
      <span className="text-xs font-bold tracking-widest uppercase flex-shrink-0 text-[rgba(155,110,196,0.8)]">
        {t.filterLabel}
      </span>

      {CATEGORIES.map((category) => {
        const config = categoryConfig[category];
        const isActive = activeCategories.has(category);
        const count = countByCategory(category);

        return (
          <button
            key={category}
            onClick={() => onToggle(category)}
            className="inline-flex items-center gap-1.5 px-[14px] py-1.5 rounded-full text-[13px] font-semibold cursor-pointer transition-all duration-[180ms] flex-shrink-0 whitespace-nowrap"
            style={{
              border: `1.5px solid ${isActive ? config.color : "rgba(123, 78, 171, 0.25)"}`,
              background: isActive ? config.bgColor : "rgba(15, 10, 30, 0.4)",
              color: isActive ? config.color : "rgba(155, 110, 196, 0.6)",
              boxShadow: isActive
                ? `0 0 12px ${config.color}33, inset 0 1px 0 rgba(255,255,255,0.08)`
                : "none",
              transform: isActive ? "translateY(-1px)" : "none",
            }}
            aria-pressed={isActive}
          >
            <span style={{ fontSize: "15px", lineHeight: 1 }}>
              {config.emoji}
            </span>
            <span>{t.categories[category]}</span>
            <span
              className="inline-flex items-center justify-center min-w-5 h-5 rounded-full text-[11px] font-bold px-[5px]"
              style={{
                background: isActive ? config.color : "rgba(123, 78, 171, 0.2)",
                color: isActive ? "white" : "rgba(155, 110, 196, 0.7)",
              }}
            >
              {count}
            </span>
          </button>
        );
      })}

      {/* 구분선 */}
      <div className="w-px h-5 flex-shrink-0 bg-[rgba(123,78,171,0.25)]" />

      {/* 전체 토글 */}
      <button
        onClick={() => {
          const allActive = CATEGORIES.every((c) => activeCategories.has(c));
          if (allActive) {
            CATEGORIES.forEach((c) => activeCategories.has(c) && onToggle(c));
          } else {
            CATEGORIES.forEach((c) => !activeCategories.has(c) && onToggle(c));
          }
        }}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border-[1.5px] border-[rgba(123,78,171,0.3)] bg-[rgba(123,78,171,0.1)] text-[rgba(155,110,196,0.8)] text-xs font-semibold cursor-pointer transition-all duration-[180ms] flex-shrink-0 whitespace-nowrap"
      >
        {CATEGORIES.every((c) => activeCategories.has(c))
          ? t.allHide
          : t.allShow}
      </button>
    </div>
  );
}
