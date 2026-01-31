import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/options";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";
import { prisma } from "@/lib/db";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new UnauthorizedError();
  }
  return session.user;
}

/**
 * 인증 + Blacklist 체크
 * 중요한 쓰기 작업에서 사용
 */
export async function requireAuthStrict() {
  const user = await requireAuth();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { isBlacklisted: true },
  });

  if (dbUser?.isBlacklisted) {
    throw new ForbiddenError("차단된 사용자입니다.");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new ForbiddenError("관리자 권한이 필요합니다.");
  }
  return user;
}
