import { prisma } from "@/lib/db";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { BLIND_THRESHOLD } from "@/lib/constants";
import type { ReportStatus } from "@prisma/client";

export async function createReport(
  userId: string,
  opinionId: string,
  reason: string
) {
  // Check if opinion exists
  const opinion = await prisma.opinion.findUnique({
    where: { id: opinionId },
  });

  if (!opinion) {
    throw new NotFoundError("의견을 찾을 수 없습니다.");
  }

  // Check if user already reported this opinion
  const existingReport = await prisma.report.findFirst({
    where: { opinionId, userId },
  });

  if (existingReport) {
    throw new ConflictError("이미 이 의견을 신고하셨습니다.");
  }

  // Create report
  const report = await prisma.report.create({
    data: {
      opinionId,
      userId,
      reason,
    },
  });

  // Check if should auto-blind
  const reportCount = await prisma.report.count({
    where: { opinionId },
  });

  if (reportCount >= BLIND_THRESHOLD && !opinion.isBlinded) {
    await prisma.opinion.update({
      where: { id: opinionId },
      data: { isBlinded: true },
    });
  }

  return report;
}

export async function getReports(status?: ReportStatus) {
  const where = status ? { status } : {};

  return prisma.report.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      opinion: {
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              name: true,
            },
          },
          topic: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          nickname: true,
          name: true,
        },
      },
    },
  });
}

export async function updateReportStatus(id: string, status: ReportStatus) {
  const report = await prisma.report.findUnique({
    where: { id },
    include: { opinion: true },
  });

  if (!report) {
    throw new NotFoundError("신고를 찾을 수 없습니다.");
  }

  // If reviewed (accepted), blind the opinion
  if (status === "REVIEWED" && !report.opinion.isBlinded) {
    await prisma.$transaction([
      prisma.report.update({
        where: { id },
        data: { status },
      }),
      prisma.opinion.update({
        where: { id: report.opinionId },
        data: { isBlinded: true },
      }),
    ]);
  } else if (status === "DISMISSED") {
    // If dismissed, just update the report
    await prisma.report.update({
      where: { id },
      data: { status },
    });
  }

  return prisma.report.findUnique({
    where: { id },
    include: {
      opinion: true,
    },
  });
}
