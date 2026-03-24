import { useLanguage } from "../i18n/LanguageContext";

export default function Header() {
  const { lang: _lang, setLang: _setLang } = useLanguage();

  return (
    <header className="sticky top-0 z-50 h-11 flex items-center px-4 bg-white border-b border-gray-200 shadow-sm">
      {/* 로고 */}
      <div className="flex items-center gap-1.5">
        <span className="text-base">🗺️</span>
        <span className="text-xs font-bold text-gray-800 tracking-tight hidden sm:block">
          서울 생활 지도
        </span>
      </div>

      {/* 언어 스위처 */}
      {/* <div className="ml-auto flex items-center gap-0.5 bg-gray-100 rounded-full p-0.5">
        {LANGUAGES.map(({ code, flag, label }) => {
          const active = lang === code;
          return (
            <button
              key={code}
              onClick={() => setLang(code)}
              className={[
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer border-none transition-all duration-150",
                active
                  ? "bg-white text-gray-800 shadow-sm"
                  : "bg-transparent text-gray-400 hover:text-gray-600",
              ].join(" ")}
            >
              <span style={{ fontSize: "12px" }}>{flag}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div> */}
    </header>
  );
}
