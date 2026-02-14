import { z } from "zod";

export const reportSchema = z.object({
  reason: z.string().min(10, "신고 사유는 10자 이상이어야 합니다.").max(500, "신고 사유는 500자 이하여야 합니다."),
});

export type ReportInput = z.infer<typeof reportSchema>;
