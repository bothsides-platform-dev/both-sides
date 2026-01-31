'use client';

import { useEffect, useState } from 'react';
import { isKakaoInAppBrowser, isAndroid, buildChromeIntentUrl } from '@/lib/inapp';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';

const DISMISS_KEY = 'inapp-banner-dismissed';

function getTodayString() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * localStorage 안전하게 접근 (프라이빗 모드 대응)
 */
function safeLocalStorage() {
  try {
    // 테스트 쓰기/읽기로 localStorage 사용 가능 여부 확인
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    // 프라이빗 모드 또는 localStorage 비활성화
    return null;
  }
}

export function InAppBrowserRedirect() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (!isKakaoInAppBrowser(ua)) return;

    // 오늘 이미 닫았는지 확인
    const storage = safeLocalStorage();
    if (storage) {
      const dismissedDate = storage.getItem(DISMISS_KEY);
      if (dismissedDate === getTodayString()) return;
    }

    setShowBanner(true);
  }, []);

  const handleDismiss = () => {
    const storage = safeLocalStorage();
    if (storage) {
      storage.setItem(DISMISS_KEY, getTodayString());
    }
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  const handleOpenInBrowser = () => {
    const ua = navigator.userAgent;
    const currentUrl = window.location.href;

    if (isAndroid(ua)) {
      const intentUrl = buildChromeIntentUrl(currentUrl);
      if (intentUrl) {
        window.location.href = intentUrl;
        return;
      }
    }

    // iOS: Safari로 열기 시도 (동작하지 않을 수 있음)
    window.open(currentUrl, '_blank');
  };

  return (
    <div className="relative rounded-lg border border-amber-200 bg-amber-50 p-4">
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-full p-1 text-amber-600 hover:bg-amber-100"
        aria-label="알림 닫기"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="pr-8">
        <p className="text-sm font-medium text-amber-800">
          카카오톡 인앱 브라우저로 접속 중입니다
        </p>
        <p className="mt-1 text-xs text-amber-700">
          일부 기능이 제한될 수 있습니다. 더 나은 경험을 위해 외부 브라우저를 이용해 주세요.
        </p>

        <Button
          onClick={handleOpenInBrowser}
          variant="outline"
          size="sm"
          className="mt-3 border-amber-300 bg-white text-amber-700 hover:bg-amber-100"
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          외부 브라우저로 열기
        </Button>
      </div>
    </div>
  );
}
