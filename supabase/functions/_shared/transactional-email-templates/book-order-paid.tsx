import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Row, Column,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FocusFlow AI"

interface Props {
  name?: string
  packageName?: string
  orderTotal?: string
  orderId?: string
}

const BookOrderPaidEmail = ({ name, packageName, orderTotal, orderId }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your book order is confirmed — {SITE_NAME}</Preview>
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
            {name ? `${name}, your order is confirmed.` : 'Your order is confirmed.'}
          </Heading>
          <Text style={text}>
            Thank you for entrusting us with your book. Coach Kay's team has received your intake and your order is now in the queue.
          </Text>

          <Section style={card}>
            <Row>
              <Column style={cardLabel}>Package</Column>
              <Column style={cardValue}>{packageName ?? '—'}</Column>
            </Row>
            <Hr style={cardDivider} />
            <Row>
              <Column style={cardLabel}>Total Paid</Column>
              <Column style={{ ...cardValue, color: '#c9a227', fontWeight: 600 }}>{orderTotal ?? '—'}</Column>
            </Row>
            {orderId && (
              <>
                <Hr style={cardDivider} />
                <Row>
                  <Column style={cardLabel}>Order ID</Column>
                  <Column style={{ ...cardValue, fontFamily: 'monospace', fontSize: '12px' }}>{orderId}</Column>
                </Row>
              </>
            )}
          </Section>

          <Heading style={h2}>What happens next</Heading>
          <Text style={text}>
            1. We review your intake within 1–2 business days.<br />
            2. You receive a kickoff email with your timeline and first proof.<br />
            3. We craft, refine, and deliver your book on schedule.
          </Text>

          <Hr style={divider} />
          <Text style={footerText}>
            Questions? Reply to this email or write to Hello@coachkayelevates.org.
          </Text>
          <Text style={signoff}>Where Focus Goes, Energy Flows. 💛 Coach Kay</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BookOrderPaidEmail,
  subject: 'Your book order is confirmed',
  displayName: 'Book order — paid',
  previewData: {
    name: 'Jane',
    packageName: "Children's Book — Signature",
    orderTotal: '$1,200.00',
    orderId: 'abc12345-...',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#111827', padding: '24px 40px', textAlign: 'center' as const, borderRadius: '12px 12px 0 0' }
const logoText = { margin: '0', fontSize: '22px', fontWeight: '700' as const }
const bodySection = { padding: '32px 40px' }
const h1 = { fontSize: '24px', fontWeight: '300' as const, color: '#111827', margin: '0 0 20px', fontFamily: "'Georgia', serif" }
const h2 = { fontSize: '16px', fontWeight: '600' as const, color: '#111827', margin: '24px 0 12px' }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 16px' }
const card = { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px 20px', margin: '20px 0' }
const cardLabel = { fontSize: '12px', color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.05em', padding: '6px 0', width: '40%' }
const cardValue = { fontSize: '14px', color: '#111827', padding: '6px 0', textAlign: 'right' as const }
const cardDivider = { borderColor: '#e5e7eb', margin: '4px 0' }
const divider = { borderColor: '#e5e7eb', margin: '32px 0 24px' }
const footerText = { fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', margin: '0 0 8px' }
const signoff = { fontSize: '14px', color: '#c9a227', fontStyle: 'italic' as const, margin: '16px 0 0', fontFamily: "'Georgia', serif" }
