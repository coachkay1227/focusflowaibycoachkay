import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FocusFlow AI"
const FALLBACK_SITE = "https://coachkayai.life"

interface PurchaseNextStepsProps {
  name?: string | null
  productName?: string | null
  bookingUrl?: string | null
  bookingLabel?: string | null
  bookingWindow?: string | null
  startUrl?: string | null
  challengesUrl?: string | null
  dashboardUrl?: string | null
  communityUrl?: string | null
  reportPending?: boolean
}

const PurchaseNextStepsEmail = ({
  name,
  productName,
  bookingUrl,
  bookingLabel,
  bookingWindow,
  startUrl,
  challengesUrl,
  dashboardUrl,
  communityUrl,
  reportPending,
}: PurchaseNextStepsProps) => {
  const start = startUrl || `${FALLBACK_SITE}/start`
  const challenges = challengesUrl || `${FALLBACK_SITE}/challenges`
  const dashboard = dashboardUrl || `${FALLBACK_SITE}/dashboard`
  const label = bookingLabel || 'Book your free 15-minute clarity call'
  const window = bookingWindow || 'in the next 48 hours'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your purchase is confirmed. Here is exactly what to do now.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>
              <span style={{ color: '#c9a227' }}>Focus</span>
              <span style={{ color: '#e8d5a3' }}>Flow</span>
              <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
            </Heading>
            <Text style={headerSubtitle}>What To Do Now</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h1}>
              {name ? `${name}, you're in.` : "You're in."}
            </Heading>

            <Text style={text}>
              {productName
                ? `Your ${productName} is confirmed and your access is live.`
                : 'Your purchase is confirmed and your access is live.'}{' '}
              Here is the short version of what happens next, with the timing, so nothing sits in
              your inbox waiting on you to guess.
            </Text>

            <Section style={stepBox}>
              <Text style={stepNumber}>Step 1. Today</Text>
              <Text style={stepText}>
                Open your start page and read your results and recommended next move. Ten minutes.
              </Text>
              <Link style={inlineLink} href={start}>{start}</Link>
            </Section>

            <Section style={stepBox}>
              <Text style={stepNumber}>Step 2. {window}</Text>
              <Text style={stepText}>{label}. Pick the earliest time that fits your real life.</Text>
              <Link style={inlineLink} href={bookingUrl || FALLBACK_SITE}>
                {bookingUrl || FALLBACK_SITE}
              </Link>
            </Section>

            <Section style={stepBox}>
              <Text style={stepNumber}>Step 3. Within 7 days</Text>
              <Text style={stepText}>
                Start your first coaching challenge. Day 1 takes about 15 minutes, and the guided
                kickoff saves your progress so you can pause and come back.
              </Text>
              <Link style={inlineLink} href={challenges}>{challenges}</Link>
            </Section>

            {reportPending ? (
              <Text style={nudgeText}>
                Your AI report is still generating. It usually lands within a few minutes, and I
                email you the moment it is ready. You can start Step 1 without it.
              </Text>
            ) : null}

            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button style={ctaButton} href={start}>
                Start Here
              </Button>
            </Section>

            <Text style={nudgeText}>
              Your dashboard lives at <Link style={inlineLink} href={dashboard}>{dashboard}</Link>
              {communityUrl ? (
                <>
                  {' '}and the community is at{' '}
                  <Link style={inlineLink} href={communityUrl}>{communityUrl}</Link>
                </>
              ) : null}
              .
            </Text>

            <Hr style={divider} />

            <Text style={footerText}>
              You're receiving this because you just purchased on {SITE_NAME}.
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
  component: PurchaseNextStepsEmail,
  subject: 'Your next steps, with dates',
  displayName: 'Purchase. What To Do Now',
  previewData: {
    name: 'Jane',
    productName: 'AI Business Audit',
    bookingUrl: 'https://call.coachkayelevates.org/widget/bookings/15-minutes-free-call',
    bookingLabel: 'Book your free 15-minute clarity call',
    bookingWindow: 'in the next 48 hours',
  },
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
const stepBox = {
  border: '1px solid #e5e7eb',
  borderLeft: '3px solid #c9a227',
  borderRadius: '8px',
  padding: '16px 18px',
  margin: '0 0 14px',
}
const stepNumber = {
  fontSize: '11px',
  color: '#c9a227',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  margin: '0 0 6px',
  fontWeight: '700' as const,
}
const stepText = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 8px' }
const inlineLink = { fontSize: '13px', color: '#c9a227', textDecoration: 'underline' }
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
const nudgeText = { fontSize: '13px', color: '#6b7280', lineHeight: '1.5', margin: '0 0 8px' }
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
