'use client';

import { useEffect } from 'react';
import { isKakaoInAppBrowser, isAndroid, buildChromeIntentUrl } from '@/lib/inapp';

export function InAppBrowserRedirect() {
  useEffect(() => {
    const ua = navigator.userAgent;
    if (!isKakaoInAppBrowser(ua)) return;

    const currentUrl = window.location.href;

    if (isAndroid(ua)) {
      const intentUrl = buildChromeIntentUrl(currentUrl);
      if (intentUrl) {
        window.location.href = intentUrl;
        return;
      }
    }

    // iOS: 카카오톡 인앱 브라우저에서 외부 브라우저로 리다이렉트 시도
    // 일부 iOS 버전에서는 자동 리다이렉트가 제한될 수 있음
    // 현재 페이지 유지 (기능은 제한적으로 동작)
  }, []);

  return null;
}
