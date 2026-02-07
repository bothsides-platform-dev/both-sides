import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 text-center">
      {/* 404 그라데이션 숫자 */}
      <h1 className="bg-gradient-to-r from-sideA to-sideB bg-clip-text text-8xl font-bold text-transparent md:text-9xl">
        404
      </h1>

      {/* 메인 메시지 */}
      <h2 className="mt-6 text-2xl font-bold md:text-3xl">
        페이지를 찾을 수 없습니다
      </h2>

      {/* A vs B 서브 메시지 */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground sm:gap-3">
        <span className="text-sideA line-through opacity-50">
          A: 이 페이지는 존재한다
        </span>
        <span className="font-bold">VS</span>
        <span className="font-semibold text-sideB">
          B: 이 페이지는 존재하지 않는다
        </span>
      </div>

      {/* 설명 */}
      <p className="mt-6 max-w-md text-muted-foreground">
        요청하신 페이지가 삭제되었거나, 주소가 변경되었을 수 있습니다.
      </p>

      {/* 액션 버튼 */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            홈으로 돌아가기
          </Link>
        </Button>
      </div>
    </div>
  );
}
