"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const errorMessages: Record<string, string> = {
  Configuration: "서버 설정에 문제가 있습니다.",
  AccessDenied: "접근이 거부되었습니다.",
  Verification: "인증 토큰이 만료되었거나 이미 사용되었습니다.",
  Default: "로그인 중 오류가 발생했습니다.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-destructive">
          로그인 오류
        </CardTitle>
        <CardDescription>
          {errorMessages[error] ?? errorMessages.Default}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button asChild className="w-full">
          <Link href="/auth/signin">다시 시도</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadingFallback() {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<LoadingFallback />}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
