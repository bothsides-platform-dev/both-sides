"use client";

import { useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { CATEGORY_CSS_VAR } from "@/lib/constants";
import type { Category } from "@prisma/client";

interface ScheduledTopic {
  id: string;
  title: string;
  category: Category;
  scheduledAt: string;
}

interface ScheduleCalendarProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  topics: ScheduledTopic[];
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function CalendarDayCell({
  day,
  dateKey,
  dayTopics,
  inCurrentMonth,
  isSelected,
  today,
  onDateSelect,
}: {
  day: Date;
  dateKey: string;
  dayTopics: ScheduledTopic[];
  inCurrentMonth: boolean;
  isSelected: boolean;
  today: boolean;
  onDateSelect: (date: Date | null) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `date-${dateKey}`,
    data: { date: day, dateKey },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onDateSelect(isSelected ? null : day)}
      className={`
        relative min-h-[72px] p-1.5 text-left transition-colors bg-card
        ${!inCurrentMonth ? "opacity-40" : ""}
        ${isSelected ? "ring-2 ring-primary ring-inset" : ""}
        ${isOver ? "bg-primary/10 ring-2 ring-primary" : ""}
        ${inCurrentMonth && !isOver ? "hover:bg-muted/50" : ""}
      `}
    >
      <span
        className={`
          text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full
          ${today ? "bg-primary text-primary-foreground" : ""}
        `}
      >
        {format(day, "d")}
      </span>

      {/* Topic dots */}
      {dayTopics.length > 0 && (
        <div className="mt-0.5 flex flex-wrap gap-0.5">
          {dayTopics.slice(0, 4).map((t) => (
            <span
              key={t.id}
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: CATEGORY_CSS_VAR[t.category] }}
              title={t.title}
            />
          ))}
          {dayTopics.length > 4 && (
            <span className="text-[10px] text-muted-foreground leading-none">
              +{dayTopics.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Count badge */}
      {dayTopics.length > 0 && (
        <span className="absolute top-1 right-1 text-[10px] font-medium text-muted-foreground">
          {dayTopics.length}
        </span>
      )}
    </button>
  );
}

export function ScheduleCalendar({
  currentMonth,
  onMonthChange,
  selectedDate,
  onDateSelect,
  topics,
}: ScheduleCalendarProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { locale: ko });
    const calEnd = endOfWeek(monthEnd, { locale: ko });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const topicsByDate = useMemo(() => {
    const map = new Map<string, ScheduledTopic[]>();
    for (const topic of topics) {
      const key = format(new Date(topic.scheduledAt), "yyyy-MM-dd");
      const existing = map.get(key) ?? [];
      existing.push(topic);
      map.set(key, existing);
    }
    return map;
  }, [topics]);

  return (
    <div>
      {/* Header: month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {format(currentMonth, "yyyy년 M월", { locale: ko })}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onMonthChange(new Date());
              onDateSelect(new Date());
            }}
          >
            오늘
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMonthChange(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {calendarDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayTopics = topicsByDate.get(key) ?? [];
          const inCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const today = isToday(day);

          return (
            <CalendarDayCell
              key={key}
              day={day}
              dateKey={key}
              dayTopics={dayTopics}
              inCurrentMonth={inCurrentMonth}
              isSelected={isSelected}
              today={today}
              onDateSelect={onDateSelect}
            />
          );
        })}
      </div>
    </div>
  );
}
