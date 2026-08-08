// Single source of truth for recipient addresses that can never receive mail.
//
// RFC 2606 / RFC 6761 reserve these names for documentation and testing, and
// Resend rejects them outright with a 422 that will fail identically on every
// retry. Attempting a real send would write a false `failed` row into
// `email_send_log` and make QA fixtures look like a delivery outage. The send
// function short-circuits on these and logs `suppressed` instead.
//
// Kept free of `npm:`/`https:` imports on purpose: it is imported by the Deno
// edge functions AND by the Vitest suite that guards the matching rules.

export const RESERVED_EMAIL_DOMAINS = ['example.com', 'example.org', 'example.net'] as const

export const RESERVED_EMAIL_TLDS = ['.test', '.invalid', '.localhost', '.example'] as const

/**
 * True when `email`'s domain is reserved and therefore undeliverable.
 *
 * Matches the exact reserved domains, any subdomain of them
 * (`mail.example.com`), the reserved TLDs (`box.local.test`), and the bare
 * labels (`foo@test`). Deliberately does NOT match lookalikes that are real
 * routable domains, such as `example.company.com` or `notexample.com`.
 */
export function isReservedTestRecipient(email: string): boolean {
  const at = email.lastIndexOf('@')
  if (at === -1) return false
  const domain = email.slice(at + 1).toLowerCase().trim().replace(/\.$/, '')
  if (!domain) return false

  for (const reserved of RESERVED_EMAIL_DOMAINS) {
    if (domain === reserved || domain.endsWith('.' + reserved)) return true
  }
  for (const tld of RESERVED_EMAIL_TLDS) {
    if (domain === tld.slice(1) || domain.endsWith(tld)) return true
  }
  return false
}
