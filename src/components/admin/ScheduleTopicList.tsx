"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarClock, Rocket, Pencil, Clock, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_LABELS, CATEGORY_CSS_VAR } from "@/lib/constants";
import type { Category } from "@prisma/client";
import Link from "next/link";

interface ScheduledTopic {
  id: string;
  title: string;
  category: Category;
  optionA: string;
  optionB: string;
  scheduledAt: string;
  createdAt: string;
  isHidden: boolean;
  author: {
    id: string;
    nickname?: string | null;
    name?: string | null;
  };
}

interface ScheduleTopicListProps {
  topics: ScheduledTopic[];
  selectedDate: Date | null;
  onReschedule: (topic: ScheduledTopic) => void;
  onPublishNow: (topic: ScheduledTopic) => void;
}

function DraggableTopicCard({
  topic,
  onReschedule,
  onPublishNow,
}: {
  topic: ScheduledTopic;
  onReschedule: (topic: ScheduledTopic) => void;
  onPublishNow: (topic: ScheduledTopic) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: topic.id,
    data: { topic },
  });

  return (
    <Card
      ref={setNodeRef}
      className={isDragging ? "opacity-30" : ""}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          {/* Drag handle */}
          <button
            type="button"
            className="mt-1 cursor-grab touch-none text-muted-foreground hover:text-foreground shrink-0"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex items-start justify-between gap-3 flex-1 min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: CATEGORY_CSS_VAR[topic.category] }}
                >
                  {CATEGORY_LABELS[topic.category]}
                </span>
                {topic.isHidden && (
                  <span className="text-xs text-red-500 font-medium">비공개</span>
                )}
              </div>

              <h4 className="font-medium text-sm truncate">{topic.title}</h4>

              <p className="text-xs text-muted-foreground mt-1">
                {topic.optionA} vs {topic.optionB}
              </p>

              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(topic.scheduledAt), "M/d HH:mm", { locale: ko })}
                </span>
                <span>
                  {topic.author.nickname ?? topic.author.name ?? "알 수 없음"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReschedule(topic)}
                title="일정 변경"
              >
                <CalendarClock className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPublishNow(topic)}
                title="즉시 공개"
              >
                <Rocket className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" asChild title="수정">
                <Link href={`/admin/topics/${topic.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScheduleTopicList({
  topics,
  selectedDate,
  onReschedule,
  onPublishNow,
}: ScheduleTopicListProps) {
  const filtered = selectedDate
    ? topics.filter((t) => {
        const tDate = format(new Date(t.scheduledAt), "yyyy-MM-dd");
        const sDate = format(selectedDate, "yyyy-MM-dd");
        return tDate === sDate;
      })
    : topics;

  if (filtered.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CalendarClock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>
          {selectedDate
            ? `${format(selectedDate, "M월 d일", { locale: ko })}에 예약된 토론이 없습니다.`
            : "이 달에 예약된 토론이 없습니다."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        {selectedDate
          ? `${format(selectedDate, "M월 d일 (EEEE)", { locale: ko })} — ${filtered.length}개`
          : `전체 ${filtered.length}개`}
      </h3>

      {filtered.map((topic) => (
        <DraggableTopicCard
          key={topic.id}
          topic={topic}
          onReschedule={onReschedule}
          onPublishNow={onPublishNow}
        />
      ))}
    </div>
  );
}
