"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * UTM Provider Component
 * 
 * Captures UTM parameters from URL on page load and stores them in sessionStorage.
 * Also captures referrer for natural traffic attribution.
 * Sets GA4 user properties for all events in the session.
 */
export function UTMProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  // SPA pageview 추적: pathname 변경 시 GA4에 page_view 전송
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (window.gtag) {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_title: document.title,
      });
    }
  }, [pathname]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      return;
    }

    // Check if we already have UTM params in this session
    const hasExistingUTM = sessionStorage.getItem("utm_source");

    // Parse UTM parameters from URL
    const utmSource = searchParams.get("utm_source");
    const utmMedium = searchParams.get("utm_medium");
    const utmCampaign = searchParams.get("utm_campaign");
    const utmContent = searchParams.get("utm_content");
    const utmTerm = searchParams.get("utm_term");

    // If UTM parameters exist in URL, store them (overwrites existing)
    if (utmSource || utmMedium || utmCampaign || utmContent || utmTerm) {
      if (utmSource) sessionStorage.setItem("utm_source", utmSource);
      if (utmMedium) sessionStorage.setItem("utm_medium", utmMedium);
      if (utmCampaign) sessionStorage.setItem("utm_campaign", utmCampaign);
      if (utmContent) sessionStorage.setItem("utm_content", utmContent);
      if (utmTerm) sessionStorage.setItem("utm_term", utmTerm);

      // Store first-touch UTM in localStorage (for attribution across sessions)
      if (!localStorage.getItem("utm_source_first")) {
        if (utmSource) localStorage.setItem("utm_source_first", utmSource);
        if (utmMedium) localStorage.setItem("utm_medium_first", utmMedium);
        if (utmCampaign) localStorage.setItem("utm_campaign_first", utmCampaign);
      }
    }

    // Capture referrer if no UTM params exist (natural/organic traffic)
    if (!hasExistingUTM && !utmSource) {
      const referrer = document.referrer;
      if (referrer) {
        // Only store external referrers (not same-origin)
        try {
          const referrerUrl = new URL(referrer);
          const currentUrl = new URL(window.location.href);
          
          if (referrerUrl.origin !== currentUrl.origin) {
            sessionStorage.setItem("referrer", referrer);
            
            // Extract domain from referrer for easier analysis
            const referrerDomain = referrerUrl.hostname.replace(/^www\./, "");
            sessionStorage.setItem("referrer_domain", referrerDomain);
          }
        } catch {
          // Invalid URL, ignore
        }
      } else {
        // No referrer = direct traffic
        sessionStorage.setItem("referrer", "direct");
      }
    }

    // Set GA4 user properties with current UTM values
    if (typeof window !== "undefined" && window.gtag) {
      const utmParams: Record<string, string> = {};
      
      const storedSource = sessionStorage.getItem("utm_source");
      const storedMedium = sessionStorage.getItem("utm_medium");
      const storedCampaign = sessionStorage.getItem("utm_campaign");
      const storedContent = sessionStorage.getItem("utm_content");
      const storedTerm = sessionStorage.getItem("utm_term");
      const storedReferrer = sessionStorage.getItem("referrer");
      const storedReferrerDomain = sessionStorage.getItem("referrer_domain");

      if (storedSource) utmParams.utm_source = storedSource;
      if (storedMedium) utmParams.utm_medium = storedMedium;
      if (storedCampaign) utmParams.utm_campaign = storedCampaign;
      if (storedContent) utmParams.utm_content = storedContent;
      if (storedTerm) utmParams.utm_term = storedTerm;
      if (storedReferrer) utmParams.referrer = storedReferrer;
      if (storedReferrerDomain) utmParams.referrer_domain = storedReferrerDomain;

      // Set user properties for all subsequent events
      if (Object.keys(utmParams).length > 0) {
        window.gtag("set", { user_properties: utmParams });
      }
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
