/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const APP_ORIGIN = "https://coachkayai.life"
const SITE_NAME = "FocusFlow AI"

interface SubscriptionCancelledProps {
  name?: string | null
}

const SubscriptionCancelledEmail = ({ name }: SubscriptionCancelledProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your FocusFlow AI subscription has ended — here's how to come back</Preview>
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
            {name ? `${name}, your subscription has ended.` : 'Your subscription has ended.'}
          </Heading>

          <Text style={text}>
            Your access to {SITE_NAME} has been removed. Your account and all your data are still safe — nothing is deleted.
          </Text>

          <Text style={text}>
            If this was a mistake, or if you're ready to continue your work, you can reactivate at any time. Your progress and history will still be there.
          </Text>

          <Section style={ctaSection}>
            <Button href={`${APP_ORIGIN}/modules`} style={button}>
              Reactivate My Access →
            </Button>
          </Section>

          <Text style={softText}>
            If you cancelled intentionally, no action needed. We hope our paths cross again — the work doesn't disappear just because the subscription does.
          </Text>

          <Hr style={divider} />

          <Text style={footerText}>
            Questions or issues with this cancellation? Reply here or email Hello@coachkayelevates.org.
          </Text>
          <Text style={signoff}>— Coach Kay</Text>
          <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SubscriptionCancelledEmail,
  subject: `Your ${SITE_NAME} subscription has ended`,
  displayName: 'Subscription cancelled',
  previewData: { name: 'Jane' },
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
const softText = { fontSize: '14px', color: '#6b7280', lineHeight: '1.6', margin: '24px 0 0' }
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
