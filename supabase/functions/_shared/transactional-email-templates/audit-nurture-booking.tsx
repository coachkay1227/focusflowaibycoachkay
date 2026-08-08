import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FocusFlow AI"
const FALLBACK_BOOKING_URL =
  "https://call.coachkayelevates.org/widget/bookings/15-minutes-free-call"

interface AuditNurtureBookingProps {
  name?: string | null
  bookingUrl?: string | null
}

const AuditNurtureBookingEmail = ({ name, bookingUrl }: AuditNurtureBookingProps) => {
  const url = bookingUrl || FALLBACK_BOOKING_URL

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Fifteen minutes on your audit, whenever you're ready</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>
              <span style={{ color: '#c9a227' }}>Focus</span>
              <span style={{ color: '#e8d5a3' }}>Flow</span>
              <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
            </Heading>
            <Text style={headerSubtitle}>Your Next Step</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h1}>
              {name ? `${name}, want to talk it through?` : 'Want to talk it through?'}
            </Heading>

            <Text style={text}>
              It's been a week since your audit. If the plan is moving, I would love to hear it. If
              it stalled somewhere, that is normal and usually fixable in one conversation.
            </Text>

            <Text style={text}>
              Fifteen minutes, free, no pitch deck. Bring the one thing you're stuck on and we'll
              sort out your next move together.
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button style={ctaButton} href={url}>
                Book My 15 Minutes
              </Button>
            </Section>

            <Text style={nudgeText}>
              Already booked with me? Then you're set, and I'll see you soon.
            </Text>

            <Hr style={divider} />

            <Text style={footerText}>
              You're receiving this because you purchased an AI Business Audit on {SITE_NAME}.
              This is the last email in your audit follow-up.
              Questions? Reply to Hello@coachkayelevates.org.
            </Text>
            <Text style={signoff}>I'm glad you're here. 💛 Coach Kay</Text>
            <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AuditNurtureBookingEmail,
  subject: "Fifteen minutes on your audit?",
  displayName: 'Audit Nurture. Day 7 Booking',
  previewData: { name: 'Jane', bookingUrl: FALLBACK_BOOKING_URL },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const headerSection = {
  backgroundColor: '#111827',
  padding: '24px 40px',
  textAlign: 'center' as const,
  borderRadius: '12px 12px 0 0',
}
const logoText = { margin: '0', fontSize: '22px', fontWeight: '700' as const }
const headerSubtitle = {
  margin: '4px 0 0',
  fontSize: '11px',
  color: '#8a7a5a',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
}
const bodySection = { padding: '32px 40px' }
const h1 = {
  fontSize: '24px',
  fontWeight: '300' as const,
  color: '#111827',
  margin: '0 0 20px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const ctaButton = {
  backgroundColor: '#c9a227',
  color: '#111827',
  padding: '14px 32px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  display: 'inline-block' as const,
}
const nudgeText = { fontSize: '13px', color: '#6b7280', lineHeight: '1.5', margin: '0 0 8px', textAlign: 'center' as const }
const divider = { borderColor: '#e5e7eb', margin: '32px 0 24px' }
const footerText = { fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', margin: '0 0 8px' }
const signoff = {
  fontSize: '14px',
  color: '#c9a227',
  fontStyle: 'italic' as const,
  margin: '16px 0 8px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
const mantra = {
  fontSize: '11px',
  color: '#9ca3af',
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
  margin: '0',
}