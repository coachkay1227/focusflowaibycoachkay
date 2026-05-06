import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  source?: string
  windowMinutes?: number
  failureCount?: number
  threshold?: number
}

const WebhookFailureAlertEmail = ({ source, windowMinutes, failureCount, threshold }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Webhook failure threshold exceeded — {source ?? 'unknown source'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Heading style={h1}>Payment processing alert</Heading>
          <Text style={text}>
            The <strong>{source ?? 'webhook'}</strong> endpoint has recorded{' '}
            <strong>{failureCount ?? '?'}</strong> failures in the last{' '}
            <strong>{windowMinutes ?? '?'} minutes</strong> — at or above the{' '}
            <strong>{threshold ?? '?'}</strong>-failure alert threshold.
          </Text>
          <Text style={text}>
            Inspect the <code>webhook_failures</code> table or the function logs to
            identify the root cause. Further alerts for this source are throttled
            for the next 60 minutes.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

const main: React.CSSProperties = { backgroundColor: '#0a0e1a', fontFamily: 'Helvetica, Arial, sans-serif', color: '#e8d5a3', padding: '32px 0' }
const container: React.CSSProperties = { maxWidth: '560px', margin: '0 auto', padding: '0 16px' }
const card: React.CSSProperties = { backgroundColor: '#111a2e', border: '1px solid #1f2a44', borderRadius: '12px', padding: '24px' }
const h1: React.CSSProperties = { color: '#c9a227', fontSize: '22px', margin: '0 0 12px 0' }
const text: React.CSSProperties = { color: '#e8d5a3', fontSize: '14px', lineHeight: '22px', margin: '0 0 12px 0' }

export const template: TemplateEntry = {
  component: WebhookFailureAlertEmail,
  subject: (data) => `Webhook failures: ${data?.failureCount ?? '?'} in ${data?.windowMinutes ?? '?'} min (${data?.source ?? 'unknown'})`,
  displayName: 'Webhook Failure Alert',
  previewData: { source: 'stripe-webhook', windowMinutes: 15, failureCount: 7, threshold: 5 },
}