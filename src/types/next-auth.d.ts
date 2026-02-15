import { Role } from "@prisma/client";
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      nickname?: string | null;
      selectedBadgeId?: string | null;
      role: Role;
      isNewUser?: boolean;
    };
  }

  interface User {
    id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      nickname?: string | null;
      selectedBadgeId?: string | null;
      role: Role;
    }
  }

  declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nickname?: string | null;
    selectedBadgeId?: string | null;
    role: Role;
  }
}
