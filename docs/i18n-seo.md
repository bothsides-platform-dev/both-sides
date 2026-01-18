# ko+en i18n SEO 설계 (BothSides)

## 목표
- **URL 기준으로 언어 버전을 명확히 분리**해서 검색엔진이 중복/대체 관계를 정확히 이해하게 하기
- 각 언어 페이지에 **canonical + hreflang**를 올바르게 부여
- `sitemap.xml`, `robots.txt`도 언어 구조에 맞춰 확장 가능하게 하기

## 추천 URL 전략: Subpath (서브패스)
- 한국어: `/ko/...`
- 영어: `/en/...`

### 이유
- 운영/배포/캐시/로그/권한 정책이 단순함
- hreflang, canonical 관리가 직관적
- 도메인 하나로 브랜드/링크 신호 집중

## 라우팅/번역 구현 옵션

### 옵션 A (권장): `next-intl` + `middleware.ts`
- `/ko`, `/en` prefix 강제
- locale에 맞는 메시지 파일 로딩
- 서버 컴포넌트/클라이언트 컴포넌트 모두에서 번역 처리 일관성 확보

### 옵션 B: 커스텀 `middleware.ts` (prefix만 처리)
- 번역 로딩/타입/빌드 파이프라인을 자체 구현
- 초기 도입은 가볍지만, 유지보수 난이도가 더 올라갈 수 있음

## hreflang / canonical 적용 원칙

### 1) `html lang`
- `/ko/*`에서는 `lang="ko"`
- `/en/*`에서는 `lang="en"`

### 2) canonical
- `/ko/topics/{id}`의 canonical은 자기 자신
- `/en/topics/{id}`의 canonical도 자기 자신
- (중요) 한 언어가 다른 언어의 canonical이 되면, 다른 언어 페이지가 색인에서 약해질 수 있음

### 3) hreflang
각 페이지는 서로를 대체 언어로 연결:
- `hreflang="ko"` → `/ko/...`
- `hreflang="en"` → `/en/...`
- `hreflang="x-default"` → 기본 언어(보통 `/ko/...` 또는 언어 선택 랜딩)

## Next.js(App Router)에서 적용 포인트

### `generateMetadata()`에서 alternates.languages 사용
locale 라우팅이 준비되면, 페이지별 메타에 아래를 추가:
- `alternates.languages: { ko: '.../ko/..', en: '.../en/..', 'x-default': '.../ko/..' }`

### sitemap 확장
현재 `src/app/sitemap.ts`는 `/topics/{id}`만 생성합니다.
i18n 도입 후에는 다음 중 하나로 확장:
- **단일 sitemap에 ko/en URL을 모두 포함**
- 또는 `sitemap index`를 두고 `/sitemap-ko.xml`, `/sitemap-en.xml`로 분리(규모가 커질 때 권장)

### robots 확장
현재 `src/app/robots.ts`의 `sitemap`은 `/sitemap.xml` 하나입니다.
i18n 도입 후에도 단일 sitemap이면 유지 가능하고, 분리하면 sitemap index를 선언하는 방향을 권장합니다.

## 인덱싱 정책(현재 서비스 기준)
- **Index**: 토픽 상세(`/topics/[id]`) 및 공개 랜딩
- **Noindex**: `/admin/*`, `/auth/*`, `/profile`, `/topics/new`, `/api/*`


