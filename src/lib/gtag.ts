/**
 * Thin wrapper for GA4 conversion events.
 *
 * To activate: replace G-XXXXXXXXXX with your real Measurement ID.
 * Find it at: analytics.google.com → Admin → Data Streams → Web stream details
 *
 * Also update the matching placeholder in /index.html.
 */
export const GA_TRACKING_ID = 'G-XXXXXXXXXX'

export function gtagEvent(action: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined' || !(window as any).gtag) return
  ;(window as any).gtag('event', action, params)
}

// Pre-defined conversion events

/** Fire when a user starts the Clarity Session quiz */
export const trackClarityStart = () =>
  gtagEvent('clarity_session_start', { event_category: 'engagement' })

/** Fire when a user completes an audit purchase */
export const trackAuditPurchase = () =>
  gtagEvent('purchase', { event_category: 'conversion', value: 47, currency: 'USD' })

/** Fire when a user successfully subscribes to the newsletter */
export const trackNewsletterSignup = () =>
  gtagEvent('generate_lead', { event_category: 'conversion' })

/** Fire when a user begins a checkout flow for a paid program */
export const trackCheckoutStart = (tier: string, value: number) =>
  gtagEvent('begin_checkout', {
    event_category: 'conversion',
    item_name: tier,
    value,
    currency: 'USD',
  })
