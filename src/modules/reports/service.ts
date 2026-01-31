import { prisma } from "@/lib/db";
import { NotFoundError, ConflictError } from "@/lib/errors";
import { BLIND_THRESHOLD } from "@/lib/constants";
import type { ReportStatus } from "@prisma/client";

export type ReportType = "opinion" | "topic";

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

export async function createTopicReport(
  userId: string,
  topicId: string,
  reason: string
) {
  // Check if topic exists
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
  });

  if (!topic) {
    throw new NotFoundError("토론을 찾을 수 없습니다.");
  }

  // Check if user already reported this topic (본인 신고는 허용 - 자진 삭제 대용)
  const existingReport = await prisma.report.findFirst({
    where: { topicId, userId },
  });

  if (existingReport) {
    throw new ConflictError("이미 이 토론을 신고하셨습니다.");
  }

  // Create report
  const report = await prisma.report.create({
    data: {
      topicId,
      userId,
      reason,
    },
  });

  // Check if should auto-hide
  const reportCount = await prisma.report.count({
    where: { topicId },
  });

  if (reportCount >= BLIND_THRESHOLD && !topic.isHidden) {
    await prisma.topic.update({
      where: { id: topicId },
      data: { isHidden: true, hiddenAt: new Date() },
    });
  }

  return report;
}

export async function getReports(status?: ReportStatus, type?: ReportType) {
  const where: {
    status?: ReportStatus;
    opinionId?: { not: null } | null;
    topicId?: { not: null } | null;
  } = {};

  if (status) {
    where.status = status;
  }

  if (type === "opinion") {
    where.opinionId = { not: null };
  } else if (type === "topic") {
    where.topicId = { not: null };
  }

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
      topic: {
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              name: true,
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
    include: { opinion: true, topic: true },
  });

  if (!report) {
    throw new NotFoundError("신고를 찾을 수 없습니다.");
  }

  // Handle opinion reports
  if (report.opinionId && report.opinion) {
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
      await prisma.report.update({
        where: { id },
        data: { status: "DISMISSED" },
      });

      const pendingCount = await prisma.report.count({
        where: {
          opinionId: report.opinionId,
          status: "PENDING",
        },
      });

      if (pendingCount === 0) {
        const reviewedCount = await prisma.report.count({
          where: {
            opinionId: report.opinionId,
            status: "REVIEWED",
          },
        });

        if (reviewedCount === 0) {
          await prisma.opinion.update({
            where: { id: report.opinionId },
            data: { isBlinded: false },
          });
        }
      }
    } else {
      await prisma.report.update({
        where: { id },
        data: { status },
      });
    }
  }

  // Handle topic reports
  if (report.topicId && report.topic) {
    if (status === "REVIEWED" && !report.topic.isHidden) {
      await prisma.$transaction([
        prisma.report.update({
          where: { id },
          data: { status },
        }),
        prisma.topic.update({
          where: { id: report.topicId },
          data: { isHidden: true, hiddenAt: new Date() },
        }),
      ]);
    } else if (status === "DISMISSED") {
      await prisma.report.update({
        where: { id },
        data: { status: "DISMISSED" },
      });

      const pendingCount = await prisma.report.count({
        where: {
          topicId: report.topicId,
          status: "PENDING",
        },
      });

      if (pendingCount === 0) {
        const reviewedCount = await prisma.report.count({
          where: {
            topicId: report.topicId,
            status: "REVIEWED",
          },
        });

        if (reviewedCount === 0) {
          await prisma.topic.update({
            where: { id: report.topicId },
            data: { isHidden: false, hiddenAt: null },
          });
        }
      }
    } else {
      await prisma.report.update({
        where: { id },
        data: { status },
      });
    }
  }

  return prisma.report.findUnique({
    where: { id },
    include: {
      opinion: true,
      topic: true,
    },
  });
}
