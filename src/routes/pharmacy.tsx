import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { fetchPharmaciesByBounds, type Pharmacy } from "../functions/pharmacy";
import { useLanguage } from "../i18n/LanguageContext";
import { useMyLocation } from "../hooks/useMyLocation";
import { loadKakaoMap } from "../lib/kakaoMap";
import type { Translations } from "../i18n/translations";
import { SEOUL_CENTER, DEBOUNCE_MS } from "../constants";

const FOCUSABLE_SELECTORS =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const Route = createFileRoute("/pharmacy")({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "서울 생활 지도 | 약국" },
      {
        name: "description",
        content: "서울 내 근처 약국 위치를 지도에서 찾아보세요. 야간 약국·24시간 약국 필터로 늦은 시간에도 이용 가능한 약국을 빠르게 확인할 수 있습니다.",
      },
      {
        name: "keywords",
        content:
          "서울약국, 내근처약국, 약국영업시간, 24시간약국, 약국위치, 서울약국위치, 서울24시간약국, 24약국, 야간약국",
      },
      { property: "og:title", content: "서울 생활 지도 | 약국" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://map.taskory.work/pharmacy" },
      {
        property: "og:description",
        content: "서울 내 근처 약국 위치를 지도에서 찾아보세요. 야간 약국·24시간 약국 필터 제공.",
      },
      { property: "og:image", content: "https://map.taskory.work/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "ko_KR" },
      { name: "theme-color", content: "#FFFFFF" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "서울 생활 지도 | 약국" },
      { name: "twitter:description", content: "서울 내 근처 약국 위치를 지도에서 찾아보세요. 야간 약국·24시간 약국 필터 제공." },
      { name: "twitter:image", content: "https://map.taskory.work/og-image.png" },
      { property: "kakao:title", content: "서울 생활 지도 | 약국" },
      { name: "google-site-verification", content: "YK0uylhG5mPDeUcfzmsuhiJ_5qlXkI12xLZ0JuVftgo" },
      { name: "naver-site-verification", content: "6c07ca86af04ede6ffe86e65679475019a3a4eed" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://map.taskory.work/pharmacy" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "내 근처 약국을 어떻게 찾나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "서울 생활 지도의 약국 페이지에서 🧭 버튼을 누르면 현재 위치 주변의 약국을 지도에서 확인할 수 있습니다.",
              },
            },
            {
              "@type": "Question",
              name: "야간에 운영하는 약국은 어디서 찾나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "약국 지도에서 '야간 약국' 필터를 선택하면 오후 9시 이후에도 운영하는 약국을 확인할 수 있습니다.",
              },
            },
            {
              "@type": "Question",
              name: "서울 24시간 약국은 어디에 있나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "약국 지도에서 야간 약국 필터를 활용하면 늦은 시간에도 이용 가능한 약국을 찾을 수 있습니다. 지도를 원하는 지역으로 이동하면 해당 지역 약국이 자동으로 표시됩니다.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: PharmacyPage,
});

function PharmacyPage() {
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [noKey, setNoKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<Pharmacy | null>(null);
  const [filter, setFilter] = useState<"all" | "latenight">("all");

  const { goToMyLocation, locLoading, locError } = useMyLocation(mapInstanceRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 마커 렌더링
  const renderOverlays = useCallback((items: Pharmacy[]) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    items.forEach((ph) => {
      const el = document.createElement("div");
      el.style.cssText =
        "width:30px;height:30px;border-radius:50%;background:rgba(15,23,42,0.92);border:2px solid #10B981;box-shadow:0 0 8px #10B98144;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;transform:translate(-50%,-100%);";
      el.textContent = "💊";
      el.addEventListener("click", () => setModal(ph));

      overlaysRef.current.push(
        new kakao.maps.CustomOverlay({
          position: new kakao.maps.LatLng(ph.lat, ph.lng),
          content: el,
          map,
          yAnchor: 1,
          xAnchor: 0.5,
          zIndex: 3,
        }),
      );
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
        data: { lat: center.getLat(), lng: center.getLng() },
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
      filter === "latenight" ? pharmacies.filter((p) => p.isLateNight) : pharmacies;
    renderOverlays(items);
  }, [pharmacies, filter, renderOverlays]);

  // 지도 초기화
  useEffect(() => {
    if (!isMounted || !mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    loadKakaoMap().then(() => {
      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      const map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng),
        level: 5,
      });
      mapInstanceRef.current = map;

      const onMoveEnd = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchByCurrentBounds(), DEBOUNCE_MS);
      };

      kakao.maps.event.addListener(map, "dragend", onMoveEnd);
      kakao.maps.event.addListener(map, "zoom_changed", onMoveEnd);

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
      <h1 className="sr-only">서울 약국 지도 — 내 근처 약국 · 야간 약국 위치 찾기</h1>
      {/* 상태 바 */}
      <div className="flex-shrink-0 px-3 py-2 flex items-center gap-2 bg-white border-b border-gray-200">
        <span className="text-xs font-semibold text-[rgba(16,185,129,0.8)]">💊</span>
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
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-[1000] px-3 py-1.5 rounded-full text-xs bg-[rgba(15,23,42,0.9)] border border-[rgba(16,185,129,0.3)] text-[rgba(16,185,129,0.8)] shadow-lg">
          <span className="animate-pulse">💊 약국 검색 중...</span>
        </div>
      )}

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

      {/* API 키 없을 때 안내 */}
      {noKey && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm">
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
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // 복사 불가 환경
      }
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
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    dialog.addEventListener("keydown", handleKeyDown);
    return () => dialog.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-[rgba(0,0,0,0.6)] outline-none"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="약국 정보"
    >
      <div className="w-full max-w-sm bg-[#0C1220] border border-emerald-500/25 rounded-2xl p-5 shadow-[0_8px_40px_rgba(0,0,0,0.6)] max-h-[80vh] overflow-y-auto">
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
                <CopyButton text={pharmacy.phone} label={pt.copy} copied={pt.copied} />
              </div>
            </div>
          )}

          <div>
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              {pt.address}
            </div>
            <div className="flex items-start justify-between gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-xs text-gray-700 leading-relaxed flex-1">
                {pharmacy.address}
              </span>
              <CopyButton text={pharmacy.address} label={pt.copy} copied={pt.copied} />
            </div>
          </div>

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
