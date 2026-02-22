"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { Loader2, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleCalendar } from "./ScheduleCalendar";
import { ScheduleTopicList } from "./ScheduleTopicList";
import { RescheduleDialog } from "./RescheduleDialog";
import { useToast } from "@/components/ui/toast";
import { fetcher } from "@/lib/fetcher";
import type { Category } from "@prisma/client";

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

interface ScheduleResponse {
  data: ScheduledTopic[];
}

export function AdminSchedule() {
  const { showToast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<ScheduledTopic | null>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;

  const { data, isLoading, mutate } = useSWR<ScheduleResponse>(
    `/api/admin/schedule?year=${year}&month=${month}`,
    fetcher
  );

  const topics = data?.data ?? [];

  const todayCount = topics.filter((t) =>
    isSameDay(new Date(t.scheduledAt), new Date())
  ).length;

  const handleReschedule = useCallback(
    async (newDate: string) => {
      if (!rescheduleTarget) return;
      try {
        const res = await fetch(`/api/admin/topics/${rescheduleTarget.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduledAt: newDate }),
        });
        if (!res.ok) throw new Error();
        showToast("일정이 변경되었습니다.", "success");
        mutate();
      } catch {
        showToast("일정 변경에 실패했습니다.", "error");
      }
    },
    [rescheduleTarget, mutate, showToast]
  );

  const handlePublishNow = useCallback(
    async (topic: ScheduledTopic) => {
      if (!confirm(`"${topic.title}"을(를) 즉시 공개하시겠습니까?`)) return;
      try {
        const res = await fetch(`/api/admin/topics/${topic.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduledAt: null }),
        });
        if (!res.ok) throw new Error();
        showToast("즉시 공개되었습니다.", "success");
        mutate();
      } catch {
        showToast("공개 처리에 실패했습니다.", "error");
      }
    },
    [mutate, showToast]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CalendarClock className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{topics.length}</p>
              <p className="text-xs text-muted-foreground">
                {format(currentMonth, "M월", { locale: ko })} 예약
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CalendarClock className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{todayCount}</p>
              <p className="text-xs text-muted-foreground">오늘 예약</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>예약 캘린더</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleCalendar
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            topics={topics}
          />
        </CardContent>
      </Card>

      {/* Topic list */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate
              ? `${format(selectedDate, "M월 d일", { locale: ko })} 예약 토론`
              : "전체 예약 토론"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleTopicList
            topics={topics}
            selectedDate={selectedDate}
            onReschedule={setRescheduleTarget}
            onPublishNow={handlePublishNow}
          />
        </CardContent>
      </Card>

      {/* Reschedule dialog */}
      {rescheduleTarget && (
        <RescheduleDialog
          open={!!rescheduleTarget}
          onOpenChange={(open) => {
            if (!open) setRescheduleTarget(null);
          }}
          topicTitle={rescheduleTarget.title}
          currentScheduledAt={rescheduleTarget.scheduledAt}
          onConfirm={handleReschedule}
        />
      )}
    </div>
  );
}
