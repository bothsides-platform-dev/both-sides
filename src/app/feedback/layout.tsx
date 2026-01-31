import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "피드백 | BothSides",
  description: "버그 신고, 기능 제안, 문의 등 피드백을 남겨주세요",
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
