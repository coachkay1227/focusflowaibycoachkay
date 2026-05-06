import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FocusFlow AI"

interface Props {
  name?: string
  packageName?: string
  status?: string
  orderId?: string
  note?: string
}

const STATUS_COPY: Record<string, { headline: string; message: string; label: string }> = {
  in_progress: {
    label: 'In Progress',
    headline: 'Your book is in progress.',
    message: "Our team has begun crafting your book. We'll reach out if we need anything from you, and again when your first proof is ready.",
  },
  delivered: {
    label: 'Delivered',
    headline: 'Your book has been delivered.',
    message: 'Your finished book has been delivered. Thank you for trusting us with this work — it has been our honor.',
  },
  cancelled: {
    label: 'Cancelled',
    headline: 'Your order has been cancelled.',
    message: 'Your order has been cancelled. If this is unexpected, please reply to this email and we will look into it right away.',
  },
  paid: {
    label: 'Paid',
    headline: 'Payment received.',
    message: 'Thank you — your payment has been received and your order is queued for review.',
  },
}

const BookOrderStatusUpdateEmail = ({ name, packageName, status, orderId, note }: Props) => {
  const copy = (status && STATUS_COPY[status]) || {
    label: status ?? 'Updated',
    headline: 'Your order has been updated.',
    message: 'There is an update on your order.',
  }
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{copy.headline} — {SITE_NAME}</Preview>
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
            <Text style={statusPill}>{copy.label.toUpperCase()}</Text>
            <Heading style={h1}>
              {name ? `${name}, ${copy.headline.toLowerCase()}` : copy.headline}
            </Heading>
            {packageName && (
              <Text style={programLabel}>
                Package: <strong style={{ color: '#c9a227' }}>{packageName}</strong>
              </Text>
            )}
            <Text style={text}>{copy.message}</Text>
            {note && (
              <Section style={noteCard}>
                <Text style={noteLabel}>A note from your team</Text>
                <Text style={noteText}>{note}</Text>
              </Section>
            )}
            <Hr style={divider} />
            {orderId && (
              <Text style={footerText}>
                Order ID: <span style={{ fontFamily: 'monospace' }}>{orderId}</span>
              </Text>
            )}
            <Text style={footerText}>
              Questions? Reply to this email or write to Hello@coachkayelevates.org.
            </Text>
            <Text style={signoff}>— Coach Kay</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: BookOrderStatusUpdateEmail,
  subject: (data: Record<string, any>) => {
    const s = data?.status as string | undefined
    const c = (s && STATUS_COPY[s]) || null
    return c ? `Order update: ${c.label}` : 'Update on your book order'
  },
  displayName: 'Book order — status update',
  previewData: {
    name: 'Jane',
    packageName: "Children's Book — Signature",
    status: 'in_progress',
    orderId: 'abc12345-...',
    note: 'Your first proof is scheduled for next Tuesday.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#111827', padding: '24px 40px', textAlign: 'center' as const, borderRadius: '12px 12px 0 0' }
const logoText = { margin: '0', fontSize: '22px', fontWeight: '700' as const }
const bodySection = { padding: '32px 40px' }
const statusPill = {
  display: 'inline-block', fontSize: '11px', letterSpacing: '0.12em', color: '#c9a227',
  border: '1px solid #c9a227', padding: '4px 10px', borderRadius: '999px', margin: '0 0 16px',
}
const h1 = { fontSize: '24px', fontWeight: '300' as const, color: '#111827', margin: '0 0 20px', fontFamily: "'Georgia', serif" }
const programLabel = { fontSize: '14px', color: '#6b7280', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const noteCard = { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px 20px', margin: '20px 0' }
const noteLabel = { fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.08em', margin: '0 0 6px' }
const noteText = { fontSize: '14px', color: '#374151', lineHeight: '1.6', margin: 0, fontStyle: 'italic' as const }
const divider = { borderColor: '#e5e7eb', margin: '32px 0 24px' }
const footerText = { fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', margin: '0 0 8px' }
const signoff = { fontSize: '14px', color: '#c9a227', fontStyle: 'italic' as const, margin: '16px 0 0', fontFamily: "'Georgia', serif" }
