/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const APP_ORIGIN = "https://coachkayai.life"
const DEFAULT_BOOKING_URL =
  "https://call.coachkayelevates.org/widget/booking/T9DLwsDPEI4rfRHDdhjp"

interface AdvisoryPurchaseConfirmationProps {
  name?: string | null
  productName?: string | null
  bookingUrl?: string | null
}

const AdvisoryPurchaseConfirmationEmail = ({
  name,
  productName = 'AI Strategy Intensive',
  bookingUrl,
}: AdvisoryPurchaseConfirmationProps) => {
  const booking = bookingUrl || DEFAULT_BOOKING_URL
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Booked. Now pick your time — {productName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>
              <span style={{ color: '#c9a227' }}>Focus</span>
              <span style={{ color: '#e8d5a3' }}>Flow</span>
              <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
            </Heading>
            <Text style={headerSub}>Advisory · Coach Kay</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h1}>
              {name ? `${name}, your seat is reserved.` : 'Your seat is reserved.'}
            </Heading>

            <Text style={productLabel}>{productName}</Text>

            <Text style={text}>
              Payment received. The next step is to pick the time that works for you so we can lock in your session and start prepping.
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '28px 0 8px' }}>
              <Button href={booking} style={ctaButton}>
                Book Your Session →
              </Button>
            </Section>
            <Text style={fallback}>
              Or paste this link into your browser:{' '}
              <Link href={booking} style={fallbackLink}>{booking}</Link>
            </Text>

            <Section style={expectBox}>
              <Text style={expectTitle}>Before we meet</Text>
              <Text style={listItem}>
                <span style={{ color: '#c9a227' }}>→</span> Pick your time using the link above
              </Text>
              <Text style={listItem}>
                <span style={{ color: '#c9a227' }}>→</span> A short intake form arrives once you book
              </Text>
              <Text style={listItem}>
                <span style={{ color: '#c9a227' }}>→</span> Come ready with one decision you want clarity on
              </Text>
            </Section>

            <Hr style={divider} />

            <Text style={footerText}>
              Questions? Reply to this email or reach us at Hello@coachkayelevates.org.
              You're receiving this because you purchased {productName} on FocusFlow AI.
            </Text>
            <Text style={signoff}>Coach Kay</Text>
            <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AdvisoryPurchaseConfirmationEmail,
  subject: (data: Record<string, any>) =>
    data?.productName
      ? `Booked — ${data.productName}: pick your time`
      : 'Booked — pick your Strategy Intensive time',
  displayName: 'Advisory purchase confirmation',
  previewData: {
    name: 'Jane',
    productName: 'AI Strategy Intensive',
    bookingUrl: DEFAULT_BOOKING_URL,
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
const headerSub = {
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
  margin: '0 0 8px',
  fontFamily: "'Georgia', 'Cormorant Garamond', serif",
}
const productLabel = {
  fontSize: '15px',
  color: '#c9a227',
  fontWeight: '600' as const,
  margin: '0 0 20px',
  letterSpacing: '0.3px',
}
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const fallback = { fontSize: '12px', color: '#6b7280', lineHeight: '1.5', margin: '0 0 24px', textAlign: 'center' as const }
const fallbackLink = { color: '#c9a227', wordBreak: 'break-all' as const }
const expectBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  padding: '20px 24px',
  margin: '24px 0',
}
const expectTitle = {
  fontSize: '12px',
  fontWeight: '600' as const,
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 12px',
}
const listItem = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 8px', paddingLeft: '8px' }
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
