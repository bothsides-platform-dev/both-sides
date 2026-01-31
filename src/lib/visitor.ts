import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

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
 * Validate IPv4 or IPv6 address format
 */
function isValidIpAddress(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
  // IPv6 pattern (simplified - accepts valid IPv6 formats)
  const ipv6Pattern = /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$|^::(?:[a-fA-F0-9]{1,4}:){0,6}[a-fA-F0-9]{1,4}$|^(?:[a-fA-F0-9]{1,4}:){1,7}:$|^(?:[a-fA-F0-9]{1,4}:){1,6}:[a-fA-F0-9]{1,4}$/;

  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

/**
 * Extract IP address from request
 * Handles proxy headers (x-forwarded-for, x-real-ip)
 * Note: Vercel automatically sets x-forwarded-for header which cannot be spoofed
 * For other environments, consider using a trusted reverse proxy
 */
export function getIpAddress(request: NextRequest): string | null {
  // Check proxy headers first
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one (client IP)
    const clientIp = forwardedFor.split(",")[0].trim();

    // Validate IP format to prevent malformed data
    if (isValidIpAddress(clientIp)) {
      return clientIp;
    }
    // If the first IP is invalid, return null for safety
    return null;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    const trimmedIp = realIp.trim();
    if (isValidIpAddress(trimmedIp)) {
      return trimmedIp;
    }
    return null;
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

/**
 * Generate device fingerprint (IP + User-Agent + Accept-Language)
 * Used for additional guest vote validation
 */
export function generateDeviceFingerprint(request: NextRequest): string {
  const ip = getIpAddress(request) || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  const acceptLanguage = request.headers.get("accept-language") || "";

  const raw = `${ip}:${userAgent}:${acceptLanguage}`;
  return crypto.createHash("sha256").update(raw).digest("hex").substring(0, 32);
}
