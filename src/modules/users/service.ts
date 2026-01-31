import { prisma } from "@/lib/db";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { containsProfanity } from "@/lib/profanity";
import type { GetUsersAdminInput } from "./schema";

export async function getUsersForAdmin(input: GetUsersAdminInput) {
  const { page, limit, search, role } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (role) {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { nickname: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        nickname: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            topics: true,
            opinions: true,
            votes: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateUserNicknameByAdmin(userId: string, nickname: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError("사용자를 찾을 수 없습니다.");
  }

  if (containsProfanity(nickname)) {
    throw new ValidationError("닉네임에 부적절한 단어가 포함되어 있습니다.");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      nickname,
      NOT: { id: userId },
    },
  });

  if (existingUser) {
    throw new ConflictError("이미 사용 중인 닉네임입니다.");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { nickname },
    select: {
      id: true,
      nickname: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          topics: true,
          opinions: true,
          votes: true,
        },
      },
    },
  });
}
