This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Auth (NextAuth + Google) 설정 체크

### 필수 환경 변수 (Vercel)
- `NEXTAUTH_URL`: 프로덕션 도메인 (예: `https://bothsides.club`)
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### Google Cloud Console (OAuth Client) Redirect URI
- 아래 Redirect URI가 **반드시** 등록되어 있어야 합니다.
  - `https://bothsides.club/api/auth/callback/google`
  - (도메인이 다르면 해당 도메인으로 교체)

### 참고: 카카오톡 인앱 브라우저에서 구글 로그인
- 카카오톡 인앱 브라우저(WebView)에서는 Google 정책(embedded webview)으로 인해 로그인이 **차단**될 수 있습니다.
- 이 프로젝트는 인앱 감지 시 외부 브라우저(Safari/Chrome)로 열도록 안내합니다.

### 이미지 업로드 설정 (Vercel Blob Storage)

이 프로젝트는 Vercel Blob Storage를 사용하여 이미지를 저장합니다.

#### Vercel 배포 시
1. Vercel 대시보드에서 프로젝트 설정으로 이동
2. **Storage** 탭에서 **Blob** 스토리지 생성
3. 자동으로 `BLOB_READ_WRITE_TOKEN` 환경 변수가 설정됩니다

#### 로컬 개발 시 (선택사항)
로컬에서 테스트하려면 `.env.local` 파일에 다음을 추가하세요:

```bash
BLOB_READ_WRITE_TOKEN=your_token_here
```

#### 토큰 확인 방법

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택
3. 상단 메뉴에서 **Storage** 탭 클릭
4. **Blob** 스토리지가 있다면 클릭, 없다면 **Create** 버튼으로 생성
5. Blob 스토리지 페이지에서 **Settings** 탭 클릭
6. **Token** 섹션에서 **Read and Write** 토큰 확인
   - 토큰 옆의 **Copy** 버튼을 클릭하여 복사
   - 또는 **Show** 버튼을 클릭하여 토큰 표시 후 복사

**참고**: 
- Vercel에 배포하면 자동으로 환경 변수가 설정되므로, 로컬 개발 시에만 필요합니다.
- 토큰은 민감한 정보이므로 `.env.local` 파일을 `.gitignore`에 포함시켜야 합니다.
