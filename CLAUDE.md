# BothSides Project

양자택일 토론 플랫폼

## Tech Stack
- Next.js 14.2 (App Router)
- TypeScript
- Prisma + PostgreSQL
- NextAuth.js (Kakao OAuth)
- Tailwind CSS + Radix UI
- Vercel (Hosting + Blob Storage)
- pnpm (package manager)

## Key Configuration

### Kakao Share Setup
카카오톡 공유 기능 사용을 위해 필요한 설정:
1. **환경변수**: `NEXT_PUBLIC_KAKAO_JS_KEY` (Vercel에도 설정 필요)
2. **Kakao Developers Console**: 플랫폼 > Web에서 사이트 도메인 등록 필요

### Vercel Deployment
- `pnpm-lock.yaml`이 `package.json`과 동기화되어야 함
- CI 환경에서는 `--frozen-lockfile`이 기본값
- 의존성 변경 후 반드시 `pnpm install` 실행하여 lockfile 갱신

### Environment Variables (Vercel)
- `DATABASE_URL` - PostgreSQL connection string (pooled)
- `DIRECT_URL` - PostgreSQL direct connection
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_KAKAO_JS_KEY`
- `KAKAO_CLIENT_ID`
- `KAKAO_CLIENT_SECRET`
- `BLOB_READ_WRITE_TOKEN`

## Project Structure
```
src/
├── app/           # Next.js App Router pages
├── components/    # React components
├── lib/           # Utilities (auth, db, validation)
├── modules/       # Business logic (opinions, votes, reports)
└── types/         # TypeScript type definitions
```

## Common Issues
- **Vercel build fails with `ERR_PNPM_OUTDATED_LOCKFILE`**: Run `pnpm install` locally and commit the updated lockfile

## Workflow
- **작업 완료시 반드시 commit and push 수행**
