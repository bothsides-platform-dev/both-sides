"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Script from "next/script";

interface ShareKakaoOptions {
  title: string;
  description?: string;
  imageUrl?: string;
  url: string;
  buttonTitle?: string;
}

interface KakaoContextValue {
  isReady: boolean;
  shareKakao: (options: ShareKakaoOptions) => void;
}

const KakaoContext = createContext<KakaoContextValue | null>(null);

interface KakaoProviderProps {
  children: ReactNode;
}

export function KakaoProvider({ children }: KakaoProviderProps) {
  const [isReady, setIsReady] = useState(false);

  const handleScriptLoad = useCallback(() => {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;

    if (!kakaoKey) {
      console.error('[KakaoProvider] NEXT_PUBLIC_KAKAO_JS_KEY is not set');
      return;
    }

    if (window.Kakao) {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoKey);
      }
      setIsReady(true);
    }
  }, []);

  const shareKakao = useCallback((options: ShareKakaoOptions) => {
    if (!window.Kakao || !isReady) {
      // SDK 미로드 시 클립보드 복사로 대체
      navigator.clipboard.writeText(options.url).then(() => {
        alert("카카오톡 공유가 준비되지 않았습니다. 링크가 복사되었습니다.");
      }).catch(() => {
        alert("카카오톡 공유를 사용할 수 없습니다. 링크를 직접 복사해주세요.");
      });
      return;
    }

    window.Kakao.Share.sendDefault({
      objectType: "feed",
      content: {
        title: options.title,
        description: options.description,
        imageUrl: options.imageUrl,
        link: {
          mobileWebUrl: options.url,
          webUrl: options.url,
        },
      },
      buttons: [
        {
          title: options.buttonTitle || "자세히 보기",
          link: {
            mobileWebUrl: options.url,
            webUrl: options.url,
          },
        },
      ],
    });
  }, [isReady]);

  return (
    <KakaoContext.Provider value={{ isReady, shareKakao }}>
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
        integrity="sha384-DKYJZ8NLiK8MN4/C5P2dtSmLQ4KwPaoqAfyA/DfmEc1VDxu4yyC7wy6K1Hs90nka"
        crossOrigin="anonymous"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      {children}
    </KakaoContext.Provider>
  );
}

export function useKakao() {
  const context = useContext(KakaoContext);

  if (!context) {
    throw new Error("useKakao must be used within a KakaoProvider");
  }

  return context;
}
