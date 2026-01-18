import { z } from "zod";

export const upsertVoteSchema = z.object({
  side: z.enum(["A", "B"]),
});

export type UpsertVoteInput = z.infer<typeof upsertVoteSchema>;
