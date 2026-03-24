import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { fetchPharmaciesByBounds, type Pharmacy } from "../functions/pharmacy";
import { useLanguage } from "../i18n/LanguageContext";
import { useMyLocation } from "../hooks/useMyLocation";
import type { Translations } from "../i18n/translations";
import type { Map, Marker } from "leaflet";
import { SEOUL_CENTER, DEBOUNCE_MS } from "../constants";

type LeafletModule = typeof import("leaflet");

export const Route = createFileRoute("/pharmacy")({
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
        title: "서울 생활 지도 | 약국",
      },
      {
        name: "description",
        content:
          "서울 쇼핑몰 흡연구역, 공공화장실, 약국 위치를 지도에서 한눈에 확인하세요.",
      },
      {
        name: "keywords",
        content:
          "서울약국, 내근처약국, 약국영업시간, 24시간약국, 약국위치, 서울약국위치, 서울24시간약국, 24약국, 야간약국",
      },
      {
        property: "og:title",
        content: "서울 생활 지도 | 약국",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://map.taskory.work" },
      {
        property: "og:description",
        content:
          "서울 쇼핑몰 흡연구역, 공공화장실, 약국 위치를 지도에서 한눈에 확인하세요.",
      },
      {
        name: "theme-color",
        content: "#FFFFFF",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "kakao:title",
        content: "서울 생활 지도 | 약국",
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
  component: PharmacyPage,
});

function PharmacyPage() {
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [noKey, setNoKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<Pharmacy | null>(null);
  const [filter, setFilter] = useState<"all" | "latenight">("all");

  const { goToMyLocation, locLoading, locError } = useMyLocation(
    mapInstanceRef,
    leafletRef,
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 마커 렌더링
  const renderMarkers = useCallback((items: Pharmacy[]) => {
    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!L || !map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    items.forEach((ph) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="width:30px;height:30px;border-radius:50%;background:rgba(15,23,42,0.92);border:2px solid #10B981;box-shadow:0 0 8px #10B98144;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;">💊</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });
      const marker = L.marker([ph.lat, ph.lng], { icon }).addTo(map);
      marker.on("click", () => setModal(ph));
      markersRef.current.push(marker);
    });
  }, []);

  // 현재 지도 중심으로 API 호출
  const fetchByCurrentBounds = useCallback(async () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const center = map.getCenter();
    setLoading(true);
    try {
      const result = await fetchPharmaciesByBounds({
        data: {
          lat: center.lat,
          lng: center.lng,
        },
      });
      if (result.noKey) {
        setNoKey(true);
        setPharmacies([]);
      } else {
        setNoKey(false);
        setPharmacies(result.pharmacies);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 필터 또는 데이터 변경 시 마커 재렌더링
  useEffect(() => {
    const items =
      filter === "latenight"
        ? pharmacies.filter((p) => p.isLateNight)
        : pharmacies;
    renderMarkers(items);
  }, [pharmacies, filter, renderMarkers]);

  // 지도 초기화
  useEffect(() => {
    if (!isMounted || !mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;
      delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })
        ._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      leafletRef.current = L;
      const map = L.map(mapRef.current).setView(
        [SEOUL_CENTER.lat, SEOUL_CENTER.lng],
        14,
      );
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: "&copy; OpenStreetMap &copy; CARTO",
          maxZoom: 19,
        },
      ).addTo(map);
      mapInstanceRef.current = map;

      // 지도 이동/줌 완료 시 디바운스 호출
      const onMoveEnd = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          fetchByCurrentBounds();
        }, DEBOUNCE_MS);
      };

      map.on("moveend", onMoveEnd);
      map.on("zoomend", onMoveEnd);

      // 초기 로드
      setTimeout(() => fetchByCurrentBounds(), 300);
    });

    return () => {
      cancelled = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [isMounted, fetchByCurrentBounds]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-108px)] text-gray-400 text-sm">
        {t.pharmacy.loading}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-[calc(100dvh-108px)]">
      {/* 상태 바 */}
      <div className="flex-shrink-0 px-3 py-2 flex items-center gap-2 bg-white border-b border-gray-200">
        <span className="text-xs font-semibold text-[rgba(16,185,129,0.8)]">
          💊
        </span>
        {/* 필터 뱃지 */}
        <button
          onClick={() => setFilter("all")}
          aria-pressed={filter === "all"}
          aria-label="전체 약국 보기"
          className={[
            "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border cursor-pointer transition-all",
            filter === "all"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "bg-white border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600",
          ].join(" ")}
        >
          전체
        </button>
        <button
          onClick={() => setFilter("latenight")}
          aria-pressed={filter === "latenight"}
          aria-label="24시간 야간 약국만 보기"
          className={[
            "px-2.5 py-0.5 rounded-full text-[11px] font-semibold border cursor-pointer transition-all",
            filter === "latenight"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "bg-white border-gray-200 text-gray-500 hover:border-emerald-400 hover:text-emerald-600",
          ].join(" ")}
        >
          24시·00시
        </button>
        <span className="ml-auto text-xs text-[rgba(148,163,184,0.4)]">
          {noKey ? (
            <span className="text-amber-500">⚠ API 키 미설정</span>
          ) : loading ? (
            <span className="text-gray-400">검색 중...</span>
          ) : (
            t.pharmacy.countBadge(
              filter === "latenight"
                ? pharmacies.filter((p) => p.isLateNight).length
                : pharmacies.length,
            )
          )}
        </span>
      </div>

      {/* 지도 */}
      <div ref={mapRef} className="flex-1 z-0" />

      {/* 로딩 오버레이 */}
      {loading && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-1000 px-3 py-1.5 rounded-full text-xs bg-[rgba(15,23,42,0.9)] border border-[rgba(16,185,129,0.3)] text-[rgba(16,185,129,0.8)] shadow-lg">
          <span className="animate-pulse">💊 약국 검색 중...</span>
        </div>
      )}

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

      {/* API 키 없을 때 안내 */}
      {noKey && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-1000 w-[90%] max-w-sm">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-600 text-center shadow-lg">
            <div className="text-base mb-1">⚠️</div>
            {t.pharmacy.noKey}
          </div>
        </div>
      )}

      {/* 모달 */}
      {modal && (
        <PharmacyModal pharmacy={modal} onClose={() => setModal(null)} t={t} />
      )}
    </div>
  );
}

const CopyButton = memo(function CopyButton({
  text,
  label,
  copied: copiedLabel,
}: {
  text: string;
  label: string;
  copied: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={copied ? "복사됨" : `${label} 복사`}
      className={[
        "shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold border cursor-pointer transition-all",
        copied
          ? "bg-[rgba(16,185,129,0.2)] border-[rgba(16,185,129,0.4)] text-venue-green"
          : "bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-700",
      ].join(" ")}
    >
      {copied ? copiedLabel : label}
    </button>
  );
});

const PharmacyModal = memo(function PharmacyModal({
  pharmacy,
  onClose,
  t,
}: {
  pharmacy: Pharmacy;
  onClose: () => void;
  t: Translations;
}) {
  const pt = t.pharmacy;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-end sm:items-center justify-center p-4 bg-[rgba(0,0,0,0.6)]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="약국 정보"
    >
      <div className="w-full max-w-sm bg-[#0C1220] border border-emerald-500/25 rounded-2xl p-5 shadow-[0_8px_40px_rgba(0,0,0,0.6)] max-h-[80vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-base font-bold text-white leading-snug flex-1 pr-2">
            💊 {pharmacy.name}
          </h3>
          <button
            onClick={onClose}
            aria-label="모달 닫기"
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 bg-transparent border-none cursor-pointer text-base"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {/* 전화번호 */}
          {pharmacy.phone && (
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                {pt.phone}
              </div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <a
                  href={`tel:${pharmacy.phone}`}
                  className="text-sm font-semibold text-venue-green no-underline"
                >
                  {pharmacy.phone}
                </a>
                <CopyButton
                  text={pharmacy.phone}
                  label={pt.copy}
                  copied={pt.copied}
                />
              </div>
            </div>
          )}

          {/* 주소 */}
          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              {pt.address}
            </div>
            <div className="flex items-start justify-between gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-xs text-gray-700 leading-relaxed flex-1">
                {pharmacy.address}
              </span>
              <CopyButton
                text={pharmacy.address}
                label={pt.copy}
                copied={pt.copied}
              />
            </div>
          </div>

          {/* 영업시간 */}
          {pharmacy.hours && (
            <div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                {pt.hours}
              </div>
              <div className="rounded-lg bg-gray-50 border border-gray-200 divide-y divide-gray-100">
                {Object.entries(pharmacy.hours).map(([day, time]) => (
                  <div
                    key={day}
                    className="flex items-center justify-between px-3 py-1.5 text-xs"
                  >
                    <span className="text-gray-400 w-10">
                      {(pt.dayLabels as Record<string, string> | undefined)?.[day] ?? day}
                    </span>
                    <span className="text-gray-700">{time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
