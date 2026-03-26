// 카카오 지도 JavaScript API 키 (클라이언트 공개 키, 도메인 제한으로 보호)
const KAKAO_MAP_KEY = '5f7a76f31ce2273890a6c90c75bad820'

let loadPromise: Promise<void> | null = null

export function loadKakaoMap(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()

  // 이미 로드된 경우
  if (window.kakao?.maps?.load) {
    return new Promise((resolve) => window.kakao.maps.load(resolve))
  }

  // 중복 로드 방지
  if (loadPromise) return loadPromise

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_KEY}&autoload=false`
    script.onload = () => window.kakao.maps.load(resolve)
    script.onerror = () => {
      loadPromise = null
      reject(new Error('카카오 지도 스크립트 로드 실패'))
    }
    document.head.appendChild(script)
  })

  return loadPromise
}
