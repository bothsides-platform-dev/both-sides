import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// --- Request ID 생성 ---
function generateRequestId(): string {
  return crypto.randomUUID();
}

// --- CSRF 검증 (Origin-based) ---
const CSRF_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

function validateCsrf(request: NextRequest): boolean {
  if (!CSRF_METHODS.includes(request.method)) return true;

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Same-origin 요청 (origin 없음) 허용
  if (!origin) return true;

  // Origin이 host와 일치하는지 확인
  const allowedOrigins = [
    `https://${host}`,
    `http://${host}`, // 개발 환경
    process.env.NEXTAUTH_URL,
  ].filter(Boolean);

  return allowedOrigins.some((allowed) => origin === allowed);
}

// --- Body Size 제한 ---
const MAX_BODY_SIZES: Record<string, number> = {
  "/api/upload": 5 * 1024 * 1024, // 5MB
  "/api/": 100 * 1024, // 100KB 기본
};

function checkBodySize(request: NextRequest): boolean {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return true;

  const pathname = request.nextUrl.pathname;
  let maxSize = 100 * 1024; // 기본 100KB

  for (const [route, size] of Object.entries(MAX_BODY_SIZES)) {
    if (pathname.startsWith(route)) {
      maxSize = size;
      break;
    }
  }

  return parseInt(contentLength) <= maxSize;
}

// --- Rate Limiting 설정 ---
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const voteLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, "5 s"),
      prefix: "ratelimit:vote",
    })
  : null;

const reactionLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "2 s"),
      prefix: "ratelimit:reaction",
    })
  : null;

const reportLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      prefix: "ratelimit:report",
    })
  : null;

const opinionLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(2, "10 s"),
      prefix: "ratelimit:opinion",
    })
  : null;

const RATE_LIMITED_ROUTES: Array<{
  pattern: RegExp;
  limiter: Ratelimit | null;
  methods: string[];
}> = [
  {
    pattern: /^\/api\/topics\/[^/]+\/vote$/,
    limiter: voteLimiter,
    methods: ["PUT"],
  },
  {
    pattern: /^\/api\/opinions\/[^/]+\/reactions$/,
    limiter: reactionLimiter,
    methods: ["POST", "DELETE"],
  },
  {
    pattern: /^\/api\/(topics|opinions)\/[^/]+\/reports$/,
    limiter: reportLimiter,
    methods: ["POST"],
  },
  {
    pattern: /^\/api\/topics\/[^/]+\/opinions$/,
    limiter: opinionLimiter,
    methods: ["POST"],
  },
  {
    pattern: /^\/api\/opinions\/[^/]+\/replies$/,
    limiter: opinionLimiter,
    methods: ["POST"],
  },
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;
  const requestId = generateRequestId();

  // 1. CSRF 검증
  if (!validateCsrf(request)) {
    return NextResponse.json(
      { error: "잘못된 요청입니다.", requestId },
      { status: 403 }
    );
  }

  // 2. Body Size 검증
  if (!checkBodySize(request)) {
    return NextResponse.json(
      { error: "요청 크기가 너무 큽니다.", requestId },
      { status: 413 }
    );
  }

  // 3. Rate Limiting
  for (const route of RATE_LIMITED_ROUTES) {
    if (
      route.pattern.test(pathname) &&
      route.methods.includes(method) &&
      route.limiter
    ) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0] ??
        request.headers.get("x-real-ip") ??
        "unknown";

      const identifier = `${ip}:${pathname}`;

      try {
        const result = await route.limiter.limit(identifier);

        if (!result.success) {
          return NextResponse.json(
            { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", requestId },
            {
              status: 429,
              headers: {
                "X-Request-Id": requestId,
                "X-RateLimit-Limit": String(result.limit),
                "X-RateLimit-Remaining": String(result.remaining),
                "Retry-After": String(
                  Math.ceil((result.reset - Date.now()) / 1000)
                ),
              },
            }
          );
        }

        const response = NextResponse.next();
        response.headers.set("X-Request-Id", requestId);
        response.headers.set("X-RateLimit-Limit", String(result.limit));
        response.headers.set("X-RateLimit-Remaining", String(result.remaining));
        return response;
      } catch (error) {
        // Redis 연결 실패 시 요청 허용 (fail-open)
        console.error(`[${requestId}] Rate limit error:`, error);
        const response = NextResponse.next();
        response.headers.set("X-Request-Id", requestId);
        return response;
      }
    }
  }

  // Request ID를 응답 헤더에 추가
  const response = NextResponse.next();
  response.headers.set("X-Request-Id", requestId);
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
