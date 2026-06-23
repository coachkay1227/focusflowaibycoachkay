/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const APP_ORIGIN = "https://coachkayai.life"

interface PaymentFailedProps {
  name?: string | null
  attemptCount?: number | null
  nextRetryDate?: string | null
}

const PaymentFailedEmail = ({
  name,
  attemptCount = 1,
  nextRetryDate,
}: PaymentFailedProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Action needed — your FocusFlow AI payment didn't go through</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>
            <span style={{ color: '#c9a227' }}>Focus</span>
            <span style={{ color: '#e8d5a3' }}>Flow</span>
            <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
          </Heading>
        </Section>

        <Section style={bodySection}>
          <Heading style={h1}>
            {name ? `${name}, your payment didn't go through.` : "Your payment didn't go through."}
          </Heading>

          <Text style={text}>
            We tried to process your FocusFlow AI subscription payment{attemptCount && attemptCount > 1 ? ` (attempt ${attemptCount})` : ''}, but it was declined. Your access is still active right now — this is just a heads-up so you can fix it before it affects your account.
          </Text>

          {nextRetryDate && (
            <Text style={retryNote}>
              Next automatic retry: <strong>{nextRetryDate}</strong>
            </Text>
          )}

          <Text style={text}>
            The most common reasons: expired card, insufficient funds, or your bank flagged a recurring charge. Updating your payment method takes less than a minute.
          </Text>

          <Section style={ctaSection}>
            <Button href={`${APP_ORIGIN}/dashboard`} style={button}>
              Update My Payment Method →
            </Button>
          </Section>

          <Text style={softText}>
            If you believe this is an error, contact your bank or reply to this email and we'll sort it out.
          </Text>

          <Hr style={divider} />

          <Text style={footerText}>
            Questions? Reply here or reach us at Hello@coachkayelevates.org.
          </Text>
          <Text style={signoff}>— Coach Kay</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PaymentFailedEmail,
  subject: 'Action needed — your FocusFlow AI payment didn\'t go through',
  displayName: 'Payment failed',
  previewData: { name: 'Jane', attemptCount: 1, nextRetryDate: 'July 5' },
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
const bodySection = { padding: '32px 40px' }
const h1 = {
  fontSize: '24px',
  fontWeight: '300' as const,
  color: '#111827',
  margin: '0 0 20px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const retryNote = {
  fontSize: '14px',
  color: '#374151',
  backgroundColor: '#fef9ec',
  border: '1px solid #c9a227',
  borderRadius: '6px',
  padding: '12px 16px',
  margin: '0 0 16px',
}
const softText = { fontSize: '14px', color: '#6b7280', lineHeight: '1.6', margin: '16px 0 0' }
const ctaSection = { margin: '24px 0' }
const button = {
  backgroundColor: '#c9a227',
  color: '#111827',
  padding: '14px 28px',
  borderRadius: '8px',
  fontWeight: '600' as const,
  fontSize: '15px',
  textDecoration: 'none',
  display: 'inline-block' as const,
}
const divider = { borderColor: '#e5e7eb', margin: '32px 0 24px' }
const footerText = { fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', margin: '0 0 8px' }
const signoff = {
  fontSize: '14px',
  color: '#c9a227',
  fontStyle: 'italic' as const,
  margin: '16px 0 0',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
