import { prisma } from "@/lib/db";
import type { CreateFeedbackInput, GetFeedbacksInput, UpdateFeedbackInput } from "./schema";

export async function createFeedback(
  input: CreateFeedbackInput,
  userId?: string
) {
  return prisma.feedback.create({
    data: {
      category: input.category,
      content: input.content,
      email: input.email || null,
      userId: userId || null,
    },
  });
}

export async function getFeedbacks(input: GetFeedbacksInput) {
  const { status, category, page, limit } = input;
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status }),
    ...(category && { category }),
  };

  const [feedbacks, total] = await Promise.all([
    prisma.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    }),
    prisma.feedback.count({ where }),
  ]);

  return {
    feedbacks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getFeedbackStats() {
  const [pending, reviewed, resolved] = await Promise.all([
    prisma.feedback.count({ where: { status: "PENDING" } }),
    prisma.feedback.count({ where: { status: "REVIEWED" } }),
    prisma.feedback.count({ where: { status: "RESOLVED" } }),
  ]);

  return {
    pending,
    reviewed,
    resolved,
    total: pending + reviewed + resolved,
  };
}

export async function updateFeedback(input: UpdateFeedbackInput) {
  const { id, status, adminNote } = input;

  return prisma.feedback.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(adminNote !== undefined && { adminNote }),
    },
    include: {
      user: {
        select: {
          id: true,
          nickname: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}
