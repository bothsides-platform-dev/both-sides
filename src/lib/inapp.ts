export function isKakaoInAppBrowser(userAgent?: string): boolean {
  if (!userAgent) return false;
  return /KAKAOTALK/i.test(userAgent);
}

export function isAndroid(userAgent?: string): boolean {
  if (!userAgent) return false;
  return /Android/i.test(userAgent);
}

export function isIOS(userAgent?: string): boolean {
  if (!userAgent) return false;
  return /iPhone|iPad|iPod/i.test(userAgent);
}

export function buildChromeIntentUrl(targetUrl: string): string | null {
  try {
    const u = new URL(targetUrl);
    const scheme = u.protocol.replace(":", "");
    return `intent://${u.host}${u.pathname}${u.search}${u.hash}#Intent;scheme=${scheme};package=com.android.chrome;end`;
  } catch {
    return null;
  }
}


