import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import { fetchToilets } from "../functions/toilets";
import { type PublicToilet } from "../data/publicToiletsData";
import { useLanguage } from "../i18n/LanguageContext";
import { PageLoader } from "../components/PageLoader";
import { useMyLocation } from "../hooks/useMyLocation";
import { loadKakaoMap } from "../lib/kakaoMap";
import type { Translations } from "../i18n/translations";
import { SEOUL_CENTER } from "../constants";

const FOCUSABLE_SELECTORS =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export const Route = createFileRoute("/toilet")({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "서울 생활 지도 | 화장실" },
      {
        name: "description",
        content: "서울 공공화장실 위치를 지도에서 확인하세요. 24시간 무료 화장실, 장애인 화장실 필터 제공. 내 근처 공공화장실을 빠르게 찾을 수 있습니다.",
      },
      {
        name: "keywords",
        content:
          "서울화장실, 서울화장실위치, 서울개방형화장실, 서울무료화장실, 서울공공화장실, 서울개방화장실, 서울오픈화장실, 화장실, 화장실위치, 개방형화장실, 무료화장실, 공공화장실, 개방화장실, 오픈화장실",
      },
      { property: "og:title", content: "서울 생활 지도 | 화장실" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://map.taskory.work/toilet" },
      {
        property: "og:description",
        content: "서울 공공화장실 위치를 지도에서 확인하세요. 24시간 무료 화장실, 장애인 화장실 필터 제공.",
      },
      { property: "og:image", content: "https://map.taskory.work/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "ko_KR" },
      { name: "theme-color", content: "#FFFFFF" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "서울 생활 지도 | 화장실" },
      { name: "twitter:description", content: "서울 공공화장실 위치를 지도에서 확인하세요. 24시간 무료 화장실, 장애인 화장실 필터 제공." },
      { name: "twitter:image", content: "https://map.taskory.work/og-image.png" },
      { property: "kakao:title", content: "서울 생활 지도 | 화장실" },
      { name: "google-site-verification", content: "YK0uylhG5mPDeUcfzmsuhiJ_5qlXkI12xLZ0JuVftgo" },
      { name: "naver-site-verification", content: "6c07ca86af04ede6ffe86e65679475019a3a4eed" },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://map.taskory.work/toilet" },
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
              name: "서울 공공화장실은 어디서 찾을 수 있나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "서울 생활 지도의 화장실 페이지에서 서울 전역의 공공화장실 위치를 지도에서 확인할 수 있습니다. 24시간 운영 화장실과 장애인 화장실 필터를 제공합니다.",
              },
            },
            {
              "@type": "Question",
              name: "24시간 무료 화장실을 어디서 찾나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "화장실 지도에서 '24시간' 필터를 선택하면 24시간 개방되는 공공화장실만 표시됩니다.",
              },
            },
            {
              "@type": "Question",
              name: "장애인 화장실은 어디에 있나요?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "화장실 지도에서 '장애인' 필터를 선택하면 장애인 화장실이 설치된 공공화장실을 확인할 수 있습니다.",
              },
            },
          ],
        }),
      },
    ],
  }),
  loader: () => fetchToilets(),
  pendingComponent: PageLoader,
  pendingMs: 300,
  component: ToiletPage,
});

function ToiletPage() {
  const { t } = useLanguage();
  const { toilets } = Route.useLoaderData();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [modal, setModal] = useState<PublicToilet | null>(null);
  const [show24hOnly, setShow24hOnly] = useState(false);
  const [showDisabledOnly, setShowDisabledOnly] = useState(false);
  const { goToMyLocation, locLoading, locError } = useMyLocation(mapInstanceRef);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const filtered = toilets.filter((item) => {
    if (show24hOnly && !item.isOpen24h) return false;
    if (showDisabledOnly && !item.hasDisabled) return false;
    return true;
  });

  // 마커 렌더링
  const renderOverlays = useCallback(
    (map: kakao.maps.Map, items: PublicToilet[]) => {
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];

      items.forEach((toilet) => {
        const color = toilet.isOpen24h ? "#3B82F6" : "#60A5FA";
        const el = document.createElement("div");
        el.style.cssText = `width:32px;height:32px;border-radius:50%;background:rgba(15,23,42,0.92);border:2px solid ${color};box-shadow:0 0 8px ${color}44;display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;transform:translate(-50%,-100%);`;
        el.textContent = "🚻";
        el.addEventListener("click", () => setModal(toilet));

        overlaysRef.current.push(
          new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(toilet.lat, toilet.lng),
            content: el,
            map,
            yAnchor: 1,
            xAnchor: 0.5,
            zIndex: 3,
          }),
        );
      });
    },
    [],
  );

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
      renderOverlays(map, filtered);
    });

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  // 필터 변경 시 마커 재렌더링
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    renderOverlays(map, filtered);
  }, [filtered, renderOverlays]);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-108px)] text-gray-400 text-sm">
        {t.toilet.loading}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-[calc(100dvh-108px)]">
      <h1 className="sr-only">서울 공공화장실 지도 — 24시간 · 무료 · 장애인 화장실 위치</h1>
      {/* 필터 바 */}
      <div className="flex-shrink-0 px-3 py-2 flex items-center gap-2 flex-wrap bg-white border-b border-gray-200">
        <button
          onClick={() => setShow24hOnly((v) => !v)}
          aria-pressed={show24hOnly}
          aria-label={`24시간 운영 필터 ${show24hOnly ? "해제" : "적용"}`}
          className={[
            "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer",
            show24hOnly
              ? "bg-[rgba(59,130,246,0.15)] border-[rgba(59,130,246,0.4)] text-[#60A5FA]"
              : "bg-white border-gray-200 text-gray-600",
          ].join(" ")}
        >
          🕐 {t.toilet.open24h}
        </button>
        <button
          onClick={() => setShowDisabledOnly((v) => !v)}
          aria-pressed={showDisabledOnly}
          aria-label={`장애인 화장실 필터 ${showDisabledOnly ? "해제" : "적용"}`}
          className={[
            "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer",
            showDisabledOnly
              ? "bg-[rgba(139,92,246,0.15)] border-[rgba(139,92,246,0.4)] text-[#A78BFA]"
              : "bg-white border-gray-200 text-gray-600",
          ].join(" ")}
        >
          ♿ {t.toilet.disabled}
        </button>
        <span className="ml-auto text-xs text-[rgba(148,163,184,0.4)]">
          {t.toilet.countBadge(filtered.length)}
        </span>
      </div>

      {/* 지도 */}
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

      {/* 모달 */}
      {modal && (
        <ToiletModal toilet={modal} onClose={() => setModal(null)} t={t} />
      )}
    </div>
  );
}

const ToiletModal = memo(function ToiletModal({
  toilet,
  onClose,
  t,
}: {
  toilet: PublicToilet;
  onClose: () => void;
  t: Translations;
}) {
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
      aria-label="화장실 정보"
    >
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_8px_40px_rgba(0,0,0,0.6)]">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-1.5 flex-wrap mb-1">
              {toilet.isOpen24h && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(59,130,246,0.15)] border border-[rgba(59,130,246,0.35)] text-[#60A5FA]">
                  🕐 {t.toilet.open24h}
                </span>
              )}
              {toilet.hasDisabled && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.35)] text-[#A78BFA]">
                  ♿ {t.toilet.disabled}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              🚻 {toilet.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="모달 닫기"
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 bg-transparent border-none cursor-pointer text-base"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <Row
            label={t.toilet.pageTitle === "서울 공공화장실" ? "주소" : t.address}
            value={toilet.address}
          />

          {(toilet.isOpen24h || toilet.openHours) && (
            <Row
              label={t.toilet.openHours}
              value={toilet.isOpen24h ? t.toilet.open24h : (toilet.openHours ?? "")}
              highlight={toilet.isOpen24h}
            />
          )}

          {(toilet.maleCount || toilet.femaleCount) && (
            <div className="flex gap-2">
              {toilet.maleCount ? (
                <div className="flex-1 text-center p-2 rounded-lg bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.2)]">
                  <div className="text-lg">🚹</div>
                  <div className="text-xs text-gray-500">{t.toilet.male}</div>
                  <div className="text-sm font-bold text-[#60A5FA]">{toilet.maleCount}칸</div>
                </div>
              ) : null}
              {toilet.femaleCount ? (
                <div className="flex-1 text-center p-2 rounded-lg bg-[rgba(236,72,153,0.08)] border border-[rgba(236,72,153,0.2)]">
                  <div className="text-lg">🚺</div>
                  <div className="text-xs text-gray-500">{t.toilet.female}</div>
                  <div className="text-sm font-bold text-[#F472B6]">{toilet.femaleCount}칸</div>
                </div>
              ) : null}
            </div>
          )}

          {toilet.managedBy && (
            <Row label={t.toilet.managedBy} value={toilet.managedBy} />
          )}
        </div>
      </div>
    </div>
  );
});

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="shrink-0 text-gray-400 w-14">{label}</span>
      <span className={highlight ? "text-[#60A5FA] font-semibold" : "text-gray-700"}>
        {value}
      </span>
    </div>
  );
}
