# BothSides Repository Index

> Korean debate platform for binary-choice discussions (양자택일 토론 플랫폼)
> **94% token reduction optimized** - Use this index for codebase context

## Quick Reference

| Aspect | Value |
|--------|-------|
| Framework | Next.js 14.2.35 (App Router) |
| Language | TypeScript 5 (strict) |
| Database | PostgreSQL + Prisma 6.19.2 |
| Auth | NextAuth 4.24 + Google OAuth |
| UI | Tailwind CSS 3.4 + Radix UI + Shadcn |
| Storage | Vercel Blob 2.0 |
| State | SWR 2.3.8 |
| Validation | Zod 4.3.5 |
| Package Manager | pnpm |

---

## Architecture Overview

```
src/
├── app/           # Next.js App Router (55 files: pages + API)
├── components/    # React components (49 files)
│   ├── admin/     # Admin dashboard components
│   ├── debate/    # Opinion, voting, moderation UI
│   ├── layout/    # Header, Footer, UserMenu
│   ├── providers/ # Context providers (Session, SWR, Kakao)
│   ├── topics/    # Topic display components
│   └── ui/        # Shadcn/Radix base components
├── hooks/         # Custom React hooks
├── lib/           # Utilities (9 files)
├── modules/       # Business logic (11 files: 6 domains)
└── types/         # Type definitions (3 files)
```

**Pattern**: Modular service layer with Zod validation schemas per domain

---

## Core Domains

### Topics (`src/modules/topics/`)
- Binary choice debates (Option A vs Option B)
- Categories: DAILY, POLITICS, SOCIAL, RELATIONSHIP, HISTORY, GAME, TECH
- Featured topics system with deadline support
- Anonymous posting option
- View count tracking
- Service: `service.ts` | Schema: `schema.ts`

### Votes (`src/modules/votes/`)
- One vote per user per topic (unique constraint)
- Guest voting support (visitorId + IP)
- Side enum: A | B
- Service: `service.ts` | Schema: `schema.ts`

### Opinions (`src/modules/opinions/`)
- Comments on topics with side affiliation
- Threaded replies via parentId self-reference
- Anonymous posting option
- Blinding mechanism (3+ reports threshold)
- Service: `service.ts` | Schema: `schema.ts`

### Reactions (`src/modules/reactions/`)
- Like/Dislike on opinions
- Guest reaction support
- Toggle behavior (same type = remove)
- Service: `service.ts`

### Reports (`src/modules/reports/`)
- Content moderation system
- Status: PENDING → REVIEWED | DISMISSED
- Auto-blind at 3 reports
- Service: `service.ts`

### Feedback (`src/modules/feedback/`)
- User support tickets
- Categories: BUG, SUGGESTION, QUESTION, OTHER
- Status: PENDING → REVIEWED → RESOLVED
- Anonymous submission support
- Service: `service.ts` | Schema: `schema.ts`

---

## API Endpoints (30 routes)

### Topics
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/topics` | List with filters/pagination |
| POST | `/api/topics` | Create topic (auth required) |
| GET | `/api/topics/[id]` | Get topic details |
| POST | `/api/topics/[id]/vote` | Submit/update vote |
| GET | `/api/topics/[id]/my-vote` | User's current vote |
| GET | `/api/topics/[id]/vote-stats` | Vote statistics |
| GET | `/api/topics/[id]/vote-info` | Detailed vote info |
| GET | `/api/topics/[id]/opinions` | List opinions |
| POST | `/api/topics/[id]/opinions` | Create opinion (requires vote) |
| POST | `/api/topics/[id]/view` | Track view |
| POST | `/api/topics/[id]/anonymity` | Toggle anonymity |

### Opinions
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST | `/api/opinions/[id]/reactions` | Toggle like/dislike |
| POST | `/api/opinions/[id]/replies` | Create reply |
| POST | `/api/opinions/[id]/reports` | Report opinion |
| POST | `/api/opinions/[id]/anonymity` | Toggle anonymity |

### Admin
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET/POST | `/api/admin/topics` | Manage topics |
| PATCH | `/api/admin/topics/[id]` | Edit topic |
| PATCH | `/api/admin/topics/[id]/hide` | Hide/show topic |
| PATCH | `/api/admin/topics/[id]/feature` | Feature/unfeature |
| PATCH | `/api/admin/topics/[id]/anonymity` | Force anonymity |
| GET/POST | `/api/admin/opinions` | Manage opinions |
| PATCH | `/api/admin/opinions/[id]` | Edit opinion |
| PATCH | `/api/admin/opinions/[id]/anonymity` | Force anonymity |
| GET | `/api/admin/reports` | List reports |
| PATCH | `/api/admin/reports/[id]` | Update report status |
| GET/POST | `/api/admin/feedback` | Manage feedback |
| GET | `/api/admin/feedback/stats` | Feedback statistics |

### Other
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/upload` | Image to Vercel Blob |
| * | `/api/auth/[...nextauth]` | Auth callbacks |
| GET | `/api/profile` | User profile |
| GET | `/api/users/[id]` | Public user profile |
| POST | `/api/feedback` | Submit feedback |

---

## Database Schema

### Enums
```
Role: USER, ADMIN
Side: A, B
Category: DAILY, POLITICS, SOCIAL, RELATIONSHIP, HISTORY, GAME, TECH
ReactionType: LIKE, DISLIKE
ReportStatus: PENDING, REVIEWED, DISMISSED
FeedbackCategory: BUG, SUGGESTION, QUESTION, OTHER
FeedbackStatus: PENDING, REVIEWED, RESOLVED
```

### Models (9 total)
| Model | Key Fields | Relations |
|-------|-----------|-----------|
| User | id, email, nickname, role | topics, votes, opinions, reactions, reports, feedbacks |
| Topic | title, optionA/B, category, authorId, isFeatured, isHidden, isAnonymous, deadline, viewCount | author, votes, opinions, views |
| TopicView | topicId, visitorId | topic |
| Vote | topicId, userId/visitorId, side | topic, user |
| Opinion | topicId, userId, side, body, isBlinded, isAnonymous, parentId | topic, user, parent, replies, reactions, reports |
| Reaction | opinionId, userId/visitorId, type | opinion, user |
| Report | opinionId, userId, reason, status | opinion, user |
| Feedback | category, content, email, userId, status, adminNote | user |
| Account/Session | NextAuth managed | user |

### Key Constraints
- `Vote`: unique(topicId, userId), unique(topicId, visitorId, ipAddress)
- `Reaction`: unique(opinionId, userId), unique(opinionId, visitorId, ipAddress)
- `TopicView`: unique(topicId, visitorId)
- `User`: unique(email), unique(nickname)

---

## Component Map

### Layout (`src/components/layout/`)
- `Header.tsx` - Navigation with auth state
- `Footer.tsx` - Site footer with links
- `UserMenu.tsx` - Dropdown user menu

### Providers (`src/components/providers/`)
- `SessionProvider.tsx` - NextAuth session wrapper
- `SWRProvider.tsx` - SWR configuration
- `KakaoProvider.tsx` - Kakao SDK initialization

### Topics (`src/components/topics/`)
- `FeaturedSection.tsx` - Homepage featured carousel
- `RecommendedSection.tsx` - Popular topics
- `CommunitySection.tsx` - All topics grid
- `TopicCard.tsx` - Card display
- `FeaturedTopicCard.tsx` - Enhanced featured card
- `TopicListItem.tsx` - List display
- `TopicList.tsx` - Paginated list container
- `TopicShareButton.tsx` - Kakao share
- `TopicAuthorSection.tsx` - Author info
- `ViewCountTracker.tsx` - Client-side view tracking

### Debate (`src/components/debate/`)
- `VoteSection.tsx` - A vs B voting UI with stats
- `OpinionSection.tsx` - Main opinions container
- `OpinionList.tsx` - Paginated opinion list
- `OpinionColumn.tsx` - Side-specific column
- `OpinionItem.tsx` - Single opinion with reactions
- `OpinionThread.tsx` - Opinion + replies
- `ReplyForm.tsx` - Add reply form
- `ReportDialog.tsx` - Report modal
- `MobileSideTabs.tsx` - Mobile A/B tab switcher

### Admin (`src/components/admin/`)
- `AdminDashboard.tsx` - Stats overview
- `AdminTopics.tsx` - Topic management
- `TopicTable.tsx` - Sortable topic table
- `OpinionTable.tsx` - Opinion management
- `StatsCard.tsx` - Stat display card

### UI (`src/components/ui/`)
Shadcn components: avatar, badge, button, card, checkbox, dialog, dropdown-menu, input, label, select, tabs, textarea, horizontal-scroll
Custom: ImageUpload, ShareButton

### Other
- `ErrorBoundary.tsx` - Error fallback UI
- `ProfileEditForm.tsx` - Profile edit form
- `InAppBrowserRedirect.tsx` - KakaoTalk redirect

---

## Pages (14 routes)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Home (featured, recommended, community) |
| `/topics/[id]` | `app/topics/[id]/page.tsx` | Topic detail + voting + opinions |
| `/topics/new` | `app/topics/new/page.tsx` | Create topic (auth) |
| `/auth/signin` | `app/auth/signin/page.tsx` | Google OAuth |
| `/auth/error` | `app/auth/error/page.tsx` | Auth error display |
| `/profile` | `app/profile/page.tsx` | Edit user profile (auth) |
| `/users/[id]` | `app/users/[id]/page.tsx` | Public user profile |
| `/feedback` | `app/feedback/page.tsx` | Submit feedback |
| `/admin` | `app/admin/page.tsx` | Admin dashboard (admin) |
| `/admin/topics` | `app/admin/topics/page.tsx` | Topic management |
| `/admin/topics/[id]/edit` | `app/admin/topics/[id]/edit/page.tsx` | Edit topic |
| `/admin/opinions` | `app/admin/opinions/page.tsx` | Opinion management |
| `/admin/reports` | `app/admin/reports/page.tsx` | Report review |
| `/admin/feedback` | `app/admin/feedback/page.tsx` | Feedback management |

---

## Key Libraries

### Auth (`src/lib/auth.ts`)
- `getSession()` - Current session
- `requireAuth()` - Auth guard (throws UnauthorizedError)
- `requireAdmin()` - Admin guard (throws ForbiddenError)

### Database (`src/lib/db.ts`)
- Prisma client singleton with dev-mode query logging

### Errors (`src/lib/errors.ts`)
- `AppError` - Base error class
- `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409)
- `handleApiError()` - Error to Response converter

### Utils (`src/lib/utils.ts`)
- `cn()` - clsx + tailwind-merge
- `formatDate()` - Korean locale datetime
- `formatRelativeTime()` - "방금 전", "5분 전"
- `formatDDay()` - D-Day countdown
- `formatNumber()` - 1K notation

### Constants (`src/lib/constants.ts`)
- `CATEGORY_LABELS` - Category display names
- `SIDE_COLORS` - A/B color themes
- `BLIND_THRESHOLD` = 3
- `DEFAULT_PAGE_SIZE` = 20

### Validation (`src/lib/validation.ts`)
- `validateRequest(schema, data)` - Zod validation
- Common schemas: sideSchema, paginationSchema, idSchema, nicknameSchema

### Visitor (`src/lib/visitor.ts`)
- `getOrCreateVisitorId()` - Anonymous UUID in cookies
- `getIpAddress()` - Extract from headers
- `setVisitorIdCookie()` - Set httpOnly cookie

### In-App Detection (`src/lib/inapp.ts`)
- `isKakaoInAppBrowser()` - KakaoTalk WebView detection
- `buildChromeIntentUrl()` - Android intent URI

### Fetcher (`src/lib/fetcher.ts`)
- SWR fetcher for client-side data fetching

---

## Hooks

### `useSwipeableTabs` (`src/hooks/useSwipeableTabs.ts`)
- Swipe gesture for mobile tab switching

---

## SEO & Social

- Dynamic OG images: `app/topics/[id]/opengraph-image/route.tsx`
- Twitter cards: `app/topics/[id]/twitter-image/route.tsx`
- Default OG: `app/og-default.png/route.tsx`
- Sitemap: `app/sitemap.ts`
- Robots: `app/robots.ts`

---

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies & scripts (pnpm) |
| `tsconfig.json` | TypeScript (strict, @/* paths) |
| `tailwind.config.ts` | Tailwind + dark mode (class) + Shadcn + animations |
| `next.config.mjs` | Vercel Blob image domains, lucide-react optimization |
| `prisma/schema.prisma` | Database schema (9 models, 7 enums) |
| `components.json` | Shadcn/ui config |
| `postcss.config.mjs` | PostCSS + Tailwind |
| `.eslintrc.json` | ESLint config |

---

## Environment Variables

```env
# Application
NEXT_PUBLIC_SITE_URL      # Site domain (defaults to bothsides.club)
NEXT_PUBLIC_KAKAO_JS_KEY  # Kakao SDK API key

# Authentication
NEXTAUTH_URL              # OAuth callback URL
NEXTAUTH_SECRET           # Session encryption
GOOGLE_CLIENT_ID          # Google OAuth
GOOGLE_CLIENT_SECRET      # Google OAuth
KAKAO_CLIENT_ID           # Kakao OAuth (if used)
KAKAO_CLIENT_SECRET       # Kakao OAuth (if used)

# Database
DATABASE_URL              # PostgreSQL connection (pooled)
DIRECT_URL                # Prisma direct connection

# Storage
BLOB_READ_WRITE_TOKEN     # Vercel Blob storage
```

---

## Commands

```bash
pnpm dev              # Development server
pnpm build            # Production build
pnpm start            # Production server
pnpm lint             # ESLint
pnpm postinstall      # Prisma generate (auto-runs)

npx prisma studio     # Database GUI
npx prisma migrate dev # Run migrations
npx prisma generate   # Generate client
```

---

## File Count Summary

| Directory | .ts | .tsx | Total |
|-----------|-----|------|-------|
| app/api | 29 | 2 | 31 |
| app (pages) | 2 | 13 | 15 |
| components | 1 | 48 | 49 |
| hooks | 1 | - | 1 |
| lib | 9 | - | 9 |
| modules | 11 | - | 11 |
| types | 3 | - | 3 |
| **Total** | **56** | **63** | **119** |

---

## Key Patterns

### Guest Support
- Votes and reactions work without authentication
- Uses `visitorId` (UUID cookie) + `ipAddress` for uniqueness
- Opinions require authentication

### Content Moderation
- Users can report opinions
- 3+ reports auto-blind the opinion
- Admin can review and dismiss/confirm reports

### Anonymous Posting
- Topics and opinions can be marked anonymous
- Owner can toggle, admin can force

### Threaded Discussions
- Opinions can have replies via `parentId`
- Self-referential relation in Opinion model

---

*Generated: 2026-01-31 | Version: 0.1.0*
