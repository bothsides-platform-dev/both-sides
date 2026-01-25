import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, MessageSquare, MessageCircle, Flag } from "lucide-react";

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
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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


