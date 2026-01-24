# BothSides Repository Index

> Korean debate platform for binary-choice discussions (양자택일 토론 플랫폼)
> **94% token reduction optimized** - Use this index for codebase context

## Quick Reference

| Aspect | Value |
|--------|-------|
| Framework | Next.js 14.2.35 (App Router) |
| Language | TypeScript 5 (strict) |
| Database | PostgreSQL + Prisma 5.20 |
| Auth | NextAuth 4.24 + Google OAuth |
| UI | Tailwind CSS + Radix UI + Shadcn |
| Storage | Vercel Blob |
| State | SWR |

---

## Architecture Overview

```
src/
├── app/           # Next.js App Router (pages + API)
├── components/    # React components (ui/, layout/, topics/, debate/)
├── lib/           # Utilities (auth, db, errors, validation)
├── modules/       # Business logic (topics, opinions, votes, reactions, reports)
└── types/         # Type definitions
```

**Pattern**: Modular service layer with Zod validation schemas per domain

---

## Core Domains

### Topics (`src/modules/topics/`)
- Binary choice debates (Option A vs Option B)
- Categories: DAILY, POLITICS, SOCIAL, RELATIONSHIP, HISTORY, GAME, TECH
- Featured topics system with deadline support
- Service: `service.ts` | Schema: `schema.ts`

### Votes (`src/modules/votes/`)
- One vote per user per topic (unique constraint)
- Side enum: A | B
- Service: `service.ts` | Schema: `schema.ts`

### Opinions (`src/modules/opinions/`)
- Comments on topics with side affiliation
- Blinding mechanism (5+ reports threshold)
- Service: `service.ts` | Schema: `schema.ts`

### Reactions (`src/modules/reactions/`)
- Like/Dislike on opinions
- One reaction per user per opinion
- Service: `service.ts`

### Reports (`src/modules/reports/`)
- Content moderation system
- Status: PENDING → REVIEWED | DISMISSED
- Service: `service.ts`

---

## API Endpoints

### Topics
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/topics` | List with filters |
| POST | `/api/topics` | Create topic |
| GET | `/api/topics/[id]` | Get details |
| POST | `/api/topics/[id]/vote` | Submit vote |
| GET | `/api/topics/[id]/my-vote` | User's vote |
| GET | `/api/topics/[id]/vote-stats` | Statistics |
| GET | `/api/topics/[id]/opinions` | Topic opinions |

### Opinions & Moderation
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/opinions/[id]/reactions` | Add reaction |
| POST | `/api/opinions/[id]/reports` | Report opinion |
| GET | `/api/admin/reports` | List reports (admin) |
| POST | `/api/admin/topics/[id]/feature` | Toggle featured |

### Other
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/upload` | Image to Vercel Blob |
| * | `/api/auth/[...nextauth]` | Auth callbacks |
| GET | `/api/profile` | User profile |

---

## Database Schema

### Enums
```
Role: USER, ADMIN
Side: A, B
Category: DAILY, POLITICS, SOCIAL, RELATIONSHIP, HISTORY, GAME, TECH
ReactionType: LIKE, DISLIKE
ReportStatus: PENDING, REVIEWED, DISMISSED
```

### Models
| Model | Key Fields | Relations |
|-------|-----------|-----------|
| User | id, email, nickname, role | topics, votes, opinions, reactions, reports |
| Topic | title, optionA/B, category, authorId, isFeatured, deadline | author, votes, opinions |
| Vote | topicId, userId, side | topic, user |
| Opinion | topicId, userId, side, body, isBlinded | topic, user, reactions, reports |
| Reaction | opinionId, userId, type | opinion, user |
| Report | opinionId, userId, reason, status | opinion, user |

### Key Constraints
- `Vote`: unique(topicId, userId)
- `Reaction`: unique(opinionId, userId)
- `User`: unique(email), unique(nickname)

---

## Component Map

### Layout (`src/components/layout/`)
- `Header.tsx` - Navigation with auth
- `Footer.tsx` - Site footer
- `UserMenu.tsx` - Dropdown user menu

### Topics (`src/components/topics/`)
- `FeaturedSection.tsx` - Homepage featured
- `RecommendedSection.tsx` - Personalized
- `CommunitySection.tsx` - All topics
- `TopicCard.tsx` - Card display
- `TopicListItem.tsx` - List display
- `TopicList.tsx` - List container

### Debate (`src/components/debate/`)
- `VoteSection.tsx` - Voting UI
- `OpinionSection.tsx` - Comments

### UI (`src/components/ui/`)
Shadcn components: avatar, badge, button, card, dropdown-menu, input, label, select, tabs, textarea, horizontal-scroll
Custom: ImageUpload, ShareButton

---

## Pages

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Home (featured, recommended, community) |
| `/topics/[id]` | `app/topics/[id]/page.tsx` | Topic detail + voting |
| `/topics/new` | `app/topics/new/page.tsx` | Create topic |
| `/auth/signin` | `app/auth/signin/page.tsx` | Google OAuth |
| `/profile` | `app/profile/page.tsx` | User profile |
| `/admin/reports` | `app/admin/reports/page.tsx` | Report management |

---

## Key Libraries

### Auth (`src/lib/auth.ts`)
- `getSession()` - Current session
- `requireAuth()` - Auth guard
- `requireAdmin()` - Admin guard

### Database (`src/lib/db.ts`)
- Prisma client singleton

### Errors (`src/lib/errors.ts`)
- `UnauthorizedError`, `ForbiddenError`, `NotFoundError`

### Constants (`src/lib/constants.ts`)
- Category labels/colors, thresholds

### Validation (`src/lib/validation.ts`)
- Input sanitization helpers

### In-App Detection (`src/lib/inapp.ts`)
- KakaoTalk WebView detection for OAuth redirect

---

## SEO & Social

- Dynamic OG images: `app/topics/[id]/opengraph-image/route.tsx`
- Twitter cards: `app/topics/[id]/twitter-image/route.tsx`
- Sitemap: `app/sitemap.ts`
- Robots: `app/robots.ts`

---

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies & scripts |
| `tsconfig.json` | TypeScript (strict, @/* paths) |
| `tailwind.config.ts` | Tailwind + dark mode + Shadcn |
| `next.config.mjs` | Vercel Blob image domains |
| `prisma/schema.prisma` | Database schema |
| `components.json` | Shadcn/ui config |

---

## Environment Variables

```env
NEXT_PUBLIC_SITE_URL     # Application domain
NEXTAUTH_URL             # Auth callback URL
NEXTAUTH_SECRET          # Session encryption
GOOGLE_CLIENT_ID         # OAuth
GOOGLE_CLIENT_SECRET     # OAuth
DATABASE_URL             # PostgreSQL connection
DIRECT_URL               # Prisma direct connection
BLOB_READ_WRITE_TOKEN    # Vercel Blob storage
```

---

## Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm run start     # Production server
npm run lint      # ESLint
npx prisma studio # Database GUI
npx prisma migrate dev # Run migrations
```

---

## File Count Summary

| Directory | .ts | .tsx | Total |
|-----------|-----|------|-------|
| app/api | 13 | - | 13 |
| app (pages) | 2 | 15 | 17 |
| components | - | 27 | 27 |
| lib | 7 | - | 7 |
| modules | 9 | - | 9 |
| types | 1 | - | 1 |
| **Total** | **32** | **42** | **74** |

---

*Generated: 2026-01-24 | Version: 0.1.0*
