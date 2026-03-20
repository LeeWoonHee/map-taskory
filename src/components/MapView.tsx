import { useEffect, useState, useRef, useCallback } from "react";
import type { Category, Location } from "../data/locations";
import { categoryConfig } from "../data/locations";

interface MapViewProps {
  locations: Location[];
  activeCategories: Set<Category>;
  onSelectLocation?: (location: Location | null) => void;
}

type GeoStatus = "idle" | "loading" | "success" | "error";

function createCustomIcon(L: typeof import("leaflet"), category: Category) {
  const config = categoryConfig[category];
  return L.divIcon({
    html: `<div style="
      background: ${config.color};
      width: 38px;
      height: 38px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.28), 0 0 0 2px ${config.color}55;
      cursor: pointer;
    ">${config.emoji}</div>`,
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -40],
  });
}

function createPopupContent(location: Location): string {
  const config = categoryConfig[location.category];
  return `
    <div style="min-width:220px;max-width:280px;font-family:'Manrope',ui-sans-serif,system-ui,sans-serif;">
      <div style="
        padding:12px 14px 10px;
        background:linear-gradient(135deg,${config.bgColor},rgba(255,255,255,0));
        border-bottom:1px solid ${config.borderColor};
      ">
        <div style="
          display:inline-flex;align-items:center;gap:5px;
          font-size:11px;font-weight:700;color:${config.color};
          letter-spacing:0.08em;text-transform:uppercase;margin-bottom:4px;
        "><span>${config.emoji}</span><span>${config.label}</span></div>
        <div style="font-size:14px;font-weight:700;color:#1a1a2e;line-height:1.3;">${location.name}</div>
      </div>
      <div style="padding:10px 14px 12px;">
        <div style="
          display:flex;align-items:flex-start;gap:6px;
          font-size:12px;color:#555;
          margin-bottom:${location.description ? "8px" : "0"};line-height:1.4;
        "><span style="margin-top:1px;flex-shrink:0;">📍</span><span>${location.address}</span></div>
        ${
          location.description
            ? `
        <div style="
          font-size:12px;color:#7B4EAB;
          background:rgba(123,78,171,0.07);
          border-radius:8px;padding:6px 9px;line-height:1.4;
        ">💡 ${location.description}</div>`
            : ""
        }
      </div>
    </div>
  `;
}

export function MapView({
  locations,
  activeCategories,
  onSelectLocation,
}: MapViewProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
  const [geoError, setGeoError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<Map<string, any>>(new Map());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myLocationMarkerRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const myLocationCircleRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const onSelectRef = useRef(onSelectLocation);

  useEffect(() => {
    onSelectRef.current = onSelectLocation;
  }, [onSelectLocation]);

  // 클라이언트 마운트 감지
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 지도 초기화 (마운트 후 1회)
  useEffect(() => {
    if (!isMounted || !mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    let map: ReturnType<(typeof import("leaflet"))["map"]>;

    import("leaflet").then((L) => {
      if (!mapContainerRef.current) return;

      // 기본 아이콘 경로 수정
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // 광화문 광장 중심 (37.5760, 126.9769), 줌 16
      map = L.map(mapContainerRef.current, {
        center: [37.576, 126.9769],
        zoom: 16,
        zoomControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        },
      ).addTo(map);

      leafletMapRef.current = { map, L };
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.map.remove();
        leafletMapRef.current = null;
        markersRef.current.clear();
      }
    };
  }, [isMounted]);

  // 내 위치 마커 업데이트
  const updateMyLocationMarker = useCallback(
    (
      L: typeof import("leaflet"),
      lat: number,
      lng: number,
      accuracy: number,
    ) => {
      if (!leafletMapRef.current) return;
      const { map } = leafletMapRef.current;

      // 기존 내 위치 마커/원 제거
      myLocationMarkerRef.current?.remove();
      myLocationCircleRef.current?.remove();

      // 정확도 원
      myLocationCircleRef.current = L.circle([lat, lng], {
        radius: accuracy,
        color: "#7B4EAB",
        fillColor: "#9B6EC4",
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: "4 4",
      }).addTo(map);

      // 내 위치 아이콘
      const myIcon = L.divIcon({
        html: `<div style="
        position: relative;
        width: 22px;
        height: 22px;
      ">
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(123,78,171,0.25);
          animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
        <div style="
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: #7B4EAB;
          border: 2.5px solid white;
          box-shadow: 0 0 0 2px #9B6EC4, 0 2px 8px rgba(123,78,171,0.6);
        "></div>
      </div>
      <style>
        @keyframes ping {
          75%, 100% { transform: scale(2.2); opacity: 0; }
        }
      </style>`,
        className: "",
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -14],
      });

      myLocationMarkerRef.current = L.marker([lat, lng], { icon: myIcon })
        .addTo(map)
        .bindPopup(
          `
        <div style="font-family:'Manrope',sans-serif;padding:2px 4px;">
          <div style="font-weight:700;font-size:13px;color:#7B4EAB;margin-bottom:2px;">📍 내 현재 위치</div>
          <div style="font-size:11px;color:#888;">정확도: 약 ${Math.round(accuracy)}m</div>
        </div>
      `,
          { maxWidth: 200 },
        );
    },
    [],
  );

  // 내 위치 버튼 클릭 핸들러
  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("이 브라우저는 위치 서비스를 지원하지 않습니다.");
      setGeoStatus("error");
      return;
    }

    // 이미 추적 중이면 중단
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      myLocationMarkerRef.current?.remove();
      myLocationCircleRef.current?.remove();
      myLocationMarkerRef.current = null;
      myLocationCircleRef.current = null;
      setGeoStatus("idle");
      return;
    }

    setGeoStatus("loading");
    setGeoError(null);

    import("leaflet").then((L) => {
      // 첫 위치: 지도 이동
      let isFirst = true;

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setGeoStatus("success");
          setGeoError(null);
          updateMyLocationMarker(L, latitude, longitude, accuracy);

          if (isFirst && leafletMapRef.current) {
            leafletMapRef.current.map.setView([latitude, longitude], 17, {
              animate: true,
            });
            myLocationMarkerRef.current?.openPopup();
            isFirst = false;
          }
        },
        (err) => {
          setGeoStatus("error");
          if (err.code === 1) setGeoError("위치 권한이 거부되었습니다.");
          else if (err.code === 2) setGeoError("위치를 가져올 수 없습니다.");
          else setGeoError("위치 요청 시간이 초과되었습니다.");
          watchIdRef.current = null;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
      );
    });
  }, [updateMyLocationMarker]);

  // 언마운트 시 위치 추적 정리
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // 마커 업데이트 함수
  const updateMarkers = useCallback(() => {
    if (!leafletMapRef.current) return;
    const { map, L } = leafletMapRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // 필터 적용 후 마커 추가
    locations
      .filter((loc) => activeCategories.has(loc.category))
      .forEach((loc) => {
        const icon = createCustomIcon(L, loc.category);
        const marker = L.marker([loc.lat, loc.lng], { icon })
          .addTo(map)
          .bindPopup(createPopupContent(loc), { maxWidth: 300 });

        marker.on("click", () => {
          onSelectRef.current?.(loc);
        });
        marker.on("popupclose", () => {
          onSelectRef.current?.(null);
        });

        markersRef.current.set(loc.id, marker);
      });
  }, [locations, activeCategories]);

  // 지도 초기화 완료 후 마커 추가 (폴링으로 leafletMapRef 준비 대기)
  useEffect(() => {
    if (!isMounted) return;

    const interval = setInterval(() => {
      if (leafletMapRef.current) {
        clearInterval(interval);
        updateMarkers();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isMounted, updateMarkers]);

  if (!isMounted) {
    return (
      <div
        className="map-container-full flex items-center justify-center rounded-2xl"
        style={{ background: "rgba(15,10,30,0.3)" }}
      >
        <div className="text-center">
          <div className="bts-float mb-3 text-4xl">🗺️</div>
          <p
            className="text-sm font-medium"
            style={{ color: "rgba(216,180,254,0.7)" }}
          >
            지도를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  const isTracking = geoStatus === "success";
  const isLoading = geoStatus === "loading";

  return (
    <div
      className="relative h-full w-full"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {/* 지도 */}
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-2xl overflow-hidden"
        style={{
          border: "1px solid rgba(123, 78, 171, 0.2)",
          boxShadow: "0 4px 24px rgba(123, 78, 171, 0.1)",
        }}
      />

      {/* 내 위치 버튼 */}
      <button
        onClick={handleMyLocation}
        title={isTracking ? "위치 추적 중지" : "내 위치 보기"}
        style={{
          position: "absolute",
          bottom: "80px",
          right: "16px",
          zIndex: 1000,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          background: isTracking
            ? "linear-gradient(135deg, #7B4EAB, #9B6EC4)"
            : "rgba(15, 10, 30, 0.88)",
          border: isTracking
            ? "2px solid rgba(216,180,254,0.5)"
            : "1.5px solid rgba(123, 78, 171, 0.45)",
          boxShadow: isTracking
            ? "0 0 20px rgba(123,78,171,0.7), 0 4px 16px rgba(0,0,0,0.3)"
            : "0 4px 16px rgba(0,0,0,0.3)",
          backdropFilter: "blur(12px)",
          color: "white",
          animation: isLoading
            ? "bts-pulse-glow 1s ease-in-out infinite"
            : "none",
        }}
      >
        {isLoading ? "⟳" : isTracking ? "📍" : "🧭"}
      </button>

      {/* 에러 토스트 */}
      {geoStatus === "error" && geoError && (
        <div
          style={{
            position: "absolute",
            bottom: "136px",
            right: "16px",
            zIndex: 1000,
            maxWidth: "240px",
            borderRadius: "12px",
            padding: "10px 14px",
            fontSize: "12px",
            fontWeight: 600,
            background: "rgba(220, 38, 38, 0.12)",
            border: "1px solid rgba(220,38,38,0.35)",
            color: "#fca5a5",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          ⚠️ {geoError}
        </div>
      )}

      {/* 추적 중 상태 뱃지 */}
      {isTracking && (
        <div
          style={{
            position: "absolute",
            bottom: "136px",
            right: "16px",
            zIndex: 1000,
            borderRadius: "20px",
            padding: "6px 12px",
            fontSize: "11px",
            fontWeight: 700,
            background: "rgba(123,78,171,0.2)",
            border: "1px solid rgba(155,110,196,0.4)",
            color: "#d8b4fe",
            backdropFilter: "blur(12px)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#a855f7",
              display: "inline-block",
              animation: "bts-pulse-glow 1s ease-in-out infinite",
            }}
          />
          실시간 위치 추적 중
        </div>
      )}
    </div>
  );
}
