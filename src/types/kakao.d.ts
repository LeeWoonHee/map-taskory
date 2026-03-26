declare namespace kakao {
  namespace maps {
    function load(callback: () => void): void

    class Map {
      constructor(container: HTMLElement, options: MapOptions)
      setCenter(latlng: LatLng): void
      getCenter(): LatLng
      getLevel(): number
      setLevel(level: number, options?: { animate?: boolean }): void
      panTo(latlng: LatLng): void
      getBounds(): LatLngBounds
    }

    interface MapOptions {
      center: LatLng
      level: number
      mapTypeId?: MapTypeId
    }

    class LatLng {
      constructor(lat: number, lng: number)
      getLat(): number
      getLng(): number
    }

    class LatLngBounds {
      getSouthWest(): LatLng
      getNorthEast(): LatLng
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions)
      setMap(map: Map | null): void
      setPosition(latlng: LatLng): void
      getPosition(): LatLng
    }

    interface CustomOverlayOptions {
      position: LatLng
      content: string | HTMLElement
      map?: Map
      yAnchor?: number
      xAnchor?: number
      zIndex?: number
      clickable?: boolean
    }

    namespace event {
      function addListener(target: object, type: string, handler: () => void): void
      function removeListener(target: object, type: string, handler: () => void): void
    }

    enum MapTypeId {
      ROADMAP = 1,
      SKYVIEW = 2,
      HYBRID = 3,
    }
  }
}

interface Window {
  kakao: typeof kakao
}
