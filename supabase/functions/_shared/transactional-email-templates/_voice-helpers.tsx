import * as React from 'npm:react@18.3.1'
import { Button, Section, Text } from 'npm:@react-email/components@0.0.22'

// Shared brand tokens for templates
export const BRAND = {
  gold: '#c9a227',
  goldSoft: '#e8d5a3',
  ink: '#111827',
  body: '#374151',
  mute: '#9ca3af',
  border: '#e5e7eb',
  serif: "'Georgia', 'Cormorant Garamond', serif",
  sans: "'Helvetica Neue', Helvetica, Arial, sans-serif",
}

const signoffStyle = {
  fontSize: '14px',
  color: BRAND.gold,
  fontStyle: 'italic' as const,
  margin: '24px 0 0',
  fontFamily: BRAND.serif,
  lineHeight: '1.5',
}

/** Coach Kay's mantra sign-off. Use this in every user-facing email. */
export const Signoff = () => (
  <Text style={signoffStyle}>Where Focus Goes, Energy Flows. 💛 Coach Kay</Text>
)

const warmOpenStyle = {
  fontSize: '16px',
  color: BRAND.ink,
  margin: '0 0 18px',
  fontFamily: BRAND.sans,
  fontWeight: '500' as const,
}

/** Warm open. Falls back to "Hey Friends!" when name is missing. */
export const WarmOpen = ({ name }: { name?: string }) => (
  <Text style={warmOpenStyle}>{name ? `Hey ${name}! 👋` : 'Hey Friends! 👋'}</Text>
)

const arrowCtaStyle = {
  backgroundColor: BRAND.gold,
  color: BRAND.ink,
  padding: '14px 32px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  display: 'inline-block' as const,
}

/** Arrow CTA. never "Click here" / "Learn more". */
export const ArrowCTA = ({ href, label }: { href: string; label: string }) => (
  <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
    <Button style={arrowCtaStyle} href={href}>{`→ ${label}`}</Button>
  </Section>
)

/** Strip em-dashes from any string before it renders into an email. */
export function scrubVoice(text: string): string {
  if (!text) return text
  let out = text.replace(/\s*\u2014\s*/g, '. ').replace(/\s+\u2013\s+/g, ', ').replace(/--/g, '.')
  out = out.replace(/\.\s+\./g, '.')
  return out
}
