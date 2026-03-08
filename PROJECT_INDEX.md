# Project Index: BothSides

Generated: 2026-03-07

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── admin/              # Admin dashboard pages (battles, feedback, llm, opinions, reports, schedule, site-reviews, topics, users)
│   ├── api/                # REST API endpoints
│   │   ├── admin/          # Admin-only APIs
│   │   ├── auth/           # NextAuth [...nextauth]
│   │   ├── battles/        # Battle CRUD, challenge, stream, setup
│   │   ├── cron/           # Cron endpoints (battle cleanup)
│   │   ├── feedback/       # User feedback
│   │   ├── notifications/  # Notification CRUD, SSE stream
│   │   ├── opinions/       # Opinions, reactions, replies, reports
│   │   ├── site-reviews/   # NPS site reviews
│   │   ├── topics/         # Topics CRUD, votes, opinions, grounds, summary, stream
│   │   ├── trends/         # Trending topics
│   │   ├── upload/         # File upload (Vercel Blob)
│   │   └── users/          # User profiles
│   ├── auth/               # Sign-in & error pages
│   ├── battles/[id]/       # Battle detail page
│   ├── explore/            # Explore/browse topics
│   ├── feedback/           # Feedback submission page
│   ├── notifications/      # Notifications page
│   ├── profile/            # User profile edit
│   ├── topics/[id]/        # Topic detail & debate page
│   ├── topics/new/         # Create new topic
│   └── users/[id]/         # Public user profile
├── components/
│   ├── admin/              # Admin dashboard components (tables, stats, schedule, LLM)
│   ├── badges/             # Badge system (UserBadges, BadgeShowcase)
│   ├── battle/             # Battle UI (cards, chat, HP bar, timer, grounds, setup)
│   ├── debate/             # Debate UI (opinions, votes, replies, reports, SSE)
│   ├── explore/            # Explore page (bubble map)
│   ├── feedback/           # Feedback FAB
│   ├── home/               # Home page client
│   ├── layout/             # App shell, header, sidebars, footer, user menu
│   ├── notifications/      # Notification bell, dropdown, list
│   ├── providers/          # Context providers (theme, session, SWR, Kakao, UTM)
│   ├── site-review/        # NPS prompt
│   ├── topics/             # Topic cards, lists, share, author, images, featured
│   └── ui/                 # Radix UI primitives (button, dialog, select, tabs, etc.)
├── hooks/                  # Custom hooks (SSE, media query, swipe tabs, truncation)
├── lib/                    # Utilities
│   ├── auth.ts             # Auth helpers
│   ├── badges.ts           # Badge definitions & calculation
│   ├── cache.ts            # Caching utilities
│   ├── constants.ts        # App constants
│   ├── db.ts               # Prisma client singleton
│   ├── encryption.ts       # Encryption helpers
│   ├── profanity.ts        # Profanity filter (badwords-ko)
│   ├── sse.ts              # Server-Sent Events helpers
│   ├── validation.ts       # Input validation
│   └── visitor.ts          # Visitor/fingerprint tracking
├── modules/                # Business logic (service layer)
│   ├── auth/               # NextAuth options
│   ├── battles/            # Battle service, SSE, timer, grounds, prompts
│   ├── feedback/           # Feedback service
│   ├── llm/                # LLM integration (OpenAI provider, prompts, auto-trigger)
│   ├── llm-settings/       # LLM admin settings
│   ├── notifications/      # Notification service
│   ├── opinions/           # Opinion service
│   ├── reactions/          # Reaction service
│   ├── reports/            # Report service
│   ├── site-reviews/       # Site review (NPS) service
│   ├── topics/             # Topic service
│   ├── trends/             # Trending algorithm
│   ├── users/              # User service
│   └── votes/              # Vote service
├── types/                  # TypeScript definitions (api.ts, next-auth.d.ts, vendor .d.ts)
└── middleware.ts           # Next.js middleware

prisma/
└── schema.prisma           # Database schema (PostgreSQL)

scripts/cron/
├── applyViewBoostLedger.mjs  # View boost cron job
└── publishScheduledTopics.mjs # Scheduled topic publishing

docs/
├── README.md
├── i18n-seo.md
└── features/
    ├── badge-system.md
    └── namuwiki-trending-analysis.md
```

## Entry Points

- **Web App**: `src/app/layout.tsx` - Root layout with providers
- **Home Page**: `src/app/page.tsx` - Landing page with featured topics
- **API**: `src/app/api/` - REST endpoints
- **Auth**: `src/app/api/auth/[...nextauth]/route.ts` - NextAuth handler
- **Middleware**: `src/middleware.ts` - Request middleware
- **DB Client**: `src/lib/db.ts` - Prisma singleton
- **Cron**: `scripts/cron/*.mjs` - Scheduled jobs

## Core Modules

### battles
- Path: `src/modules/battles/`
- Files: service.ts, sse.ts, timer.ts, grounds.ts, host.ts, prompts.ts, constants.ts, schema.ts, types.ts
- Purpose: Real-time debate battles with HP system, turn-based messaging, SSE streaming

### llm
- Path: `src/modules/llm/`
- Files: service.ts, singleton.ts, auto-trigger.ts, schema.ts, core/ (provider, prompts, retry, usage)
- Purpose: AI-powered opinion generation, topic summarization, grounds classification (OpenAI)

### topics
- Path: `src/modules/topics/`
- Files: service.ts, schema.ts
- Purpose: Topic CRUD, scheduling, featuring, category management

### opinions
- Path: `src/modules/opinions/`
- Files: service.ts, schema.ts
- Purpose: Nested comment system with sides (A/B), blinding, anonymity

### votes
- Path: `src/modules/votes/`
- Files: service.ts, schema.ts
- Purpose: Voting system supporting both authenticated users and guests

### notifications
- Path: `src/modules/notifications/`
- Files: service.ts, schema.ts
- Purpose: Reply and battle notifications with SSE real-time delivery

### trends
- Path: `src/modules/trends/`
- Files: service.ts, types.ts
- Purpose: Trending topics algorithm

## Data Models (Prisma)

| Model | Purpose |
|-------|---------|
| User | Users with roles (USER/ADMIN), bot flag, blacklist, badge |
| Topic | A vs B debate topics with categories, images, scheduling, SEO |
| Vote | Authenticated + guest voting with fingerprint dedup |
| Opinion | Nested comments with sides, blinding, anonymity |
| Reaction | Like/dislike on opinions |
| Report | Content reporting (opinions & topics) |
| Feedback | User feedback (bug/suggestion/question) |
| Notification | Reply & battle notifications |
| SiteReview | NPS score tracking |
| Battle | Real-time 1v1 debate with HP, turns, timer |
| BattleMessage | Chat messages in battles |
| BattleComment | Observer comments on battles |
| TopicSummary | AI-generated topic summaries |
| GroundsSummary | AI-generated argument grounds per side |
| OpinionGround | AI classification of opinions to grounds |
| LlmSettings | Admin-configurable LLM provider settings |

## Configuration

| File | Purpose |
|------|---------|
| `package.json` | Dependencies & scripts (next, prisma, radix, swr, zod) |
| `prisma/schema.prisma` | PostgreSQL schema with 17 models |
| `next.config.mjs` | Security headers, CSP, image remotes, package optimization |
| `tsconfig.json` | TypeScript strict mode, `@/*` path alias |
| `.eslintrc.json` | ESLint config |
| `components.json` | shadcn/ui component config |
| `tailwind.config.ts` | Tailwind CSS config |

## Key Dependencies

| Package | Purpose |
|---------|---------|
| next@16.1.6 | React framework (App Router) |
| next-auth@4.x | Authentication (Kakao OAuth) |
| @prisma/client | Database ORM |
| swr | Client-side data fetching/caching |
| zod | Schema validation |
| @radix-ui/* | Accessible UI primitives |
| lucide-react | Icon library |
| framer-motion | Animations |
| d3-hierarchy/selection/zoom | Data visualization (bubble map) |
| @vercel/blob | File storage |
| @upstash/ratelimit | Rate limiting |
| badwords-ko | Korean profanity filter |
| next-themes | Dark mode |
| date-fns | Date utilities |

## Quick Start

1. `pnpm install` - Install dependencies
2. `cp .env.example .env.local` - Configure environment
3. `pnpm prisma migrate dev` - Run migrations
4. `pnpm dev` - Start dev server (http://localhost:3000)

## Deployment

- **Platform**: Vercel (auto-deploy on push to `main`)
- **Database**: PostgreSQL (pooled + direct connections)
- **Storage**: Vercel Blob
- **Rate Limiting**: Upstash Redis
- **Branch**: `main` (production), `dev` (development)
