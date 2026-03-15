"use client";

import { VoteSection } from "./VoteSection";
import { MultipleVoteSection } from "./MultipleVoteSection";
import { NumericVoteSection } from "./NumericVoteSection";
import type { TopicType } from "@prisma/client";

interface TopicOption {
  id: string;
  label: string;
  displayOrder: number;
}

interface VoteSectionRouterProps {
  topicId: string;
  topicType: TopicType;
  optionA: string;
  optionB: string;
  deadline?: Date | string | null;
  // MULTIPLE
  options?: TopicOption[];
  // NUMERIC
  numericUnit?: string | null;
  numericMin?: number | null;
  numericMax?: number | null;
}

export function VoteSectionRouter({
  topicId,
  topicType,
  optionA,
  optionB,
  deadline,
  options,
  numericUnit,
  numericMin,
  numericMax,
}: VoteSectionRouterProps) {
  if (topicType === "MULTIPLE" && options) {
    return (
      <MultipleVoteSection
        topicId={topicId}
        options={options}
        deadline={deadline}
      />
    );
  }

  if (topicType === "NUMERIC") {
    return (
      <NumericVoteSection
        topicId={topicId}
        unit={numericUnit || ""}
        min={numericMin}
        max={numericMax}
        deadline={deadline}
      />
    );
  }

  return (
    <VoteSection
      topicId={topicId}
      optionA={optionA}
      optionB={optionB}
      deadline={deadline}
    />
  );
}
