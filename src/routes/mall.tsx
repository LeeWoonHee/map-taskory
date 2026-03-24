import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  malls,
  mallFacilityConfig,
  mallTypeConfig,
  type Mall,
  type MallFacilityType,
} from "../data/mallData";
import { useLanguage } from "../i18n/LanguageContext";
import { useMyLocation } from "../hooks/useMyLocation";

export const Route = createFileRoute("/mall")({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "서울 생활 지도 | 쇼핑몰",
      },
      {
        name: "description",
        content:
          "서울 쇼핑몰 흡연구역, 공공화장실, 약국 위치를 지도에서 한눈에 확인하세요.",
      },
      {
        name: "keywords",
        content:
          "서울쇼핑몰흡연구역,서울공공화장실,서울약국,서울지도, 서울화장실, 스타필드흡연, 백화점흡연, 스타필드편의점, 백화점편의점, 내근처 약국, 내근처화장실, 내근처공공화장실, 무료화장실, 서울무료화장실, 내근처무료화장실, 서울약국위치, 서울화장실위치,서울쇼핑몰흡연구역, 서울쇼핑몰흡연실, 서울쇼핑몰편의점, 서울쇼핑몰화장실, 서울쇼핑몰위치, 스타필드위치, 스타필드흡연구역, 스타필드흡연실, 스타필드편의점, 스타필드화장실, 백화점위치, 백화점흡연구역, 백화점흡연실, 백화점편의점, 백화점화장실, 신세계백화점편의점, 신세계백화점흡연실, 신세계백화점흡연구역, 신세계백화점편의점, 현대백화점흡연실, 현대백화점흡연구역, 현대백화점편의점, 현대백화점화장실, 롯데월드몰흡연실, 롯데월드몰흡연구역, 롯데월드몰편의점, 롯데월드몰화장실, 코엑스흡연실, 코엑스흡연구역, 코엑스편의점, 코엑스화장실, 타임스퀘어흡연구역, 타임스퀘어흡연실, 타임스퀘어편의점, 타임스퀘어화장실",
      },
      {
        property: "og:title",
        content: "서울 생활 지도 | 쇼핑몰",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://map.taskory.work" },
      {
        property: "og:description",
        content: "서울 생활 지도 | 쇼핑몰 편의시설",
      },
      {
        name: "theme-color",
        content: "#FFFFFF",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "kakao:title",
        content: "서울 생활 지도 | 쇼핑몰",
      },
      {
        name: "google-site-verification",
        content: "YK0uylhG5mPDeUcfzmsuhiJ_5qlXkI12xLZ0JuVftgo",
      },
      {
        name: "naver-site-verification",
        content: "6c07ca86af04ede6ffe86e65679475019a3a4eed",
      },
    ],
  }),
  component: MallPage,
});

const SEOUL_CENTER = { lat: 37.538, lng: 126.99 };
const ZOOM = 14;

const FACILITY_FILTERS: MallFacilityType[] = [
  "convenience",
  "smoking",
  "restroom",
];

function MallPage() {
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedMall, setSelectedMall] = useState<Mall | null>(null);
  // 흡연구역을 기본 필터로 설정
  const [activeFilters, setActiveFilters] = useState<Set<MallFacilityType>>(
    new Set<MallFacilityType>(["smoking"]),
  );
  const { goToMyLocation, locLoading, locError } = useMyLocation(
    mapInstanceRef,
    leafletRef,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 지도 초기화
  useEffect(() => {
    if (!isMounted || !mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;
      if (mapInstanceRef.current) return;

      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      leafletRef.current = L;
      const map = L.map(mapRef.current, { zoomControl: true }).setView(
        [SEOUL_CENTER.lat, SEOUL_CENTER.lng],
        ZOOM,
      );
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
          maxZoom: 19,
        },
      ).addTo(map);

      mapInstanceRef.current = map;
      renderMarkers(L, map);
    });

    return () => {
      cancelled = true;
    };
  }, [isMounted]);

  const createMallIcon = useCallback((L: any, mall: Mall) => {
    const cfg = mallTypeConfig[mall.type];
    return L.divIcon({
      className: "",
      html: `<div style="
        width:40px;height:40px;border-radius:50%;
        background:rgba(15,23,42,0.92);
        border:2.5px solid ${cfg.color};
        box-shadow:0 0 12px ${cfg.color}55;
        display:flex;align-items:center;justify-content:center;
        font-size:18px;cursor:pointer;
      ">${cfg.emoji}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -44],
    });
  }, []);

  const renderMarkers = useCallback(
    (L: any, map: any) => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      malls.forEach((mall) => {
        const icon = createMallIcon(L, mall);
        const marker = L.marker([mall.lat, mall.lng], { icon }).addTo(map);
        marker.on("click", () => setSelectedMall(mall));
        markersRef.current.push(marker);
      });
    },
    [createMallIcon],
  );

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;
    renderMarkers(L, map);
  }, [renderMarkers]);

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
        <span className="text-xs font-semibold text-gray-500 mr-1">
          {t.filterLabel}
        </span>
        {FACILITY_FILTERS.map((f) => {
          const cfg = mallFacilityConfig[f];
          const active = activeFilters.has(f);
          return (
            <button
              key={f}
              onClick={() => toggleFilter(f)}
              style={
                active
                  ? {
                      background: cfg.bgColor,
                      borderColor: cfg.borderColor,
                      color: cfg.color,
                    }
                  : undefined
              }
              className={[
                "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer",
                active
                  ? "border-current"
                  : "bg-white border-gray-200 text-gray-400",
              ].join(" ")}
            >
              <span>{cfg.emoji}</span>
              <span>{t.mall.facilityTypes[f]}</span>
            </button>
          );
        })}
        <span className="ml-auto text-xs text-gray-400">
          {malls.length}개 쇼핑몰
        </span>
      </div>

      {/* 지도 + 사이드 패널 */}
      <div className="flex-1 relative flex overflow-hidden">
        <div ref={mapRef} className="flex-1 z-0" />

        {/* 내 위치 버튼 */}
        <div className="absolute bottom-4 right-3 z-1000 flex flex-col items-end gap-2 pointer-events-none">
          {locError && (
            <div className="pointer-events-auto px-3 py-1.5 rounded-lg text-xs bg-[#0C1220]/95 border border-white/10 text-slate-300 shadow-lg">
              ⚠️ {locError}
            </div>
          )}
          <button
            onClick={goToMyLocation}
            disabled={locLoading}
            title="내 위치"
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
            selectedMall
              ? "max-h-[55vh] sm:max-h-full"
              : "max-h-0 sm:max-h-full overflow-hidden",
          ].join(" ")}
        >
          {selectedMall ? (
            <MallDetail
              mall={selectedMall}
              filteredFacilities={filteredFacilities}
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

function MallDetail({
  mall,
  filteredFacilities,
  onClose,
  t,
}: {
  mall: Mall;
  filteredFacilities: ReturnType<typeof mall.facilities.filter>;
  onClose: () => void;
  t: any;
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
          <h3 className="text-base font-bold text-slate-200 truncate">
            {mall.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{mall.address}</p>
        </div>
        <button
          onClick={onClose}
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
            선택한 필터에 해당하는 시설이 없습니다
          </p>
        ) : (
          <ul className="space-y-1.5">
            {filteredFacilities.map((f, i) => {
              const cfg = mallFacilityConfig[f.type];
              return (
                <li
                  key={i}
                  className="flex items-start gap-2 p-2 rounded-lg text-xs"
                  style={{
                    background: cfg.bgColor,
                    border: `1px solid ${cfg.borderColor}`,
                  }}
                >
                  <span className="text-sm leading-none mt-0.5">
                    {cfg.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span
                      className="font-semibold"
                      style={{ color: cfg.color }}
                    >
                      {t.mall.facilityTypes[f.type]}
                    </span>
                    <span className="text-[rgba(200,200,220,0.8)] ml-1">
                      — {f.location}
                    </span>
                    {f.notes && (
                      <span className="block text-gray-500 mt-0.5">
                        {f.notes}
                      </span>
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
}
