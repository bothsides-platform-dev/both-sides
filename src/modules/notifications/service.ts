import { prisma } from "@/lib/db";
import { AUTHOR_SELECT_PUBLIC } from "@/lib/prisma-selects";
import { broadcast } from "@/lib/sse";
import type { GetNotificationsInput } from "./schema";

export async function createReplyNotification({
  userId,
  actorId,
  opinionId,
  replyId,
  topicId,
}: {
  userId: string;
  actorId: string;
  opinionId: string;
  replyId: string;
  topicId: string;
}) {
  // Don't create notification if user is replying to themselves
  if (userId === actorId) {
    return null;
  }

  const notification = await prisma.notification.create({
    data: {
      userId,
      actorId,
      opinionId,
      replyId,
      topicId,
      type: "REPLY",
    },
  });

  broadcast(`user:${userId}`, {
    type: "notification:new",
    data: { id: notification.id, type: "REPLY" },
  });

  return notification;
}

export async function getNotifications(userId: string, input: GetNotificationsInput) {
  const { page, limit } = input;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        actor: { select: AUTHOR_SELECT_PUBLIC },
        opinion: {
          select: {
            id: true,
            body: true,
          },
        },
        reply: {
          select: {
            id: true,
            body: true,
          },
        },
        topic: {
          select: {
            id: true,
            title: true,
          },
        },
        battle: {
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    unreadCount,
  };
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}
