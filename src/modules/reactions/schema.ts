import { z } from "zod";

export const reactionSchema = z.object({
  type: z.enum(["LIKE", "DISLIKE"]),
});

export type ReactionInput = z.infer<typeof reactionSchema>;
