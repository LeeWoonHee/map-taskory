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
        title: "💜 광화문 BTS 공연 가이드 | 편의시설 안내",
      },
      {
        name: "description",
        content:
          "2026년 3월 21일 광화문 BTS 무료 공연을 위한 편의시설 안내 — 편의점, 흡연구역, 무료화장실 위치를 지도에서 확인하세요.",
      },
      {
        name: "keywords",
        content: [
          // 한국어
          "bts,bts무료공연,bts광화문공연,광화문화장실,광화문편의점,광화문흡연실,광화문흡연구역,광화문흡연,bts무료공연화장실,bts광화문공연화장실,bts무료공연편의점,bts광화문공연편의점,bts무료공연흡연실,bts광화문공연흡연실,bts무료공연흡연구역,bts광화문공연흡연구역",
          // English
          "bts free concert,bts gwanghwamun,gwanghwamun concert,gwanghwamun convenience store,gwanghwamun restroom,gwanghwamun smoking area,bts concert map,bts concert facilities,seoul bts concert",
          // 日本語
          "bts無料コンサート,bts光化門,光化門コンビニ,光化門トイレ,光化門喫煙区域,btsコンサートマップ,btsコンサート施設案内",
          // 中文
          "bts免费演唱会,bts光化门,光化门便利店,光化门卫生间,光化门吸烟区,bts演唱会地图,bts演唱会设施指南",
        ].join(","),
      },
      {
        property: "og:title",
        content: "💜 광화문 BTS 공연 가이드 | 편의시설 안내",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://map.taskory.work" },
      {
        property: "og:description",
        content:
          "2026년 3월 21일 광화문 BTS 무료 공연을 위한 편의시설 안내 — 편의점, 흡연구역, 무료화장실 위치를 지도에서 확인하세요.",
      },
      {
        name: "theme-color",
        content: "#7B4EAB",
      },
      { name: "twitter:card", content: "summary_large_image" },
      // Kakao (Open Graph와 호환되지만 필요시 추가)
      {
        property: "kakao:title",
        content: "💜 광화문 BTS 공연 가이드 | 편의시설 안내",
      },
    ],
    scripts: [
      {
        src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6691879714410770",
        async: true,
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "💜 광화문 BTS 공연 가이드 | 편의시설 안내",
          url: "https://map.taskory.work",
          description:
            "2026년 3월 21일 광화문 BTS 무료 공연을 위한 편의시설 안내 — 편의점, 흡연구역, 무료화장실 위치를 지도에서 확인하세요.",
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

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <LanguageProvider>
          <Header />
          {children}
          <Footer />
        </LanguageProvider>

        <Scripts />
      </body>
    </html>
  );
}
