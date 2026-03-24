import { useState, useCallback, useRef } from 'react'
import type { Map, Marker } from 'leaflet'

type LeafletModule = typeof import('leaflet')

export function useMyLocation(
  mapInstanceRef: React.MutableRefObject<Map | null>,
  leafletRef: React.MutableRefObject<LeafletModule | null>,
) {
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)
  const myMarkerRef = useRef<Marker | null>(null)

  const goToMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocError('위치 서비스를 지원하지 않는 브라우저입니다.')
      setTimeout(() => setLocError(null), 3000)
      return
    }
    setLocLoading(true)
    setLocError(null)

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocLoading(false)
        const { latitude: lat, longitude: lng } = coords
        const map = mapInstanceRef.current
        const L = leafletRef.current
        if (!map || !L) return

        map.flyTo([lat, lng], 16, { duration: 1.2 })

        if (myMarkerRef.current) myMarkerRef.current.remove()

        const icon = L.divIcon({
          className: '',
          html: `<div style="position:relative;width:20px;height:20px;">
            <div style="position:absolute;inset:0;border-radius:50%;background:rgba(99,102,241,0.3);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:absolute;inset:3px;border-radius:50%;background:#6366f1;border:2.5px solid white;box-shadow:0 0 0 2px #818cf8,0 2px 8px rgba(99,102,241,0.5);"></div>
            <style>@keyframes ping{75%,100%{transform:scale(2.2);opacity:0;}}</style>
          </div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })
        myMarkerRef.current = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(map)
      },
      (err) => {
        setLocLoading(false)
        const msg =
          err.code === err.PERMISSION_DENIED
            ? '위치 권한이 거부되었습니다.'
            : err.code === err.POSITION_UNAVAILABLE
              ? '위치를 가져올 수 없습니다.'
              : '위치 요청 시간이 초과되었습니다.'
        setLocError(msg)
        setTimeout(() => setLocError(null), 3000)
      },
      { timeout: 10000, maximumAge: 60000 },
    )
  }, [mapInstanceRef, leafletRef])

  return { goToMyLocation, locLoading, locError }
}
