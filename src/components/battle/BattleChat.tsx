"use client";

import { useRef, useEffect } from "react";
import { BattleMessageItem } from "./BattleMessageItem";
import type { BattleMessageRole } from "@prisma/client";

type Message = {
  id: string;
  role: BattleMessageRole;
  content: string;
  user: {
    nickname: string | null;
    name: string | null;
    image: string | null;
  } | null;
  hpChange: number | null;
  targetUserId: string | null;
  createdAt: string;
};

interface BattleChatProps {
  messages: Message[];
}

export function BattleChat({ messages }: BattleChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto space-y-1 p-3 min-h-[200px] max-h-[400px]"
    >
      {messages.map((msg) => (
        <BattleMessageItem
          key={msg.id}
          role={msg.role}
          content={msg.content}
          user={msg.user}
          hpChange={msg.hpChange}
          targetUserId={msg.targetUserId}
          createdAt={msg.createdAt}
        />
      ))}
    </div>
  );
}
