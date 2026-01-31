import { z } from "zod";
import { paginationSchema, nicknameSchema } from "@/lib/validation";

export const getUsersAdminSchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  isBlacklisted: z.coerce.boolean().optional(),
});

export const updateUserNicknameAdminSchema = z.object({
  nickname: nicknameSchema,
});

export const blacklistUserSchema = z.object({
  reason: z.string().min(1, "차단 사유를 입력해주세요.").max(500),
});

export type GetUsersAdminInput = z.infer<typeof getUsersAdminSchema>;
export type UpdateUserNicknameAdminInput = z.infer<typeof updateUserNicknameAdminSchema>;
export type BlacklistUserInput = z.infer<typeof blacklistUserSchema>;
