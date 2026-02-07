# BothSides 문서

플랫폼의 주요 기능과 시스템에 대한 문서 모음입니다.

## 기능 문서

### [뱃지 시스템 (Badge System)](./features/badge-system.md)

사용자 활동 기반 게이미피케이션 시스템

- 14개 활동 기반 뱃지 (투표, 의견, 토론, 참여)
- 실시간 진행률 추적
- 토스증권 스타일의 그라데이션 디자인
- DB 스키마 변경 없는 구현

**핵심 파일:**
- `src/lib/badges.ts` - 뱃지 엔진
- `src/components/badges/` - UI 컴포넌트
- `src/app/profile/page.tsx` - 프로필 통합

---

## 문서 구조

```
docs/
├── README.md                    # 이 파일
├── features/                    # 기능별 상세 문서
│   └── badge-system.md
├── api/                         # API 문서 (향후)
├── architecture/                # 아키텍처 문서 (향후)
└── guides/                      # 개발 가이드 (향후)
```

## 기여

문서 개선 제안이나 오타 수정은 언제든 환영합니다.
