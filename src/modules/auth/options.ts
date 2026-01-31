import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/db";
import { generateUniqueNickname } from "@/lib/nickname";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { nickname: true, role: true, isBlacklisted: true },
        });

        // 차단된 사용자는 세션 거부
        if (dbUser?.isBlacklisted) {
          // 세션 삭제
          await prisma.session.deleteMany({ where: { userId: user.id } });
          throw new Error("BLACKLISTED_USER");
        }

        session.user.nickname = dbUser?.nickname ?? null;
        session.user.role = dbUser?.role ?? "USER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
  events: {
    async createUser({ user }) {
      // 신규 가입시 랜덤 닉네임 설정
      const nickname = await generateUniqueNickname();
      await prisma.user.update({
        where: { id: user.id },
        data: { nickname },
      });
    },
  },
};
