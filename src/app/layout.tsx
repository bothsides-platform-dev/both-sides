import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { KakaoProvider } from "@/components/providers/KakaoProvider";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { UTMProvider } from "@/components/providers/UTMProvider";
import { ToastProvider } from "@/components/ui/toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AppShell } from "@/components/layout/AppShell";
import { FeedbackFAB } from "@/components/feedback/FeedbackFAB";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://bothsides.club"),
  title: {
    default: "BothSides - 양자택일 토론 플랫폼",
    template: "%s - BothSides",
  },
  description: "A vs B, 당신의 선택은? 양자택일 토론 플랫폼에서 의견을 나눠보세요.",
  openGraph: {
    type: "website",
    siteName: "BothSides",
    locale: "ko_KR",
    title: "BothSides - 양자택일 토론 플랫폼",
    description: "A vs B, 당신의 선택은? 양자택일 토론 플랫폼에서 의견을 나눠보세요.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "BothSides - 양자택일 토론 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BothSides - 양자택일 토론 플랫폼",
    description: "A vs B, 당신의 선택은? 양자택일 토론 플랫폼에서 의견을 나눠보세요.",
    images: ["/og-default.png"],
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bothsides.club";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "BothSides",
  alternateName: "보스사이드",
  url: siteUrl,
  description: "A vs B, 당신의 선택은? 양자택일 토론 플랫폼",
  inLanguage: "ko",
  publisher: {
    "@type": "Organization",
    name: "BothSides",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/logo.png`,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XYHMPSDY1G"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XYHMPSDY1G');
          `}
        </Script>
        {/* Microsoft Clarity */}
        <Script id="clarity-script" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "v6eobm9gc5");
          `}
        </Script>
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="bothsides-theme"
          >
            <UTMProvider>
              <KakaoProvider>
                <SessionProvider>
                  <SWRProvider>
                    <ToastProvider>
                      <Header />
                      <AppShell>
                        <main className="flex-1 w-full px-4 md:px-8 lg:px-12 py-4 md:py-6 pb-6">
                          {children}
                        </main>
                        <Footer />
                      </AppShell>
                      <FeedbackFAB />
                    </ToastProvider>
                  </SWRProvider>
                </SessionProvider>
              </KakaoProvider>
            </UTMProvider>
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
