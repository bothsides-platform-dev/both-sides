import { prisma } from "@/lib/db";
import { NotFoundError, ConflictError, ValidationError } from "@/lib/errors";
import { containsProfanity } from "@/lib/profanity";
import type { GetUsersAdminInput } from "./schema";

const userSelectFields = {
  id: true,
  nickname: true,
  name: true,
  email: true,
  role: true,
  isBlacklisted: true,
  blacklistedAt: true,
  blacklistReason: true,
  createdAt: true,
  _count: {
    select: {
      topics: true,
      opinions: true,
      votes: true,
    },
  },
};

export async function getUsersForAdmin(input: GetUsersAdminInput) {
  const { page, limit, search, role, isBlacklisted } = input;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (role) {
    where.role = role;
  }

  if (isBlacklisted !== undefined) {
    where.isBlacklisted = isBlacklisted;
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
      select: userSelectFields,
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
    select: userSelectFields,
  });
}

export async function blacklistUser(userId: string, reason: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError("사용자를 찾을 수 없습니다.");
  }

  if (user.role === "ADMIN") {
    throw new ValidationError("관리자는 차단할 수 없습니다.");
  }

  if (user.isBlacklisted) {
    throw new ConflictError("이미 차단된 사용자입니다.");
  }

  // 차단 시 해당 사용자의 세션도 삭제
  await prisma.session.deleteMany({ where: { userId } });

  return prisma.user.update({
    where: { id: userId },
    data: {
      isBlacklisted: true,
      blacklistedAt: new Date(),
      blacklistReason: reason,
    },
    select: userSelectFields,
  });
}

export async function unblacklistUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError("사용자를 찾을 수 없습니다.");
  }

  if (!user.isBlacklisted) {
    throw new ConflictError("차단되지 않은 사용자입니다.");
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      isBlacklisted: false,
      blacklistedAt: null,
      blacklistReason: null,
    },
    select: userSelectFields,
  });
}
