import { z } from "zod";
import { ValidationError } from "@/lib/errors";

export async function validateRequest<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): Promise<z.infer<T>> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorMessages = result.error.issues
      .map((e) => e.message)
      .join(", ");
    throw new ValidationError(errorMessages);
  }

  return result.data;
}

// Common validation schemas
export const sideSchema = z.enum(["A", "B"]);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idSchema = z.string().cuid();

export const nicknameSchema = z
  .string()
  .trim()
  .min(2, "닉네임은 최소 2자 이상이어야 합니다.")
  .max(20, "닉네임은 최대 20자까지 가능합니다.");
