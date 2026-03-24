export type MallFacilityType = "convenience" | "smoking" | "restroom";

export interface MallFacility {
  type: MallFacilityType;
  location: string; // e.g. "지하 2층 푸드코트 옆"
  notes?: string;
}

export type MallType = "department" | "mall" | "starfield";

export interface Mall {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  type: MallType;
  openHours: string;
  facilities: MallFacility[];
  website?: string;
}

export const mallFacilityConfig: Record<
  MallFacilityType,
  { emoji: string; color: string; bgColor: string; borderColor: string }
> = {
  convenience: {
    emoji: "🏪",
    color: "#10B981",
    bgColor: "rgba(16, 185, 129, 0.15)",
    borderColor: "rgba(16, 185, 129, 0.4)",
  },
  smoking: {
    emoji: "🚬",
    color: "#F59E0B",
    bgColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.4)",
  },
  restroom: {
    emoji: "🚻",
    color: "#3B82F6",
    bgColor: "rgba(59, 130, 246, 0.15)",
    borderColor: "rgba(59, 130, 246, 0.4)",
  },
};

export const mallTypeConfig: Record<
  MallType,
  { emoji: string; color: string }
> = {
  department: { emoji: "🏢", color: "#8B5CF6" },
  mall: { emoji: "🏬", color: "#EC4899" },
  starfield: { emoji: "⭐", color: "#F59E0B" },
};

export const malls: Mall[] = [
  {
    id: "lotte-main",
    name: "롯데백화점 본점",
    lat: 37.5648,
    lng: 126.9817,
    address: "서울 중구 남대문로 81",
    type: "department",
    openHours: "10:30 ~ 20:00 (금·토 20:30)",
    website: "https://www.lotteshopping.com/store/main?cstrCd=0001",
    facilities: [{ type: "smoking", location: "을지로입구역 8번출구 앞" }],
  },
  {
    id: "shinsegae-main",
    name: "신세계백화점 본점",
    lat: 37.5597,
    lng: 126.9793,
    address: "서울 중구 소공로 63",
    type: "department",
    openHours: "10:30 ~ 20:00 (금·토·일 20:30)",
    website: "https://www.shinsegae.com/store/main.do?storeCd=SC00001",
    facilities: [
      { type: "restroom", location: "B1 여자화장실" },
      { type: "restroom", location: "3F 여자화장실, 여자장애인화장실" },
      { type: "restroom", location: "4F 여자화장실" },
      { type: "restroom", location: "5F 남자화장실, 여자화장실" },
      { type: "restroom", location: "6F 남자화장실, 여자화장실" },
      { type: "restroom", location: "7F 여자화장실, 여자장애인화장실" },
      { type: "restroom", location: "13F 여자화장실" },
    ],
  },
  {
    id: "hyundai-trade",
    name: "현대백화점 무역센터점",
    lat: 37.5119,
    lng: 126.9595, // COEX 단지
    address: "서울 강남구 테헤란로 517",
    type: "department",
    openHours: "10:30 ~ 20:00 (금·토·일 20:30)",
    website:
      "https://www.ehyundai.com/newPortal/DP/DP000000_V.do?branchCd=B00122000",
    facilities: [
      { type: "smoking", location: "11층 하늘공원 흡연구역" },
      { type: "smoking", location: "1층 건물 외부 흡연구역" },
    ],
  },
  {
    id: "thehyundai-seoul",
    name: "더현대 서울",
    lat: 37.5256,
    lng: 126.9268,
    address: "서울 영등포구 여의대로 108",
    type: "department",
    openHours: "10:30 ~ 20:00 (금·토·일 20:30)",
    website:
      "https://www.ehyundai.com/newPortal/DP/DP000000_V.do?branchCd=B00140000",
    facilities: [{ type: "smoking", location: "6층 전자담배 전용 흡연실" }],
  },
  {
    id: "galleria-apgu",
    name: "갤러리아백화점 명품관",
    lat: 37.5275,
    lng: 127.0399,
    address: "서울 강남구 압구정로 343",
    type: "department",
    openHours: "10:30 ~ 20:00",
    website: "https://dept.galleria.co.kr/store-info/luxuryhall/shopping-info",
    facilities: [
      { type: "smoking", location: "건물 외곽 지정 흡연구역" },
      { type: "restroom", location: "EAST, WEST 각 층 화장실" },
    ],
  },
  {
    id: "coex-mall",
    name: "스타필드 코엑스몰",
    lat: 37.5113,
    lng: 127.0591,
    address: "서울 강남구 영동대로 513",
    type: "starfield",
    openHours: "10:00 ~ 22:00",
    website: "https://www.starfield.co.kr/coexmall/main.do",
    facilities: [
      { type: "convenience", location: "B1", notes: "이마트24 1호점" },
      { type: "convenience", location: "B1", notes: "이마트24 2호점" },
      { type: "smoking", location: "2F 할리스커피 옆 흡연구역" },
    ],
  },
  {
    id: "starfield-hanam",
    name: "스타필드 하남",
    lat: 37.5443,
    lng: 127.214,
    address: "경기 하남시 미사대로 750",
    type: "starfield",
    openHours: "10:00 ~ 22:00",
    website: "https://www.starfield.co.kr/hanam/main.do",
    facilities: [
      { type: "convenience", location: "1F", notes: "이마트24 1호점" },
      { type: "convenience", location: "1F", notes: "이마트24 2호점" },
      { type: "convenience", location: "3F", notes: "이마트24 3호점" },
      { type: "smoking", location: "2F" },
      { type: "restroom", location: "B1 장애인 화장실" },
      { type: "restroom", location: "B2 장애인 화장실" },
      { type: "restroom", location: "3F 장애인 화장실" },
    ],
  },
  {
    id: "starfield-goyang",
    name: "스타필드 고양",
    lat: 37.6586,
    lng: 126.8323,
    address: "경기 고양시 덕양구 고양대로 1955",
    type: "starfield",
    openHours: "10:00 ~ 22:00",
    website: "https://www.starfield.co.kr/goyang/tenant/floorInfo.do",
    facilities: [
      {
        type: "convenience",
        location: "3F",
        notes: "이마트24",
      },
      { type: "smoking", location: "2F" },
      { type: "smoking", location: "3F" },
    ],
  },
  {
    id: "ifc-yeouido",
    name: "IFC몰",
    lat: 37.5253,
    lng: 126.9244,
    address: "서울 영등포구 국제금융로 10",
    type: "mall",
    openHours: "10:00 ~ 21:00",
    website: "https://www.ifcmallseoul.com",
    facilities: [{ type: "convenience", location: "STREET", notes: "GS25" }],
  },
  {
    id: "timesquare",
    name: "영등포 타임스퀘어",
    lat: 37.517,
    lng: 126.9057,
    address: "서울 영등포구 영중로 15",
    type: "mall",
    openHours: "10:30 ~ 22:00",
    website: "https://www.timessquare.co.kr/web/www",
    facilities: [
      {
        type: "convenience",
        location: "1F",
        notes: "GS25",
      },
      { type: "smoking", location: "1층 외부 흡연구역" },
    ],
  },
  {
    id: "lotte-jamsil",
    name: "롯데월드몰",
    lat: 37.5132,
    lng: 127.1021,
    address: "서울 송파구 올림픽로 300",
    type: "mall",
    openHours: "10:30 ~ 22:00",
    website: "https://www.lwt.co.kr/ko",
    facilities: [{ type: "convenience", location: "5F", notes: "7-Eleven" }],
  },
  {
    id: "hyundai-dongdaemun",
    name: "현대시티아울렛 동대문점",
    lat: 37.5667,
    lng: 127.0089,
    address: "서울 중구 장충단로 253",
    type: "mall",
    openHours: "10:30 ~ 21:00 (금·토·일 21:30)",
    website:
      "https://www.ehyundai.com/newPortal/outlet/DP/DP000000_V.do?branchCd=B00173000",
    facilities: [
      { type: "convenience", location: "B1", notes: "CU" },
      { type: "smoking", location: "야회 지정 흡연구역" },
    ],
  },
];
