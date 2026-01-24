interface KakaoShareLink {
  mobileWebUrl?: string;
  webUrl?: string;
}

interface KakaoShareContent {
  title: string;
  description?: string;
  imageUrl?: string;
  link: KakaoShareLink;
}

interface KakaoShareButton {
  title: string;
  link: KakaoShareLink;
}

interface KakaoShareFeedSettings {
  objectType: "feed";
  content: KakaoShareContent;
  buttons?: KakaoShareButton[];
}

interface KakaoShare {
  sendDefault(settings: KakaoShareFeedSettings): void;
}

interface KakaoSDK {
  init(appKey: string): void;
  isInitialized(): boolean;
  Share: KakaoShare;
}

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

export {};
