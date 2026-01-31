import { z } from "zod";
import { paginationSchema, nicknameSchema } from "@/lib/validation";

export const getUsersAdminSchema = paginationSchema.extend({
  search: z.string().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

export const updateUserNicknameAdminSchema = z.object({
  nickname: nicknameSchema,
});

export type GetUsersAdminInput = z.infer<typeof getUsersAdminSchema>;
export type UpdateUserNicknameAdminInput = z.infer<typeof updateUserNicknameAdminSchema>;
