import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  malls,
  mallFacilityConfig,
  mallTypeConfig,
  type Mall,
  type MallFacilityType,
} from "../data/mallData";
import { useLanguage } from "../i18n/LanguageContext";
import { useMyLocation } from "../hooks/useMyLocation";
import { loadKakaoMap } from "../lib/kakaoMap";
import type { Translations } from "../i18n/translations";
import { SEOUL_CENTER } from "../constants";

export const Route = createFileRoute("/mall")({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "서울 생활 지도 | 쇼핑몰" },
      {
        name: "description",
        content: "서울 쇼핑몰 흡연구역, 공공화장실, 약국 위치를 지도에서 한눈에 확인하세요.",
      },
      {
        name: "keywords",
        content:
          "서울쇼핑몰흡연구역,서울공공화장실,서울약국,서울지도, 서울화장실, 스타필드흡연, 백화점흡연, 스타필드편의점, 백화점편의점, 내근처 약국, 내근처화장실, 내근처공공화장실, 무료화장실, 서울무료화장실, 내근처무료화장실, 서울약국위치, 서울화장실위치,서울쇼핑몰흡연구역, 서울쇼핑몰흡연실, 서울쇼핑몰편의점, 서울쇼핑몰화장실, 서울쇼핑몰위치, 스타필드위치, 스타필드흡연구역, 스타필드흡연실, 스타필드편의점, 스타필드화장실, 백화점위치, 백화점흡연구역, 백화점흡연실, 백화점편의점, 백화점화장실, 신세계백화점편의점, 신세계백화점흡연실, 신세계백화점흡연구역, 신세계백화점편의점, 현대백화점흡연실, 현대백화점흡연구역, 현대백화점편의점, 현대백화점화장실, 롯데월드몰흡연실, 롯데월드몰흡연구역, 롯데월드몰편의점, 롯데월드몰화장실, 코엑스흡연실, 코엑스흡연구역, 코엑스편의점, 코엑스화장실, 타임스퀘어흡연구역, 타임스퀘어흡연실, 타임스퀘어편의점, 타임스퀘어화장실",
      },
      { property: "og:title", content: "서울 생활 지도 | 쇼핑몰" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://map.taskory.work" },
      { property: "og:description", content: "서울 생활 지도 | 쇼핑몰 편의시설" },
      { name: "theme-color", content: "#FFFFFF" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "kakao:title", content: "서울 생활 지도 | 쇼핑몰" },
      { name: "google-site-verification", content: "YK0uylhG5mPDeUcfzmsuhiJ_5qlXkI12xLZ0JuVftgo" },
      { name: "naver-site-verification", content: "6c07ca86af04ede6ffe86e65679475019a3a4eed" },
    ],
  }),
  component: MallPage,
});

const FACILITY_FILTERS: MallFacilityType[] = ["convenience", "smoking", "restroom"];

function MallPage() {
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedMall, setSelectedMall] = useState<Mall | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<MallFacilityType>>(
    new Set<MallFacilityType>(["smoking"]),
  );
  const { goToMyLocation, locLoading, locError } = useMyLocation(mapInstanceRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const createOverlay = useCallback(
    (map: kakao.maps.Map, mall: Mall) => {
      const cfg = mallTypeConfig[mall.type];
      const el = document.createElement("div");
      el.style.cssText = `
        width:40px;height:40px;border-radius:50%;
        background:rgba(15,23,42,0.92);
        border:2.5px solid ${cfg.color};
        box-shadow:0 0 12px ${cfg.color}55;
        display:flex;align-items:center;justify-content:center;
        font-size:18px;cursor:pointer;
        transform:translate(-50%,-100%);
      `;
      el.textContent = cfg.emoji;
      el.addEventListener("click", () => setSelectedMall(mall));

      return new kakao.maps.CustomOverlay({
        position: new kakao.maps.LatLng(mall.lat, mall.lng),
        content: el,
        map,
        yAnchor: 1,
        xAnchor: 0.5,
        zIndex: 3,
      });
    },
    [],
  );

  const renderOverlays = useCallback(
    (map: kakao.maps.Map) => {
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
      malls.forEach((mall) => {
        overlaysRef.current.push(createOverlay(map, mall));
      });
    },
    [createOverlay],
  );

  // 지도 초기화
  useEffect(() => {
    if (!isMounted || !mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    loadKakaoMap().then(() => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      const map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng),
        level: 7,
      });
      mapInstanceRef.current = map;
      renderOverlays(map);
    });

    return () => {
      cancelled = true;
    };
  }, [isMounted, renderOverlays]);

  const toggleFilter = (f: MallFacilityType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  };

  const filteredFacilities =
    selectedMall?.facilities.filter((f) => activeFilters.has(f.type)) ?? [];

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-108px)] text-gray-400 text-sm">
        {t.loadingMap}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-[calc(100dvh-108px)]">
      {/* 필터 바 */}
      <div className="flex-shrink-0 px-3 py-2 flex items-center gap-2 bg-white border-b border-gray-200">
        <span className="text-xs font-semibold text-gray-500 mr-1">{t.filterLabel}</span>
        {FACILITY_FILTERS.map((f) => {
          const cfg = mallFacilityConfig[f];
          const active = activeFilters.has(f);
          return (
            <button
              key={f}
              onClick={() => toggleFilter(f)}
              aria-pressed={active}
              aria-label={`${t.mall.facilityTypes[f]} 필터 ${active ? "해제" : "적용"}`}
              style={
                active
                  ? { background: cfg.bgColor, borderColor: cfg.borderColor, color: cfg.color }
                  : undefined
              }
              className={[
                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                active ? "border-current" : "bg-white border-gray-200 text-gray-600",
              ].join(" ")}
            >
              <span>{cfg.emoji}</span>
              <span>{t.mall.facilityTypes[f]}</span>
            </button>
          );
        })}
        <span className="ml-auto text-xs text-gray-400">{malls.length}개 쇼핑몰</span>
      </div>

      {/* 지도 + 사이드 패널 */}
      <div className="flex-1 relative flex overflow-hidden">
        <div ref={mapRef} className="flex-1 z-0" />

        {/* 내 위치 버튼 */}
        <div className="absolute bottom-4 right-3 z-[1000] flex flex-col items-end gap-2 pointer-events-none">
          {locError && (
            <div className="pointer-events-auto px-3 py-1.5 rounded-lg text-xs bg-[#0C1220]/95 border border-white/10 text-slate-300 shadow-lg max-w-[200px]">
              ⚠️ {locError}
            </div>
          )}
          <button
            onClick={goToMyLocation}
            disabled={locLoading}
            aria-label="현재 위치로 이동"
            aria-busy={locLoading}
            className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-[#0C1220]/92 border border-white/10 text-slate-300 text-lg shadow-md hover:text-white hover:border-slate-400 transition-all cursor-pointer"
          >
            {locLoading ? (
              <span className="animate-spin text-sm inline-block">⟳</span>
            ) : (
              "🧭"
            )}
          </button>
        </div>

        {/* 선택된 쇼핑몰 정보 패널 */}
        <div
          className={[
            "absolute bottom-0 left-0 right-0 sm:relative sm:bottom-auto sm:left-auto sm:right-auto",
            "sm:w-80 sm:flex-shrink-0 overflow-y-auto",
            "bg-white border-t sm:border-t-0 sm:border-l border-gray-200",
            "transition-all duration-300 z-10",
            selectedMall ? "max-h-[50vh] sm:max-h-full" : "max-h-0 sm:max-h-full overflow-hidden",
          ].join(" ")}
        >
          {selectedMall ? (
            <MallDetail
              mall={selectedMall}
              filteredFacilities={filteredFacilities}
              activeFilters={activeFilters}
              onClose={() => setSelectedMall(null)}
              t={t}
            />
          ) : (
            <div className="hidden sm:flex items-center justify-center h-full text-sm text-[rgba(148,163,184,0.4)] p-8 text-center">
              {t.mall.selectMall}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MallDetail = memo(function MallDetail({
  mall,
  filteredFacilities,
  activeFilters,
  onClose,
  t,
}: {
  mall: Mall;
  filteredFacilities: ReturnType<typeof mall.facilities.filter>;
  activeFilters: Set<MallFacilityType>;
  onClose: () => void;
  t: Translations;
}) {
  const typeCfg = mallTypeConfig[mall.type];

  return (
    <div className="p-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{
                color: typeCfg.color,
                borderColor: `${typeCfg.color}55`,
                background: `${typeCfg.color}18`,
              }}
            >
              {typeCfg.emoji} {t.mall.mallTypes[mall.type]}
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-900 truncate">{mall.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{mall.address}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="패널 닫기"
          className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-700 text-lg leading-none bg-transparent border-none cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* 영업시간 */}
      <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
        <span>🕐</span>
        <span>
          {t.mall.openHours}: {mall.openHours}
        </span>
      </div>

      {/* 편의시설 목록 */}
      <div className="mb-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          {t.mall.facilities}
        </h4>
        {filteredFacilities.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-3">
            {activeFilters.has("smoking")
              ? "확인된 흡연구역 없음"
              : "선택한 필터에 해당하는 시설이 없습니다"}
          </p>
        ) : (
          <ul className="space-y-1.5">
            {filteredFacilities.map((f, i) => {
              const cfg = mallFacilityConfig[f.type];
              return (
                <li
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg text-xs"
                  style={{ background: cfg.bgColor, border: `1px solid ${cfg.borderColor}` }}
                >
                  <span className="text-sm leading-none mt-0.5">{cfg.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold" style={{ color: cfg.color }}>
                      {t.mall.facilityTypes[f.type]}
                    </span>
                    <span className="text-[rgba(200,200,220,0.8)] ml-1">— {f.location}</span>
                    {f.notes && (
                      <span className="block text-gray-500 mt-0.5">{f.notes}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* 웹사이트 */}
      {mall.website && (
        <a
          href={mall.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 no-underline"
        >
          🔗 {t.mall.website}
        </a>
      )}
    </div>
  );
});
