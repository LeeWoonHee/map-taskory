import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { LanguageProvider } from "../i18n/LanguageContext";

import appCss from "../styles.css?url";

const THEME_INIT_SCRIPT = `(function(){try{var root=document.documentElement;root.classList.remove('light','auto');root.classList.add('dark');root.setAttribute('data-theme','dark');root.style.colorScheme='dark';}catch(e){}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "서울 생활 지도 | 쇼핑몰 · 공공화장실 · 약국",
      },
      {
        name: "description",
        content:
          "서울 쇼핑몰 흡연구역, 공공화장실, 약국 위치를 지도에서 한눈에 확인하세요.",
      },
      {
        name: "keywords",
        content: "서울쇼핑몰흡연구역,서울공공화장실,서울약국,서울지도,seoul mall smoking area,seoul public restroom,seoul pharmacy map",
      },
      {
        property: "og:title",
        content: "서울 생활 지도 | 쇼핑몰 · 공공화장실 · 약국",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://map.taskory.work" },
      {
        property: "og:description",
        content:
          "서울 쇼핑몰 흡연구역, 공공화장실, 약국 위치를 지도에서 한눈에 확인하세요.",
      },
      {
        name: "theme-color",
        content: "#1e293b",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "kakao:title",
        content: "서울 생활 지도 | 쇼핑몰 · 공공화장실 · 약국",
      },
      {
        name: "google-site-verification",
        content: "YK0uylhG5mPDeUcfzmsuhiJ_5qlXkI12xLZ0JuVftgo",
      },
      {
        name: "naver-site-verification",
        content: "6c07ca86af04ede6ffe86e65679475019a3a4eed",
      },
    ],
    scripts: [
      // AdSense: 실제 광고 단위 ID 설정 후 주석 해제
      // {
      //   src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6691879714410770",
      //   async: true,
      // },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "서울 생활 지도 | 쇼핑몰 · 공공화장실 · 약국",
          url: "https://map.taskory.work",
          description:
            "서울 쇼핑몰 흡연구역, 공공화장실, 약국 위치를 지도에서 한눈에 확인하세요.",
        }),
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "icon",
        type: "image/svg",
        href: "/favicon.svg",
      },
      {
        rel: "sitemap",
        type: "application/xml",
        href: "/sitemap.xml",
      },
    ],
  }),
  shellComponent: RootDocument,
});

function AdSenseSide({ slot }: { slot: string }) {
  return (
    <aside className="hidden 2xl:flex w-40 shrink-0 justify-center pt-4 sticky top-[52px] self-start h-[calc(100dvh-52px)] overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "160px", height: "600px" }}
        data-ad-client="ca-pub-6691879714410770"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="false"
      />
    </aside>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <LanguageProvider>
          <Header />
          {/* 데스크탑: 양쪽 AdSense 배너 + 중앙 콘텐츠 */}
          <div className="flex w-full">
            <main className="flex-1 min-w-0">{children}</main>
          </div>
          <Footer />
        </LanguageProvider>

        <Scripts />
      </body>
    </html>
  );
}
