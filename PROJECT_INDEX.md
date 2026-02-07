# Project Index: BothSides (양자택일)

Generated: 2026-02-07

## Project Structure

```
src/
├── app/                    # Next.js App Router (15 pages, 40 API routes)
│   ├── (pages)             # / | /topics/[id] | /topics/new | /profile | /users/[id] | /feedback
│   ├── admin/              # /admin | /admin/topics | /admin/opinions | /admin/users | /admin/reports | /admin/feedback
│   ├── auth/               # /auth/signin | /auth/error
│   └── api/                # REST API routes
├── components/             # ~65 React components
│   ├── admin/              # AdminDashboard, TopicTable, OpinionTable, UserTable, StatsCard
│   ├── badges/             # UserBadges, BadgeShowcase
│   ├── debate/             # VoteSection, OpinionSection, OpinionList, OpinionItem, OpinionThread, ReplyForm, ReportDialog, MobileSideTabs, OpinionColumn
│   ├── feedback/           # FeedbackFAB
│   ├── home/               # HomePageClient
│   ├── layout/             # AppShell, Header, Footer, DesktopSidebar, DesktopRightSidebar, MobileBottomNav, UserMenu
│   ├── notifications/      # NotificationBell, NotificationDropdown, NotificationItem, NotificationList
│   ├── providers/          # SessionProvider, ThemeProvider, KakaoProvider, SWRProvider, UTMProvider, ToastProvider
│   ├── topics/             # TopicCard, TopicListItem, FeaturedTopicCard, TopicList, FeaturedSection, RecommendedSection, CommunitySection, TopicAuthorSection, TopicShareButton, ViewCountTracker, ReferenceLinksCollapsible
│   └── ui/                 # Radix UI primitives (avatar, badge, button, card, checkbox, collapsible, dialog, dropdown-menu, input, label, popover, progress, select, tabs, textarea, toast, horizontal-scroll, ImageUpload, ReferenceLinkInput, ShareButton)
├── hooks/                  # useMediaQuery, useSwipeableTabs, useTruncationDetection
├── lib/                    # 16 utility modules
├── modules/                # 9 business logic modules (schema + service)
└── types/                  # Type declarations (next-auth, kakao, badwords-ko, korean-random-names-generator)
prisma/
├── schema.prisma           # 12 models, 7 enums
└── migrations/             # 3 migrations
docs/
├── features/badge-system.md
├── i18n-seo.md
└── README.md
```

## Entry Points

- **App**: `src/app/layout.tsx` - Root layout with providers (Session, Theme, Kakao, SWR, UTM, Toast)
- **Home**: `src/app/page.tsx` → `src/components/home/HomePageClient.tsx`
- **API**: `src/app/api/` - 40 REST endpoints
- **Middleware**: `src/middleware.ts` - CSRF, rate limiting, body size checks
- **DB**: `prisma/schema.prisma` - PostgreSQL via Prisma

## Core Modules

### Module: topics
- Path: `src/modules/topics/`
- Exports: `createTopic`, `getTopics`, `getFeaturedTopics`, `getRecommendedTopics`, `updateTopic`, `updateFeatured`, `updateHidden`, `updateTopicAnonymity`
- Purpose: Topic CRUD, featuring, hiding, anonymity management

### Module: votes
- Path: `src/modules/votes/`
- Exports: `upsertVote`, `getVote`, `getVoteStats`
- Purpose: Binary A/B voting with guest fingerprint dedup

### Module: opinions
- Path: `src/modules/opinions/`
- Exports: `createOpinion`, `getOpinions`, `getOpinionAncestors`, `updateOpinionAnonymity`
- Purpose: Threaded comments with side alignment, guest support

### Module: reactions
- Path: `src/modules/reactions/`
- Exports: `toggleReaction`
- Purpose: Like/Dislike toggle on opinions

### Module: reports
- Path: `src/modules/reports/`
- Exports: `createReport`, `createTopicReport`
- Purpose: Abuse reporting with auto-blind at 3 reports

### Module: notifications
- Path: `src/modules/notifications/`
- Exports: `createReplyNotification`, `getNotifications`, `markAsRead`, `markAllAsRead`
- Purpose: Reply notification system

### Module: users
- Path: `src/modules/users/`
- Exports: `getUsersForAdmin`, `getUser`, `blacklistUser`, `updateProfile`
- Purpose: User management and admin blacklist

### Module: feedback
- Path: `src/modules/feedback/`
- Exports: `createFeedback`, `getFeedback`, `getFeedbackStats`
- Purpose: User feedback/bug report system

### Module: trends
- Path: `src/modules/trends/`
- Exports: `getTrends`
- Purpose: Trending keywords from SerpAPI with 3h cache

### Module: auth
- Path: `src/modules/auth/options.ts`
- Purpose: NextAuth config with Kakao OAuth, Prisma adapter, blacklist check

## Lib Utilities

| File | Purpose |
|------|---------|
| `auth.ts` | `requireAuth()`, `requireAuthStrict()`, `requireAdmin()` helpers |
| `badges.ts` | Badge engine: 14 badges, 5 categories, 4 tiers, `computeBadges()` |
| `cache.ts` | In-memory TTL cache (trends, vote stats) |
| `constants.ts` | CATEGORY_LABELS, SIDE_COLORS, BLIND_THRESHOLD, pagination |
| `db.ts` | Prisma singleton client |
| `errors.ts` | AppError hierarchy (Validation, Unauthorized, Forbidden, NotFound) |
| `fetcher.ts` | SWR fetcher utility |
| `validation.ts` | Zod schema validation + common schemas |
| `visitor.ts` | Guest tracking: visitorId cookie, IP, fingerprint (SHA-256) |
| `profanity.ts` | Korean profanity filter (badwords-ko) |
| `nickname.ts` | Random Korean nicknames (adjective + animal) |
| `utils.ts` | `cn()`, `formatDate()`, `formatRelativeTime()`, `formatNumber()` |
| `analytics.ts` | GA4 events: vote, opinion, share, topic, signup |
| `api-error.ts` | ApiError class + `apiFetch<T>()` with rate limit detection |
| `language.ts` | `isKoreanOrEnglishOnly()` content filter |
| `inapp.ts` | Kakao in-app browser detection + Chrome intent URLs |

## Database Schema (12 models)

```
User ──┬── Account (OAuth)
       ├── Session
       ├── Topic ──┬── Vote (A/B, guest+auth dedup)
       │           ├── Opinion ──┬── Reaction (LIKE/DISLIKE)
       │           │             ├── Report
       │           │             └── Opinion (self-ref replies)
       │           ├── TopicView (unique visitor tracking)
       │           ├── Report
       │           └── Notification
       ├── Feedback
       └── Notification
VerificationToken (standalone)
```

**Enums**: Role(USER/ADMIN), Side(A/B), Category(7 types), ReactionType(LIKE/DISLIKE), ReportStatus, FeedbackCategory, FeedbackStatus, NotificationType(REPLY)

## API Routes Summary

| Prefix | Methods | Description |
|--------|---------|-------------|
| `/api/topics` | GET, POST | List/create topics |
| `/api/topics/[id]` | GET, PUT | Topic detail/update |
| `/api/topics/[id]/vote` | PUT | Cast vote (rate limited) |
| `/api/topics/[id]/opinions` | GET, POST | Topic opinions |
| `/api/topics/[id]/reports` | GET, POST | Topic reports |
| `/api/topics/[id]/view` | POST | Track view |
| `/api/topics/[id]/vote-info` | GET | Vote stats + user vote |
| `/api/topics/[id]/vote-stats` | GET | Vote statistics |
| `/api/topics/[id]/anonymity` | PATCH | Toggle anonymity (admin) |
| `/api/topics/[id]/my-vote` | GET | Current user's vote |
| `/api/opinions/[id]/reactions` | POST, DELETE | Toggle reactions (rate limited) |
| `/api/opinions/[id]/reports` | GET, POST | Opinion reports |
| `/api/opinions/[id]/replies` | GET, POST | Threaded replies |
| `/api/opinions/[id]/ancestors` | GET | Reply thread ancestors |
| `/api/opinions/[id]/anonymity` | PATCH | Toggle anonymity (admin) |
| `/api/notifications` | GET | List notifications |
| `/api/notifications/unread-count` | GET | Unread count |
| `/api/notifications/[id]/read` | PATCH | Mark read |
| `/api/notifications/read-all` | PATCH | Mark all read |
| `/api/trends` | GET | Trending keywords |
| `/api/feedback` | GET, POST | Feedback CRUD |
| `/api/profile` | GET, PATCH | User profile |
| `/api/users/[id]` | GET, PATCH | Public profile |
| `/api/upload` | POST | Image upload (Vercel Blob) |
| `/api/admin/*` | Various | Admin endpoints (stats, topics, opinions, users, reports, feedback) |

## Configuration

| File | Purpose |
|------|---------|
| `package.json` | Next.js 16.1.6, React 18, Prisma 6.19, pnpm |
| `next.config.mjs` | Image domains, CSP headers, transpile badwords-ko |
| `tailwind.config.ts` | HSL color system, Radix UI integration |
| `tsconfig.json` | Path alias `@/*` → `src/*` |
| `middleware.ts` | CSRF + rate limiting + body size |

## Security

- **CSRF**: Origin-based validation on mutations
- **Rate Limiting**: Upstash Redis sliding window (vote: 1/5s, reaction: 3/2s, report: 5/60s, opinion: 2/10s)
- **Input Validation**: Zod schemas on all API inputs
- **Profanity Filter**: badwords-ko Korean filter
- **CSP**: Strict Content-Security-Policy headers
- **Auth Guards**: `requireAuth()`, `requireAdmin()` middleware helpers
- **Body Size**: 5MB uploads, 100KB default
- **Blacklisting**: Session-level enforcement

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 16.1.6 | React framework (App Router) |
| react | ^18 | UI library |
| prisma | ^6.19.2 | Database ORM |
| next-auth | ^4.24.13 | Authentication (Kakao OAuth) |
| swr | ^2.3.8 | Client-side data fetching |
| zod | ^4.3.5 | Schema validation |
| @upstash/ratelimit | ^2.0.8 | Rate limiting |
| @vercel/blob | ^2.0.0 | Image storage |
| framer-motion | ^12.29.0 | Animations |
| lucide-react | ^0.562.0 | Icons |
| next-themes | ^0.4.6 | Dark mode |
| tailwind-merge | ^3.4.0 | CSS class merging |
| badwords-ko | ^1.0.4 | Korean profanity filter |
| date-fns | ^4.1.0 | Date formatting |

## Quick Start

1. `pnpm install` (triggers `prisma generate`)
2. Set environment variables (DATABASE_URL, NEXTAUTH_SECRET, KAKAO keys)
3. `npx prisma migrate deploy` (apply migrations)
4. `pnpm dev` (start dev server)
5. `pnpm build && pnpm start` (production)
