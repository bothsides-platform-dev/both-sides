import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Edge Runtime용 Redis 클라이언트 (환경변수가 없으면 null)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// Rate limiters (Redis가 있을 때만 생성)
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

// 라우트 → limiter 매핑
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
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Rate limiting 적용
  for (const route of RATE_LIMITED_ROUTES) {
    if (
      route.pattern.test(pathname) &&
      route.methods.includes(method) &&
      route.limiter
    ) {
      const ip =
        request.ip ??
        request.headers.get("x-forwarded-for")?.split(",")[0] ??
        "unknown";

      const identifier = `${ip}:${pathname}`;

      try {
        const result = await route.limiter.limit(identifier);

        if (!result.success) {
          return NextResponse.json(
            { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
            {
              status: 429,
              headers: {
                "X-RateLimit-Limit": String(result.limit),
                "X-RateLimit-Remaining": String(result.remaining),
                "X-RateLimit-Reset": String(result.reset),
                "Retry-After": String(
                  Math.ceil((result.reset - Date.now()) / 1000)
                ),
              },
            }
          );
        }

        const response = NextResponse.next();
        response.headers.set("X-RateLimit-Limit", String(result.limit));
        response.headers.set("X-RateLimit-Remaining", String(result.remaining));
        return response;
      } catch (error) {
        // Redis 연결 실패 시 요청 허용 (fail-open)
        console.error("Rate limit error:", error);
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
