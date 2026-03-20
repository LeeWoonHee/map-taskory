export type Category = 'convenience' | 'smoking' | 'restroom'

export interface Location {
  id: string
  name: string
  category: Category
  lat: number
  lng: number
  address: string
  description?: string
  brand?: string
}

export const locations: Location[] = [
  // 편의점 (광화문 일대 - 실제 위치 기반)
  { id: 'c1', name: 'GS25 광화문점', category: 'convenience', lat: 37.5752, lng: 126.9765, address: '서울 종로구 세종대로 175', brand: 'GS25' },
  { id: 'c2', name: 'CU 경복궁점', category: 'convenience', lat: 37.5764, lng: 126.9756, address: '서울 종로구 효자로 12', brand: 'CU' },
  { id: 'c3', name: '7-Eleven 광화문역점', category: 'convenience', lat: 37.5748, lng: 126.9771, address: '서울 종로구 세종대로 지하 185', brand: '7-Eleven' },
  { id: 'c4', name: 'GS25 세종로점', category: 'convenience', lat: 37.5769, lng: 126.9782, address: '서울 종로구 세종대로 209', brand: 'GS25' },
  { id: 'c5', name: 'CU 광화문광장점', category: 'convenience', lat: 37.5757, lng: 126.9759, address: '서울 종로구 세종대로 152', brand: 'CU' },
  { id: 'c6', name: 'Emart24 종로점', category: 'convenience', lat: 37.5741, lng: 126.9789, address: '서울 종로구 청계천로 85', brand: 'Emart24' },
  { id: 'c7', name: 'GS25 청운효자동점', category: 'convenience', lat: 37.5778, lng: 126.9743, address: '서울 종로구 자하문로 3', brand: 'GS25' },
  { id: 'c8', name: '미니스탑 세종로점', category: 'convenience', lat: 37.5745, lng: 126.9762, address: '서울 종로구 세종대로 198', brand: '미니스탑' },

  // 흡연실/흡연공간
  { id: 's1', name: '광화문광장 흡연구역', category: 'smoking', lat: 37.5754, lng: 126.9769, address: '서울 종로구 세종대로 172 (광장 북측)', description: '광화문광장 북측 지정 흡연구역' },
  { id: 's2', name: '세종문화회관 흡연실', category: 'smoking', lat: 37.5743, lng: 126.9775, address: '서울 종로구 세종대로 175 (세종문화회관 B1)', description: '지하 1층 외부 출입구 옆' },
  { id: 's3', name: '정부서울청사 흡연구역', category: 'smoking', lat: 37.5759, lng: 126.9754, address: '서울 종로구 세종대로 209 (청사 후문)', description: '청사 후문 지정 흡연 구역' },
  { id: 's4', name: '광화문역 6번출구 흡연공간', category: 'smoking', lat: 37.5749, lng: 126.9776, address: '서울 종로구 세종대로 지하 (6번 출구 인근)', description: '지하철역 출구 인근 지정 흡연 공간' },
  { id: 's5', name: '종로1가 흡연구역', category: 'smoking', lat: 37.5735, lng: 126.9795, address: '서울 종로구 종로 1길 (종로1가 인근)', description: '종로 1가 인근 지정 흡연 구역' },

  // 무료 화장실
  { id: 'r1', name: '광화문광장 공중화장실', category: 'restroom', lat: 37.5761, lng: 126.9767, address: '서울 종로구 세종대로 172 (광장 내)', description: '24시간 개방, 남/여/장애인 화장실' },
  { id: 'r2', name: '경복궁 공중화장실', category: 'restroom', lat: 37.5771, lng: 126.9751, address: '서울 종로구 사직로 161 (경복궁 서문 앞)', description: '09:00~18:00 개방' },
  { id: 'r3', name: '세종문화회관 화장실', category: 'restroom', lat: 37.5740, lng: 126.9777, address: '서울 종로구 세종대로 175 (1층 로비)', description: '공연 시간 외 개방' },
  { id: 'r4', name: '광화문역 공중화장실', category: 'restroom', lat: 37.5748, lng: 126.9773, address: '서울 종로구 세종대로 지하 (지하철역 내)', description: '지하철 운행 시간 내 이용 가능' },
  { id: 'r5', name: '서울시청 앞 공중화장실', category: 'restroom', lat: 37.5733, lng: 126.9777, address: '서울 중구 세종대로 110 (시청 앞)', description: '24시간 개방' },
  { id: 'r6', name: '청계천 공중화장실', category: 'restroom', lat: 37.5696, lng: 126.9831, address: '서울 종로구 청계천로 (청계광장)', description: '24시간 개방, 청계광장 인근' },
]

export const categoryConfig = {
  convenience: {
    label: '편의점',
    emoji: '🏪',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  smoking: {
    label: '흡연구역',
    emoji: '🚬',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  restroom: {
    label: '무료화장실',
    emoji: '🚻',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
}
