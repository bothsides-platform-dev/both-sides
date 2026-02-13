# BothSides

양자택일 토론 플랫폼 — 두 가지 선택지 중 하나를 고르고 의견을 나누는 서비스

> https://bothsides.club

## Features

- **토론 생성 & 투표** — A vs B 양자택일 토론 생성, 회원/비회원 모두 투표 가능
- **의견 시스템** — 대댓글 지원, 좋아요/싫어요 리액션, 익명 모드
- **카테고리** — 일상, 정치, 사회, 연애/관계, 역사, 게임, 기술 (7개)
- **뱃지 시스템** — 14개 활동 뱃지, 5개 카테고리(투표/의견/토론/참여/종합), 실시간 진행률 추적
- **알림** — 댓글 알림으로 토론 참여 유도
- **관리자 대시보드** — 토론/의견/유저/신고/피드백 통합 관리
- **카카오 로그인 & 공유** — Kakao OAuth 소셜 로그인 + 카카오톡 공유
- **SEO** — 동적 사이트맵, OpenGraph 메타태그, 구조화된 데이터

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Kakao OAuth)
- **UI**: Tailwind CSS + Radix UI + Framer Motion
- **Data Fetching**: SWR
- **Validation**: Zod
- **Rate Limiting**: Upstash
- **Hosting**: Vercel (+ Blob Storage)
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma db push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── admin/            # Admin dashboard
│   ├── api/              # RESTful API endpoints
│   │   ├── topics/       # Topic CRUD, voting
│   │   ├── opinions/     # Opinion CRUD, reactions
│   │   ├── notifications/# Notification endpoints
│   │   ├── feedback/     # User feedback
│   │   └── ...           # auth, admin, users, upload, trends
│   ├── auth/             # Authentication pages
│   ├── explore/          # Explore & search
│   ├── topics/           # Topic detail pages
│   ├── profile/          # User profile
│   └── notifications/    # Notification page
├── components/           # React components
│   ├── ui/               # Radix UI primitives (25개)
│   ├── badges/           # Badge system
│   ├── debate/           # Debate/voting UI
│   ├── layout/           # Header, Sidebar, Footer
│   ├── topics/           # Topic cards, lists
│   ├── admin/            # Admin dashboard components
│   ├── feedback/         # Feedback FAB
│   └── notifications/    # Notification components
├── lib/                  # Utilities
│   ├── auth.ts           # NextAuth configuration
│   ├── badges.ts         # Badge definitions & calculation
│   ├── constants.ts      # Categories, labels, enums
│   ├── validation.ts     # Input validation
│   ├── profanity.ts      # Profanity filtering
│   └── ...               # db, cache, analytics, utils
├── modules/              # Business logic services
│   ├── opinions/         # Opinion CRUD & reactions
│   ├── topics/           # Topic CRUD & voting
│   ├── votes/            # Vote management
│   ├── notifications/    # Notification system
│   ├── reports/          # Report handling
│   ├── feedback/         # Feedback management
│   ├── trends/           # Trending topics
│   └── users/            # User management
└── types/                # TypeScript definitions
```

## Environment Variables

### Required for Vercel Deployment

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (pooled) |
| `DIRECT_URL` | PostgreSQL direct connection |
| `NEXTAUTH_SECRET` | NextAuth secret key |
| `NEXTAUTH_URL` | Production URL (e.g., `https://bothsides.club`) |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | Kakao JavaScript SDK key |
| `KAKAO_CLIENT_ID` | Kakao OAuth client ID |
| `KAKAO_CLIENT_SECRET` | Kakao OAuth client secret |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage token |

## Configuration

### Kakao Login Setup

1. [Kakao Developers Console](https://developers.kakao.com/)에서 앱 생성
2. 카카오 로그인 활성화
3. Redirect URI 등록: `https://your-domain.com/api/auth/callback/kakao`
4. 동의 항목에서 닉네임, 프로필 이미지 설정

### Kakao Share Setup

카카오톡 공유 기능 사용을 위해:
1. `NEXT_PUBLIC_KAKAO_JS_KEY` 환경변수 설정
2. Kakao Developers Console > 플랫폼 > Web에서 사이트 도메인 등록

### Vercel Blob Storage

이미지 업로드용 스토리지:
1. Vercel 대시보드 > Storage > Blob 생성
2. `BLOB_READ_WRITE_TOKEN` 자동 설정됨
3. 로컬 개발 시 토큰을 `.env.local`에 추가

## Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Deployment

Vercel에 배포:

```bash
# Vercel CLI 사용
vercel

# 또는 GitHub 연동 후 자동 배포
```

### Troubleshooting

**`ERR_PNPM_OUTDATED_LOCKFILE` 오류 시:**
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "chore: update lockfile"
```

## License

Private - All rights reserved
