# Project Index: BothSides

Generated: 2026-02-28 | 311 source files | ~31K LOC | 0 test files

## Quick Start

```bash
pnpm install          # Install dependencies
pnpm prisma generate  # Generate Prisma client
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build
```

## Tech Stack

Next.js 16.1.6 (App Router) | React 18 | TypeScript | Prisma 6.19 + PostgreSQL | NextAuth.js 4.24 (Kakao OAuth) | TailwindCSS 3.4 + Radix UI | SWR | Zod 4.3 | Framer Motion 12.29 | Vercel (Hosting + Blob) | pnpm

## Project Structure

```
src/
├── app/                    # Next.js App Router (pages + API routes)
│   ├── api/                # REST API endpoints (~60 routes)
│   ├── admin/              # Admin dashboard (9 pages: dashboard, topics, opinions, users, reports, feedback, site-reviews, llm, battles, schedule)
│   ├── topics/             # Topic CRUD + detail + OG images
│   ├── battles/            # Battle detail page + client component
│   ├── users/              # User profile page
│   ├── auth/               # Sign in / error
│   ├── explore/            # Explore/search with bubble map
│   ├── notifications/      # Notifications page
│   ├── profile/            # Profile edit
│   ├── feedback/           # Feedback page
│   └── about/              # About page
├── components/             # React components (~90 files)
│   ├── admin/              # Admin tables & dashboards (11 files)
│   ├── admin/llm/          # LLM management UI (6 files)
│   ├── battle/             # Battle UI (14 files)
│   ├── debate/             # Opinions, voting, reports, SSE (12 files)
│   ├── topics/             # Topic cards, lists, sharing (12 files)
│   ├── layout/             # AppShell, Header, Sidebars, Footer (8 files)
│   ├── notifications/      # Bell, dropdown, list (5 files)
│   ├── ui/                 # Radix primitives + custom (25+ files)
│   ├── badges/             # UserBadges, BadgeShowcase
│   ├── providers/          # Session, Theme, SWR, Kakao, UTM (5 files)
│   └── explore/, home/, trending/, feedback/, site-review/
├── modules/                # Business logic (14 domains)
│   ├── auth/               # NextAuth config (Kakao OAuth, Prisma adapter)
│   ├── topics/             # Topic CRUD, filtering, featuring, scheduling
│   ├── opinions/           # Opinions CRUD, threading, admin management
│   ├── votes/              # Voting (auth + guest), stats, cache invalidation
│   ├── reactions/          # Like/dislike toggle
│   ├── notifications/      # Reply & battle notifications, unread count
│   ├── battles/            # Challenge, setup, messaging, host AI, SSE, timer, prompts (8 files)
│   ├── reports/            # Content reporting
│   ├── feedback/           # User feedback
│   ├── users/              # Admin user management, badge selection
│   ├── trends/             # Trending searches (SerpAPI, 3h cache)
│   ├── site-reviews/       # NPS survey
│   ├── llm/                # AI summarization & opinion generation (OpenAI) - core/, prompts/, services
│   └── llm-settings/       # Encrypted LLM provider config
├── hooks/                  # Custom React hooks (7 files)
│   ├── useSSE.ts           # Generic SSE with reconnection
│   ├── useBattleSSE.tsx    # Battle SSE + polling fallback
│   ├── useTopicSSE.tsx     # Topic real-time updates
│   ├── useUnreadNotificationCount.ts  # Notification count via SSE
│   ├── useMediaQuery.ts    # useIsMobile(), useIsDesktop()
│   ├── useSwipeableTabs.ts # Swipe gesture for tabs
│   └── useTruncationDetection.ts
├── lib/                    # Utilities (18 files)
│   ├── db.ts               # Prisma singleton
│   ├── auth.ts             # getSession, requireAuth, requireAdmin
│   ├── errors.ts           # AppError hierarchy + handleApiError
│   ├── validation.ts       # Zod helpers + common schemas
│   ├── utils.ts            # cn(), formatDate/Number/RelativeTime
│   ├── cache.ts            # In-memory TTL cache (MemoryCache singleton)
│   ├── sse.ts              # SSE client management + broadcast
│   ├── visitor.ts          # Guest tracking: visitorId, fingerprint, IP
│   ├── badges.ts           # 14 badge definitions, 5 categories, 4 tiers
│   ├── profanity.ts        # Korean profanity filter
│   ├── nickname.ts         # Random Korean nicknames
│   ├── encryption.ts       # AES-256-GCM for API keys
│   ├── analytics.ts        # GA4 event tracking
│   ├── constants.ts        # CATEGORY_LABELS, enums
│   ├── fetcher.ts          # SWR fetcher
│   ├── api-error.ts        # ApiError class + apiFetch<T>()
│   ├── api-helpers.ts      # withAdmin middleware
│   ├── inapp.ts            # In-app browser detection
│   └── prisma-selects.ts   # Reusable Prisma select objects
└── types/                  # TypeScript declarations (4 files)
prisma/
└── schema.prisma           # 20 models, 8 enums (547 lines)
docs/
└── features/badge-system.md
```

## Entry Points

- **App**: `src/app/layout.tsx` — Root layout with providers (Session, Theme, Kakao, SWR, UTM, Toast)
- **Home**: `src/app/page.tsx` → `HomePageClient.tsx`
- **API**: `src/app/api/` — ~60 REST endpoints
- **DB**: `prisma/schema.prisma` — PostgreSQL via Prisma

## Database Models (20 models)

```
User ──┬── Account (OAuth)
       ├── Session
       ├── Topic ──┬── Vote (A/B, guest+auth dedup)
       │           ├── Opinion ──┬── Reaction (LIKE/DISLIKE)
       │           │             ├── Report
       │           │             ├── Opinion (self-ref replies)
       │           │             └── OpinionGround (AI classification)
       │           ├── TopicView (unique visitor tracking)
       │           ├── TopicSummary (AI summary)
       │           ├── GroundsSummary (per-side AI grounds)
       │           ├── Report
       │           ├── Battle ──┬── BattleMessage
       │           │            ├── BattleComment
       │           │            └── Notification
       │           └── Notification
       ├── Battle (as challenger/challenged)
       ├── Feedback
       ├── SiteReview (NPS)
       └── Notification
LlmSettings (AI provider config, encrypted)
VerificationToken (standalone)
```

**Enums**: Role(USER/ADMIN), Side(A/B), Category(8: DAILY/POLITICS/SOCIAL/RELATIONSHIP/HISTORY/GAME/TECH/SPORTS), ReactionType, ReportStatus, FeedbackStatus, FeedbackCategory, NotificationType(7), BattleStatus(8), BattleMessageRole, BattleResult

## API Routes Summary

| Prefix | Methods | Auth | Purpose |
|--------|---------|------|---------|
| `/api/topics` | GET, POST | Optional/Required | List & create topics |
| `/api/topics/[id]` | GET, PUT, DELETE | Varies | Topic CRUD |
| `/api/topics/[id]/vote` | POST | Optional | Vote (auth + guest) |
| `/api/topics/[id]/opinions` | GET | Public | Topic opinions |
| `/api/topics/[id]/summary` | GET | Public | AI summary |
| `/api/topics/[id]/grounds` | GET | Public | Grounds analysis |
| `/api/topics/[id]/stream` | GET | Public | SSE real-time updates |
| `/api/topics/[id]/view` | GET | Public | Track view |
| `/api/topics/[id]/vote-stats` | GET | Public | Vote statistics |
| `/api/topics/[id]/vote-info` | GET | Public | Stats + user vote |
| `/api/topics/[id]/my-vote` | GET | Required | Current user's vote |
| `/api/opinions` | GET, POST | Varies | Opinion CRUD |
| `/api/opinions/[id]/replies` | GET | Public | Threaded replies |
| `/api/opinions/[id]/reactions` | GET, POST | Varies | Like/dislike |
| `/api/opinions/[id]/ancestors` | GET | Public | Reply thread chain |
| `/api/battles` | GET, POST | Varies | Battle list & create |
| `/api/battles/[id]` | GET, PUT, DELETE | Varies | Battle CRUD |
| `/api/battles/[id]/messages` | GET, POST | Required | Battle chat |
| `/api/battles/[id]/comments` | GET, POST | Varies | Observer comments |
| `/api/battles/[id]/grounds` | GET, POST | Varies | Battle grounds |
| `/api/battles/[id]/stream` | GET | Public | Battle SSE |
| `/api/battles/[id]/setup` | POST | Required | Setup battle |
| `/api/battles/[id]/respond` | POST | Required | Accept/decline |
| `/api/battles/[id]/resign` | POST | Required | Resign battle |
| `/api/battles/challenge` | POST | Required | Issue challenge |
| `/api/battles/active` | GET | Public | Active battles list |
| `/api/notifications` | GET | Required | User notifications |
| `/api/notifications/stream` | GET | Required | Notification SSE |
| `/api/notifications/unread-count` | GET | Required | Badge count |
| `/api/notifications/read-all` | POST | Required | Mark all read |
| `/api/profile` | GET, PUT | Required | User profile |
| `/api/users/[id]` | GET | Public | Public profile |
| `/api/upload` | POST | Required | Blob storage |
| `/api/feedback` | POST | Optional | Submit feedback |
| `/api/site-reviews` | POST | Optional | NPS review |
| `/api/trends` | GET | Public | Trending searches |
| `/api/admin/*` | Various | Admin | ~25 admin endpoints |
| `/api/admin/llm/*` | Various | Admin | AI management (settings, generate, summarize, grounds) |
| `/api/cron/battles` | POST | System | Battle maintenance cron |

## Key Patterns

- **Auth**: `requireAuth()` / `requireAdmin()` from `lib/auth.ts`
- **Validation**: Zod schemas in `modules/*/schema.ts`, validated via `validateRequest()`
- **Errors**: `AppError` hierarchy → `handleApiError()` in API routes
- **Data fetching**: SWR on client, Prisma on server, `fetcher<T>()` helper
- **Real-time**: SSE via `lib/sse.ts` (addClient/removeClient/broadcast)
- **Guest support**: Votes & opinions via visitorId/fingerprint/IP
- **Caching**: In-memory TTL cache (`lib/cache.ts`) for vote stats & trends
- **Dark mode**: `next-themes` with class-based Tailwind
- **Rate limiting**: `@upstash/ratelimit` + Redis
- **Profanity**: `badwords-ko` Korean filter on opinions
- **Security**: CSP headers, CSRF origin check, body size limits

## Environment Variables

**Required**: DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET, NEXT_PUBLIC_KAKAO_JS_KEY, BLOB_READ_WRITE_TOKEN

**Optional**: SERPAPI_KEY (trends), ENCRYPTION_KEY (LLM API key encryption)

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.6 | App framework (App Router) |
| react | ^18 | UI library |
| @prisma/client | ^6.19.2 | Database ORM |
| next-auth | ^4.24.13 | Authentication (Kakao OAuth) |
| swr | ^2.3.8 | Client data fetching + caching |
| zod | ^4.3.5 | Schema validation |
| @radix-ui/* | various | UI primitives (13+ packages) |
| framer-motion | ^12.29.0 | Animations |
| d3-* | ^3.x | Bubble map visualization |
| @upstash/ratelimit | ^2.0.8 | Rate limiting |
| @vercel/blob | ^2.2.0 | Image/file storage |
| lucide-react | ^0.562.0 | Icons |
| next-themes | ^0.4.6 | Dark mode |
| badwords-ko | ^1.0.4 | Korean profanity filter |
| date-fns | ^4.1.0 | Date formatting |
| @dnd-kit/core | ^6.3.1 | Drag-and-drop |

## Deployment

- **Host**: Vercel (auto-deploy on push to `main`)
- **Branches**: `main` (production), `dev` (development)
- **URL**: https://bothsides.club
- **Package manager**: pnpm (lockfile must be in sync for CI)
- **Build**: `pnpm build` (includes `prisma generate`)
