import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/options";
import {
  LayoutDashboard,
  MessageSquare,
  MessageCircle,
  Flag,
  MessageSquareText,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "관리자",
  robots: {
    index: false,
    follow: false,
  },
};

const navItems = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/topics", label: "토론 관리", icon: MessageSquare },
  { href: "/admin/opinions", label: "의견 관리", icon: MessageCircle },
  { href: "/admin/reports", label: "신고 관리", icon: Flag },
  { href: "/admin/feedback", label: "피드백 관리", icon: MessageSquareText },
  { href: "/admin/users", label: "사용자 관리", icon: Users },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 서버사이드 인증 체크
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/?error=unauthorized");
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">관리자 페이지</h1>
        <nav className="flex gap-2 flex-wrap">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}


