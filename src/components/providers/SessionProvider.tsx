"use client";

import { useEffect, useRef } from "react";
import { SessionProvider as NextAuthSessionProvider, useSession } from "next-auth/react";
import { trackSignUp } from "@/lib/analytics";

function NewUserTracker() {
  const { data: session } = useSession();
  const tracked = useRef(false);

  useEffect(() => {
    if (session?.user?.isNewUser && !tracked.current) {
      tracked.current = true;
      trackSignUp("google");
    }
  }, [session]);

  return null;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <NewUserTracker />
      {children}
    </NextAuthSessionProvider>
  );
}
