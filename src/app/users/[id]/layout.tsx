import { Metadata } from "next";

export const metadata: Metadata = {
  title: "사용자 프로필",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PublicProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
