import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <SessionProvider>
          <Header />
          <main className="flex-1 w-full px-4 md:px-8 lg:px-12 py-6">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
