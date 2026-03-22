# Community Trending Tab - Setup Guide

## Feature Overview

홈페이지의 CommunitySection에 **"인기글"** 탭이 추가되었습니다. 이 탭은 issue-auto-collector에서 수집한 7개 커뮤니티(DCinside, FM Korea, 뽐뿌, 루리웹, 더쿠, 인스티즈, 네이버카페)의 인기글을 실시간으로 보여줍니다.

## Implemented Files

### 1. Types (`src/types/community-trending.ts`)
- `CommunityTrendingPost` 인터페이스
- `SiteName` 타입
- `SITE_META` - 사이트별 표시 이름과 색상 정의

### 2. API Route (`src/app/api/community-trending/route.ts`)
- GitHub raw URL에서 `latest.json` fetch
- 30분 ISR 캐싱 (`revalidate: 1800`)
- 참여도 기준 정렬 (좋아요 > 조회수 > 댓글수)
- 상위 30개 게시글만 반환

### 3. UI Component (`src/components/community/CommunityTrendingList.tsx`)
- 사이트별 필터 칩 (전체/DCinside/FM Korea 등)
- 각 게시글 표시:
  - 사이트 뱃지 (색상 구분)
  - 제목 (외부 링크)
  - 본문 미리보기 (150자)
  - 통계 (조회수, 댓글수, 좋아요수)
  - 수집 시간
- 로딩 스켈레톤, 에러 핸들링

### 4. CommunitySection Update (`src/components/topics/CommunitySection.tsx`)
- `ContentType`에 `"trending"` 추가
- 탭 목록에 "인기글" 추가
- 조건부 렌더링 (trending 탭 선택 시 CommunityTrendingList 표시)

## Required Setup

### ⚠️ IMPORTANT: Repository Access

현재 `bothsides-platform-dev/issue-auto-collector` 레포지토리가 **private**이므로, GitHub raw URL 접근을 위해 다음 중 하나를 선택해야 합니다:

#### Option 1: Make Repository Public (권장)
```bash
# GitHub에서 Repository Settings > Danger Zone > Change visibility > Public으로 변경
```

**장점**: 추가 설정 불필요, 빠른 응답
**단점**: 레포지토리가 공개됨

#### Option 2: Use GitHub Token (Private 유지)
```bash
# GitHub Personal Access Token 생성 (repo 권한 필요)
# https://github.com/settings/tokens
```

**Vercel 환경변수 추가**:
```
GITHUB_TOKEN=ghp_your_token_here
```

**장점**: 레포지토리 비공개 유지
**단점**: 토큰 관리 필요, rate limit 고려

#### Option 3: Alternative Data Source
issue-auto-collector를 Vercel/Netlify에 배포하고 API endpoint로 제공:
```bash
# issue-auto-collector에 API route 추가
# GET /api/latest → latest.json 반환
```

## Testing

### Local Development
1. 레포지토리 접근 설정 완료 후:
```bash
cd /Users/yeonseong/project/both-sides
pnpm run dev
```

2. http://localhost:3000 접속
3. 홈페이지 > CommunitySection > **"인기글"** 탭 클릭
4. 커뮤니티 인기글 목록 확인

### API Endpoint Test
```bash
# 로컬
curl http://localhost:3000/api/community-trending

# 프로덕션 (배포 후)
curl https://bothsides.app/api/community-trending
```

예상 응답:
```json
{
  "data": {
    "posts": [
      {
        "id": "...",
        "title": "게시글 제목",
        "sourceUrl": "https://...",
        "sourceSite": "dcinside",
        "viewCount": 1234,
        "commentCount": 56,
        "likeCount": 78,
        "collectedAt": "2026-03-22T06:53:24.834Z"
      }
    ],
    "collectedAt": "2026-03-22T06:53:24.834Z"
  }
}
```

## Deployment

### Vercel 배포 전 체크리스트
- [ ] `pnpm install` 실행하여 lockfile 업데이트 (완료)
- [ ] `pnpm run build` 성공 확인 (완료)
- [ ] issue-auto-collector 레포지토리 접근 방식 결정 (Option 1/2/3)
- [ ] Option 2 선택 시: Vercel 환경변수에 `GITHUB_TOKEN` 추가
- [ ] git commit & push

### Build 확인
```bash
cd /Users/yeonseong/project/both-sides
pnpm run build
```

빌드가 성공하면 다음과 같이 표시됩니다:
```
✓ Generating static pages using 7 workers (54/54)
ƒ  (Dynamic)  server-rendered on demand
  /api/community-trending
```

## Features

### 사이트별 필터링
- 전체: 모든 커뮤니티 게시글 혼합 표시
- DCinside, FM Korea, 뽐뿌, 루리웹, 더쿠, 인스티즈, 네이버카페: 각 사이트별 필터

### 정렬 알고리즘
```typescript
score = (likeCount * 10) + (viewCount / 100) + commentCount
```
좋아요를 가장 높게 평가하고, 조회수와 댓글수를 보조 지표로 사용합니다.

### 캐싱 전략
- **Server (ISR)**: 30분 (`revalidate: 1800`)
- **Client (SWR)**: 5분 (`dedupingInterval: 300000`)
- issue-auto-collector는 6시간마다 수집하므로 적절한 캐싱 간격

## Troubleshooting

### API 오류: "Failed to fetch community trending posts"
**원인**: GitHub raw URL 접근 실패 (404 또는 403)
**해결**: 
- Repository를 public으로 변경
- 또는 `GITHUB_TOKEN` 환경변수 설정

### 빌드 오류: "Module not found"
**원인**: node_modules 미설치
**해결**:
```bash
pnpm install
```

### 데이터가 표시되지 않음
**원인**: issue-auto-collector가 아직 데이터를 수집하지 않았거나 latest.json이 없음
**해결**:
```bash
cd /Users/yeonseong/project/issue-auto-collector
pnpm run collect
git add data/
git commit -m "Initial data collection"
git push
```

## Next Steps

1. **Repository 접근 설정** (Option 1, 2, 또는 3 중 선택)
2. **로컬 테스트** (dev server 실행 후 확인)
3. **Vercel 배포**
   ```bash
   git add .
   git commit -m "feat: Add community trending tab with 7 Korean communities"
   git push
   ```
4. **프로덕션 테스트** (배포 후 https://bothsides.app 확인)

## Design

### 사이트별 색상
- **DCinside**: 파랑 (`blue`)
- **FM Korea**: 초록 (`green`)
- **뽐뿌**: 주황 (`orange`)
- **루리웹**: 보라 (`purple`)
- **더쿠**: 핑크 (`pink`)
- **인스티즈**: 청록 (`teal`)
- **네이버카페**: 에메랄드 (`emerald`)

### 반응형 디자인
- 모바일: 통계 일부 숨김, 시간은 모바일에서 숨김
- 태블릿/데스크톱: 모든 정보 표시
- 사이트 필터 칩: 가로 스크롤 지원

## Maintenance

### 새 커뮤니티 추가
1. issue-auto-collector에 새 스크래퍼 추가
2. `src/types/community-trending.ts`의 `SiteName`과 `SITE_META`에 추가
3. 배포

### 정렬 알고리즘 조정
`src/app/api/community-trending/route.ts`의 정렬 로직 수정:
```typescript
const scoreA = (a.likeCount || 0) * 10 + (a.viewCount || 0) / 100 + (a.commentCount || 0);
```

### 캐싱 시간 조정
- Server: `route.ts`의 `revalidate` 값
- Client: `CommunityTrendingList.tsx`의 `dedupingInterval` 값
