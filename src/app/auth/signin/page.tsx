"use client";

import { signIn } from "next-auth/react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildChromeIntentUrl, isAndroid, isKakaoInAppBrowser } from "@/lib/inapp";

export default function SignInPage() {
  const [toast, setToast] = useState<string | null>(null);

  const ua = useMemo(() => (typeof navigator !== "undefined" ? navigator.userAgent : ""), []);
  const inKakaoInApp = useMemo(() => isKakaoInAppBrowser(ua), [ua]);
  const inAndroid = useMemo(() => isAndroid(ua), [ua]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bothsides.club";

  const targetUrl = useMemo(() => {
    if (typeof window === "undefined") return new URL("/auth/signin", siteUrl).toString();
    try {
      const path = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      return new URL(path, window.location.origin).toString();
    } catch {
      return new URL("/auth/signin", siteUrl).toString();
    }
  }, [siteUrl]);

  const openInExternalBrowser = () => {
    if (!inKakaoInApp) return;

    // Android: try Chrome intent first (best chance to break out of in-app webview)
    if (inAndroid) {
      const intentUrl = buildChromeIntentUrl(targetUrl);
      if (intentUrl) {
        window.location.href = intentUrl;
        // Fallback: if intent is blocked, at least keep a normal URL available
        window.setTimeout(() => {
          try {
            window.location.href = targetUrl;
          } catch {
            // ignore
          }
        }, 800);
        return;
      }
    }

    // iOS or fallback: try opening a new tab
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setToast("링크를 복사했어요. Safari/Chrome에 붙여넣어 열어주세요.");
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = targetUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setToast("링크를 복사했어요. Safari/Chrome에 붙여넣어 열어주세요.");
      } catch {
        setToast("링크 복사에 실패했어요. 주소창의 URL을 길게 눌러 복사해 주세요.");
      }
    } finally {
      window.setTimeout(() => setToast(null), 2500);
    }
  };

  const handleGoogleSignIn = () => {
    if (inKakaoInApp) {
      setToast("카카오톡 인앱에서는 구글 로그인이 제한돼요. 외부 브라우저로 열어주세요.");
      window.setTimeout(() => setToast(null), 2500);
      return;
    }
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">BothSides</CardTitle>
          <CardDescription>
            양자택일 토론 플랫폼에 오신 것을 환영합니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {inKakaoInApp && (
            <div className="space-y-3 rounded-md border bg-muted/30 p-3 text-sm">
              <div className="font-medium">카카오톡 인앱에서는 구글 로그인이 막힐 수 있어요.</div>
              <div className="text-muted-foreground">
                아래 버튼으로 외부 브라우저(Safari/Chrome)에서 열어 로그인해 주세요.
              </div>
              <div className="flex gap-2">
                <Button type="button" className="flex-1" onClick={openInExternalBrowser}>
                  외부 브라우저에서 열기
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={copyLink}>
                  링크 복사
                </Button>
              </div>
              {toast && <div className="text-xs text-muted-foreground">{toast}</div>}
            </div>
          )}
          <Button
            onClick={handleGoogleSignIn}
            className="w-full"
            variant="outline"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 로그인
          </Button>
          {!inKakaoInApp && toast && (
            <div className="text-center text-xs text-muted-foreground">{toast}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
