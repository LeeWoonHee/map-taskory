import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import { LanguageProvider } from '../i18n/LanguageContext'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{document.documentElement.style.colorScheme='light';}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: '서울 생활 지도 | 쇼핑몰 · 공공화장실 · 약국',
      },
      {
        name: 'description',
        content: '서울 쇼핑몰 흡연구역, 공공화장실, 약국 위치를 지도에서 한눈에 확인하세요.',
      },
      {
        name: 'keywords',
        content:
          '서울쇼핑몰흡연구역,서울공공화장실,서울약국,서울지도, 서울화장실, 스타필드흡연, 백화점흡연, 스타필드편의점, 백화점편의점, 내근처 약국, 내근처화장실, 내근처공공화장실, 무료화장실, 서울무료화장실, 내근처무료화장실, 서울약국위치, 서울화장실위치, 흡연구역위치, 흡연실위치, 약국위치, 편의점위치, 24시약국, 스타필드흡연실위치, 스타필드흡연구역위치',
      },
      {
        property: 'og:title',
        content: '서울 생활 지도 | 쇼핑몰 · 공공화장실 · 약국',
      },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://map.taskory.work' },
      {
        property: 'og:description',
        content: '서울 쇼핑몰 흡연구역, 공공화장실, 약국 위치를 지도에서 한눈에 확인하세요.',
      },
      { property: 'og:image', content: 'https://map.taskory.work/og-image.png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:image', content: 'https://map.taskory.work/og-image.png' },
      {
        name: 'theme-color',
        content: '#FFFFFF',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        property: 'kakao:title',
        content: '서울 생활 지도 | 쇼핑몰 · 공공화장실 · 약국',
      },
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
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6691879714410770',
        async: true,
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: '서울 생활 지도 | 쇼핑몰 · 공공화장실 · 약국',
          url: 'https://map.taskory.work',
          description: '서울 쇼핑몰 흡연구역, 공공화장실, 약국 위치를 지도에서 한눈에 확인하세요.',
        }),
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'icon',
        type: 'image/svg',
        href: '/favicon.svg',
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo192.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'sitemap',
        type: 'application/xml',
        href: '/sitemap.xml',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere bg-[#F5F5F7]">
        <LanguageProvider>
          <Header />
          {/* 데스크탑: 양측 AdSense 컬럼 + 중앙 콘텐츠 */}
          <div className="flex">
            {/* 왼쪽 광고 */}
            <aside className="hidden xl:flex w-48 shrink-0 flex-col items-center pt-4 gap-4 sticky top-11 h-[calc(100dvh-108px)] self-start border-r border-gray-200 bg-white">
              <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '160px', height: '600px' }}
                data-ad-client="ca-pub-6691879714410770"
                data-ad-slot="LEFT_SLOT_ID"
                data-ad-format="auto"
              />
            </aside>

            <main className="flex-1 min-w-0">{children}</main>

            {/* 오른쪽 광고 */}
            <aside className="hidden xl:flex w-48 shrink-0 flex-col items-center pt-4 gap-4 sticky top-11 h-[calc(100dvh-108px)] self-start border-l border-gray-200 bg-white">
              <ins
                className="adsbygoogle"
                style={{ display: 'block', width: '160px', height: '600px' }}
                data-ad-client="ca-pub-6691879714410770"
                data-ad-slot="RIGHT_SLOT_ID"
                data-ad-format="auto"
              />
            </aside>
          </div>
          <BottomNav />
        </LanguageProvider>
        <Scripts />
      </body>
    </html>
  )
}
