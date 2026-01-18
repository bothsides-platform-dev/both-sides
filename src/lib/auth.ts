import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/options";
import { UnauthorizedError, ForbiddenError } from "@/lib/errors";

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

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new ForbiddenError("관리자 권한이 필요합니다.");
  }
  return user;
}
