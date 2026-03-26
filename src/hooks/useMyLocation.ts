import { useState, useCallback, useRef } from 'react'

export function useMyLocation(
  mapInstanceRef: React.MutableRefObject<kakao.maps.Map | null>,
) {
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState<string | null>(null)
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null)

  const goToMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocError('이 브라우저는 위치 서비스를 지원하지 않습니다.')
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
        if (!map) return

        const position = new kakao.maps.LatLng(lat, lng)

        // 기존 위치 마커 제거
        if (overlayRef.current) {
          overlayRef.current.setMap(null)
          overlayRef.current = null
        }

        // 위치 마커 DOM 생성 (ping 애니메이션)
        const el = document.createElement('div')
        el.style.cssText = 'position:relative;width:20px;height:20px;'
        el.innerHTML = `
          <div style="position:absolute;inset:0;border-radius:50%;background:rgba(99,102,241,0.35);animation:my-location-ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position:absolute;inset:3px;border-radius:50%;background:#6366f1;border:2.5px solid white;box-shadow:0 0 0 2px #818cf8,0 2px 8px rgba(99,102,241,0.5);"></div>
        `

        overlayRef.current = new kakao.maps.CustomOverlay({
          position,
          content: el,
          map,
          yAnchor: 0.5,
          xAnchor: 0.5,
          zIndex: 999,
        })

        map.panTo(position)
        map.setLevel(3, { animate: true })
      },
      (err) => {
        setLocLoading(false)
        const msg =
          err.code === err.PERMISSION_DENIED
            ? '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.'
            : err.code === err.POSITION_UNAVAILABLE
              ? '현재 위치를 가져올 수 없습니다. 위치 서비스가 켜져 있는지 확인해주세요.'
              : '위치를 가져오는 데 너무 오래 걸립니다. 다시 시도해주세요.'
        setLocError(msg)
        setTimeout(() => setLocError(null), 4000)
      },
      { timeout: 10000, maximumAge: 60000 },
    )
  }, [mapInstanceRef])

  return { goToMyLocation, locLoading, locError }
}
