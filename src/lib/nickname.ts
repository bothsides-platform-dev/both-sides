import { prisma } from "@/lib/db";

// 한국어 형용사 목록
const ADJECTIVES = [
  "용감한",
  "지혜로운",
  "빛나는",
  "힘찬",
  "푸른",
  "붉은",
  "은빛",
  "금빛",
  "밝은",
  "고요한",
  "신비로운",
  "활기찬",
  "당당한",
  "씩씩한",
  "멋진",
  "귀여운",
  "재빠른",
  "강인한",
  "부드러운",
  "영리한",
  "날렵한",
  "우아한",
  "눈부신",
  "따뜻한",
  "시원한",
];

// 한국어 동물 목록
const ANIMALS = [
  "호랑이",
  "사자",
  "곰",
  "독수리",
  "늑대",
  "여우",
  "토끼",
  "고양이",
  "강아지",
  "판다",
  "코끼리",
  "기린",
  "펭귄",
  "돌고래",
  "고래",
  "부엉이",
  "참새",
  "까치",
  "다람쥐",
  "수달",
  "해달",
  "표범",
  "치타",
  "코알라",
  "캥거루",
];

/**
 * 랜덤 닉네임 생성
 * 형식: "형용사동물1234" (예: 용감한호랑이1234)
 */
export function generateRandomNickname(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const number = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `${adjective}${animal}${number}`;
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
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const timestamp = Date.now().toString().slice(-8);

  return `${adjective}${animal}${timestamp}`;
}
