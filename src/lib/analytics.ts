/**
 * Google Analytics 4 (GA4) Event Tracking Utility
 * 
 * Provides type-safe wrappers for GA4 custom events with automatic UTM parameter inclusion.
 * All events automatically include UTM parameters from the current session.
 */

// Extend Window interface for gtag (GA4)
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: {
      (command: "config", targetId: string, config?: Record<string, unknown>): void;
      (command: "event", eventName: string, eventParams?: Record<string, unknown>): void;
      (command: "set", config: Record<string, unknown>): void;
      (command: "js", date: Date): void;
    };
  }
}

/**
 * Get UTM parameters from sessionStorage
 * These are set by UTMProvider when the user first lands on the site
 */
function getUTMParams(): Record<string, string | undefined> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const utmSource = sessionStorage.getItem("utm_source");
    const utmMedium = sessionStorage.getItem("utm_medium");
    const utmCampaign = sessionStorage.getItem("utm_campaign");
    const utmContent = sessionStorage.getItem("utm_content");
    const utmTerm = sessionStorage.getItem("utm_term");
    const referrer = sessionStorage.getItem("referrer");
    const referrerDomain = sessionStorage.getItem("referrer_domain");

    return {
      utm_source: utmSource || undefined,
      utm_medium: utmMedium || undefined,
      utm_campaign: utmCampaign || undefined,
      utm_content: utmContent || undefined,
      utm_term: utmTerm || undefined,
      referrer: referrer || undefined,
      referrer_domain: referrerDomain || undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Add UTM parameters to a URL based on the share platform
 */
export function addUTMParams(
  baseUrl: string,
  platform: "kakao" | "twitter" | "facebook" | "instagram" | "link",
  contentId?: string
): string {
  try {
    const urlObj = new URL(baseUrl);
    urlObj.searchParams.set("utm_source", platform);
    urlObj.searchParams.set("utm_medium", platform === "link" ? "referral" : "social");
    urlObj.searchParams.set("utm_campaign", "share");
    if (contentId) urlObj.searchParams.set("utm_content", contentId);
    return urlObj.toString();
  } catch {
    const separator = baseUrl.includes("?") ? "&" : "?";
    const params = new URLSearchParams({
      utm_source: platform,
      utm_medium: platform === "link" ? "referral" : "social",
      utm_campaign: "share",
      ...(contentId && { utm_content: contentId }),
    });
    return `${baseUrl}${separator}${params.toString()}`;
  }
}

/**
 * Send a custom event to GA4 with UTM parameters automatically included
 */
function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
): void {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  const utmParams = getUTMParams();
  const params = {
    ...utmParams,
    ...eventParams,
  };

  window.gtag("event", eventName, params);
}

/**
 * Track when a user votes on a topic
 */
export function trackVote(topicId: string, side: "A" | "B"): void {
  trackEvent("vote", {
    topic_id: topicId,
    vote_side: side,
  });
}

/**
 * Track when a user creates an opinion
 */
export function trackOpinionCreate(topicId: string, side: "A" | "B"): void {
  trackEvent("opinion_create", {
    topic_id: topicId,
    opinion_side: side,
  });
}

/**
 * Track when a user shares a topic
 */
export function trackShare(
  platform: "kakao" | "twitter" | "facebook" | "instagram" | "link",
  topicId: string
): void {
  trackEvent("share", {
    share_platform: platform,
    topic_id: topicId,
  });
}

/**
 * Track when a user creates a new topic
 */
export function trackTopicCreate(category: string): void {
  trackEvent("topic_create", {
    topic_category: category,
  });
}

/**
 * Track when a user signs up
 */
export function trackSignUp(provider: string): void {
  trackEvent("sign_up", {
    signup_provider: provider,
  });
}
