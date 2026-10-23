import Script from "next/script";

interface GoogleAnalyticsProps {
  gaId?: string;
}

/**
 * Google Analytics 4 (GA4) integration for Next.js App Router.
 * - Reads measurement ID from NEXT_PUBLIC_GA_ID or prop.
 * - Uses Next.js Script component with afterInteractive strategy to ensure non-blocking loading.
 * - Relies on GA4 Enhanced Measurement's browser history event listener to automatically track
 *   client-side SPA navigations across Next.js routes without firing duplicate page_view events.
 * - Strips query strings from the initial page_path and enforces IP anonymization.
 * - Transmits zero PII (no user names, emails, phone numbers, or form contents).
 */
export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  const measurementId = gaId || process.env.NEXT_PUBLIC_GA_ID;

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        id="google-analytics-tag"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              anonymize_ip: true
            });
          `,
        }}
      />
    </>
  );
}
