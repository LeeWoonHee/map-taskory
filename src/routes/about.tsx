import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: '서울 생활 지도 소개 | 쇼핑몰 · 공공화장실 · 약국' },
      {
        name: 'description',
        content:
          '서울 생활 지도는 서울의 쇼핑몰 흡연구역·편의점, 공공화장실, 약국 위치를 지도에서 한눈에 확인할 수 있는 서비스입니다.',
      },
      {
        name: 'keywords',
        content:
          '서울생활지도, 서울지도, 서울쇼핑몰, 서울공공화장실, 서울약국, 지도서비스, 서울편의시설',
      },
      { property: 'og:title', content: '서울 생활 지도 소개 | 쇼핑몰 · 공공화장실 · 약국' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://map.taskory.work/about' },
      {
        property: 'og:description',
        content:
          '서울의 쇼핑몰 흡연구역, 공공화장실, 약국 위치를 지도에서 한눈에 확인하세요.',
      },
      { name: 'theme-color', content: '#FFFFFF' },
      {
        name: 'google-site-verification',
        content: 'YK0uylhG5mPDeUcfzmsuhiJ_5qlXkI12xLZ0JuVftgo',
      },
      {
        name: 'naver-site-verification',
        content: '6c07ca86af04ede6ffe86e65679475019a3a4eed',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: '서울 생활 지도는 어떤 서비스인가요?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '서울 생활 지도는 서울 시내 쇼핑몰의 흡연구역·편의점, 공공화장실, 약국 위치를 지도에서 쉽게 찾을 수 있는 무료 서비스입니다.',
              },
            },
            {
              '@type': 'Question',
              name: '어떤 쇼핑몰 정보를 제공하나요?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '스타필드, 현대백화점, 신세계백화점, 롯데월드몰, 코엑스, 타임스퀘어 등 서울 주요 쇼핑몰의 흡연구역, 편의점, 화장실 위치를 제공합니다.',
              },
            },
            {
              '@type': 'Question',
              name: '공공화장실은 몇 개나 표시되나요?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '서울시 공공데이터를 기반으로 서울 전역의 공공화장실 위치를 표시합니다. 24시간 운영 여부와 장애인 화장실 유무로 필터링할 수 있습니다.',
              },
            },
            {
              '@type': 'Question',
              name: '약국 정보는 실시간으로 업데이트되나요?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: '공공데이터포털의 약국 정보를 기반으로 현재 지도 화면에 보이는 범위 내 약국을 표시합니다. 야간 약국 필터를 통해 늦은 시간에도 이용 가능한 약국을 찾을 수 있습니다.',
              },
            },
          ],
        }),
      },
    ],
  }),
  component: About,
})

function About() {
  return (
    <main className="px-4 py-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">서울 생활 지도 소개</h1>
      <p className="text-gray-600 text-sm mb-8 leading-relaxed">
        서울에서의 일상을 조금 더 편리하게 — 쇼핑몰 편의시설부터 공공화장실, 약국까지 한눈에 찾아보세요.
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3">🏬 서울 쇼핑몰 편의시설 지도</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          스타필드, 현대백화점, 신세계백화점, 롯데월드몰, 코엑스, 타임스퀘어 등
          서울 주요 쇼핑몰의 흡연구역, 편의점, 화장실 위치를 한눈에 확인하세요.
          쇼핑 중 잠깐 담배를 피우고 싶을 때, 편의점에서 간단히 사야 할 게 생겼을 때
          빠르게 위치를 확인할 수 있습니다.
        </p>
        <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
          <li>스타필드 코엑스몰 · 하남 · 고양 · 수원 흡연구역</li>
          <li>현대백화점 · 신세계백화점 · 롯데백화점 흡연실</li>
          <li>타임스퀘어 · IFC몰 · 롯데월드몰 편의점 및 화장실</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3">🚻 서울 공공화장실 지도</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          서울시 공공데이터를 기반으로 서울 전역의 무료 공공화장실 위치를 지도에 표시합니다.
          24시간 개방 화장실 필터와 장애인 화장실 필터를 활용하면
          상황에 맞는 화장실을 더 빠르게 찾을 수 있습니다.
        </p>
        <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
          <li>서울 전역 공공화장실 위치 표시</li>
          <li>24시간 개방 화장실 필터</li>
          <li>장애인 화장실 유무 확인</li>
          <li>남녀 칸 수 및 운영시간 정보</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3">💊 서울 약국 지도</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          현재 지도에 보이는 지역의 약국 위치를 표시합니다.
          지도를 이동하면 해당 지역의 약국을 자동으로 불러옵니다.
          야간 약국 필터를 사용하면 늦은 시간에도 이용 가능한 약국을 찾을 수 있습니다.
        </p>
        <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
          <li>지도 이동 시 자동으로 주변 약국 표시</li>
          <li>야간 약국 필터 (오후 9시 이후 운영)</li>
          <li>약국 이름 · 주소 · 전화번호 확인</li>
          <li>지도에서 길찾기 연동</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3">자주 묻는 질문</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Q. 서울 생활 지도는 무료인가요?
            </h3>
            <p className="text-sm text-gray-600">
              네, 서울 생활 지도는 완전 무료 서비스입니다. 별도의 회원가입 없이 바로 이용하실 수 있습니다.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Q. 쇼핑몰 정보는 얼마나 자주 업데이트되나요?
            </h3>
            <p className="text-sm text-gray-600">
              쇼핑몰 흡연구역, 편의점, 화장실 위치는 직접 조사한 정보로 운영됩니다.
              매장 재배치 등으로 정보가 달라질 수 있으며, 이용 전 현장에서 한 번 더 확인하시길 권장합니다.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Q. 내 현재 위치는 어떻게 사용하나요?
            </h3>
            <p className="text-sm text-gray-600">
              각 지도 페이지 우측 하단의 🧭 버튼을 누르면 현재 위치로 지도가 이동합니다.
              위치 정보는 지도 표시에만 사용되며, 서버에 저장되지 않습니다.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">데이터 출처</h2>
        <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
          <li>공공화장실: 서울특별시 공공데이터</li>
          <li>약국: 건강보험심사평가원 공공데이터포털</li>
          <li>쇼핑몰 편의시설: 직접 조사 및 수집</li>
        </ul>
      </section>
    </main>
  )
}
