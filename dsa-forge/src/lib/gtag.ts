export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Log page views
export function pageview(url: string) {
  if (typeof window !== "undefined" && (window as any).gtag && GA_MEASUREMENT_ID) {
    (window as any).gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

// Log custom GA4 events
export function event(action: string, params: Record<string, any> = {}) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, params);
  }
}

