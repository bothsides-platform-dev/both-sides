const PAGE_VIEWS_KEY = "nps-page-views";
const LAST_SUBMISSION_KEY = "nps-last-submission";
const LAST_DISMISSAL_KEY = "nps-last-dismissed";
const COOLDOWN_DAYS = 3;
const MIN_PAGE_VIEWS = 3;
const SHOW_PROBABILITY = 0.05;

export function incrementPageViews(): number {
  try {
    const current = parseInt(sessionStorage.getItem(PAGE_VIEWS_KEY) || "0", 10);
    const next = current + 1;
    sessionStorage.setItem(PAGE_VIEWS_KEY, String(next));
    return next;
  } catch {
    return 0;
  }
}

export function shouldShowNPSPrompt(): boolean {
  try {
    // Check minimum page views
    const pageViews = parseInt(sessionStorage.getItem(PAGE_VIEWS_KEY) || "0", 10);
    if (pageViews < MIN_PAGE_VIEWS) return false;

    // Check cooldown (submission and dismissal)
    const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    const lastSubmission = localStorage.getItem(LAST_SUBMISSION_KEY);
    if (lastSubmission) {
      const elapsed = Date.now() - parseInt(lastSubmission, 10);
      if (elapsed < cooldownMs) return false;
    }
    const lastDismissal = localStorage.getItem(LAST_DISMISSAL_KEY);
    if (lastDismissal) {
      const elapsed = Date.now() - parseInt(lastDismissal, 10);
      if (elapsed < cooldownMs) return false;
    }

    // Random probability
    return Math.random() < SHOW_PROBABILITY;
  } catch {
    return false;
  }
}

export function recordDismissal(): void {
  try {
    localStorage.setItem(LAST_DISMISSAL_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable
  }
}

export function recordSubmission(): void {
  try {
    localStorage.setItem(LAST_SUBMISSION_KEY, String(Date.now()));
  } catch {
    // localStorage unavailable
  }
}
