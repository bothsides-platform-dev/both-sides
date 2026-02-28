"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { format, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Loader2, CalendarClock, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScheduleCalendar } from "./ScheduleCalendar";
import { ScheduleTopicList } from "./ScheduleTopicList";
import { RescheduleDialog } from "./RescheduleDialog";
import { CreateScheduledTopicDialog } from "./CreateScheduledTopicDialog";
import { useToast } from "@/components/ui/toast";
import { fetcher } from "@/lib/fetcher";
import { CATEGORY_LABELS, CATEGORY_CSS_VAR } from "@/lib/constants";
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
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeDragTopic, setActiveDragTopic] = useState<ScheduledTopic | null>(null);

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

  // DnD sensors
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const topic = topics.find((t) => t.id === event.active.id);
      setActiveDragTopic(topic ?? null);
    },
    [topics]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDragTopic(null);
      const { active, over } = event;
      if (!over) return;

      const droppedDateKey = String(over.id).replace("date-", "");
      const topic = topics.find((t) => t.id === active.id);
      if (!topic) return;

      // Check if dropped on the same date
      const currentDateKey = format(new Date(topic.scheduledAt), "yyyy-MM-dd");
      if (currentDateKey === droppedDateKey) return;

      // Keep original time, change only the date
      const original = new Date(topic.scheduledAt);
      const [yearStr, monthStr, dayStr] = droppedDateKey.split("-");
      const newDate = new Date(original);
      newDate.setFullYear(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));

      try {
        const res = await fetch(`/api/admin/topics/${topic.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduledAt: newDate.toISOString() }),
        });
        if (!res.ok) throw new Error();
        showToast(
          `"${topic.title}" → ${format(newDate, "M월 d일", { locale: ko })}로 이동`,
          "success"
        );
        mutate();
      } catch {
        showToast("일정 변경에 실패했습니다.", "error");
      }
    },
    [topics, mutate, showToast]
  );

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

  const handleTopicCreated = useCallback(() => {
    showToast("예약 토론이 생성되었습니다.", "success");
    mutate();
  }, [mutate, showToast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
            <div className="flex items-center justify-between">
              <CardTitle>
                {selectedDate
                  ? `${format(selectedDate, "M월 d일", { locale: ko })} 예약 토론`
                  : "전체 예약 토론"}
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                새 토론
              </Button>
            </div>
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

        {/* Drag overlay */}
        <DragOverlay>
          {activeDragTopic && (
            <div className="bg-card border rounded-lg shadow-lg p-3 w-64 opacity-90">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                  style={{
                    backgroundColor: CATEGORY_CSS_VAR[activeDragTopic.category],
                  }}
                >
                  {CATEGORY_LABELS[activeDragTopic.category]}
                </span>
              </div>
              <p className="font-medium text-sm truncate">
                {activeDragTopic.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {activeDragTopic.optionA} vs {activeDragTopic.optionB}
              </p>
            </div>
          )}
        </DragOverlay>

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

        {/* Create dialog */}
        <CreateScheduledTopicDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          defaultScheduledDate={selectedDate}
          onCreated={handleTopicCreated}
        />
      </div>
    </DndContext>
  );
}
