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

토큰은 Vercel 대시보드의 Storage > Blob > Settings에서 확인할 수 있습니다.

**참고**: Vercel에 배포하면 자동으로 환경 변수가 설정되므로, 로컬 개발 시에만 필요합니다.
