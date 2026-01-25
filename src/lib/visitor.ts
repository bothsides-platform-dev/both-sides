import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const VISITOR_ID_COOKIE = "visitor_id";

/**
 * Get or create visitor ID from cookies
 * Returns existing visitor_id or generates a new one
 */
export async function getOrCreateVisitorId(): Promise<{
  visitorId: string;
  isNew: boolean;
}> {
  const cookieStore = await cookies();
  let visitorId = cookieStore.get(VISITOR_ID_COOKIE)?.value;

  if (visitorId) {
    return { visitorId, isNew: false };
  }

  // Generate new visitor ID
  visitorId = `anon:${crypto.randomUUID()}`;
  return { visitorId, isNew: true };
}

/**
 * Extract IP address from request
 * Handles proxy headers (x-forwarded-for, x-real-ip)
 */
export function getIpAddress(request: NextRequest): string | null {
  // Check proxy headers first
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to connection IP (may not be available in all environments)
  return null;
}

/**
 * Set visitor ID cookie in response
 */
export function setVisitorIdCookie(
  response: NextResponse,
  visitorId: string
): void {
  response.cookies.set(VISITOR_ID_COOKIE, visitorId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });
}
