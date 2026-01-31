# BothSides

양자택일 토론 플랫폼 - 두 가지 선택지 중 하나를 고르고 의견을 나누는 서비스

## Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Kakao OAuth)
- **UI**: Tailwind CSS + Radix UI + Framer Motion
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
├── app/           # Next.js App Router pages
├── components/    # React components
├── lib/           # Utilities (auth, db, validation)
├── modules/       # Business logic (opinions, votes, reports)
└── types/         # TypeScript type definitions
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
