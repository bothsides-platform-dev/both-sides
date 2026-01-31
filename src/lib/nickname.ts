import { prisma } from "@/lib/db";
import randomNameGenerator from "korean-random-names-generator";

/**
 * 랜덤 닉네임 생성
 * 형식: "관형사 동물" (예: 똑똑한 호랑이)
 * 중복 방지를 위해 4자리 숫자 추가
 */
export function generateRandomNickname(): string {
  const baseName = randomNameGenerator();
  const number = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  // 공백 제거하고 숫자 추가
  return `${baseName.replace(" ", "")}${number}`;
}

/**
 * 중복되지 않는 고유한 랜덤 닉네임 생성
 * 최대 10회 시도 후 실패시 타임스탬프 기반 닉네임 반환
 */
export async function generateUniqueNickname(): Promise<string> {
  const MAX_ATTEMPTS = 10;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const nickname = generateRandomNickname();
    const existing = await prisma.user.findUnique({
      where: { nickname },
      select: { id: true },
    });

    if (!existing) {
      return nickname;
    }
  }

  // 최대 시도 횟수 초과시 타임스탬프 기반 닉네임 생성
  const baseName = randomNameGenerator().replace(" ", "");
  const timestamp = Date.now().toString().slice(-8);

  return `${baseName}${timestamp}`;
}
