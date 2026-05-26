import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface AutismConfirmProps {
  name?: string | null
  packageName?: string
  orderTotal?: string
  orderId?: string
  childFirstName?: string | null
  scenarioFocus?: string | null
  isGift?: boolean
  giftRecipient?: string | null
}

const AutismPurchaseConfirmationEmail = ({
  name,
  packageName,
  orderTotal,
  orderId,
  childFirstName,
  scenarioFocus,
  isGift,
  giftRecipient,
}: AutismConfirmProps) => {
  const greetingName = name?.split(' ')[0] ?? 'Friend'
  const child = childFirstName ?? 'your learner'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Order received — your {packageName ?? 'social story package'} is in production</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>
              <span style={{ color: '#c9a227' }}>Focus</span>
              <span style={{ color: '#e8d5a3' }}>Flow</span>
              <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI · Autism Studio</span>
            </Heading>
          </Section>
          <Section style={bodySection}>
            <Heading style={h1}>Thank you, {greetingName} 💛</Heading>

            <Text style={text}>
              Your order is confirmed. We received the details for{' '}
              <strong>{child}</strong>{scenarioFocus ? <> around <em>{scenarioFocus}</em></> : null}, and your story is now in production.
            </Text>

            <Section style={receiptBox}>
              <Text style={receiptLine}><strong>Package:</strong> {packageName ?? '—'}</Text>
              {orderTotal ? <Text style={receiptLine}><strong>Total:</strong> {orderTotal}</Text> : null}
              {orderId ? <Text style={receiptLineSmall}>Order ID: {orderId}</Text> : null}
              {isGift && giftRecipient
                ? <Text style={receiptLineSmall}>Gift wrap for: {giftRecipient}</Text>
                : null}
            </Section>

            <Heading style={h2}>What happens next</Heading>
            <Text style={text}>
              <strong>1. Drafting (24–48 hours).</strong> Coach Kay reviews your intake and drafts a story tailored to {child}'s age, interests, and the scenario you specified.
            </Text>
            <Text style={text}>
              <strong>2. First proof.</strong> You'll receive a PDF proof by email for review. Reply with any edits — wording, sequence, or imagery — and we'll revise.
            </Text>
            <Text style={text}>
              <strong>3. Final delivery.</strong> Once approved, you'll get the final social story in print-ready and screen-friendly formats, plus a short caregiver/provider note on how to use it.
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button style={ctaButton} href="https://coachkayai.life/autism-social-stories">
                View Autism Studio
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={smallText}>
              <strong>Need to add details, change something, or have a question?</strong>{' '}
              Just reply to this email or write us directly at{' '}
              <a href="mailto:Hello@coachkayelevates.org" style={inlineLink}>Hello@coachkayelevates.org</a>.
              Coach Kay reads every message personally.
            </Text>
            <Text style={smallText}>
              These stories are educational supports, not medical or clinical interventions. They work best alongside the guidance of caregivers, teachers, and qualified providers who know {child} best.
            </Text>

            <Hr style={divider} />
            <Text style={signoff}>— Coach Kay</Text>
            <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AutismPurchaseConfirmationEmail,
  subject: (data: Record<string, any>) =>
    data?.packageName
      ? `Order confirmed — ${data.packageName}`
      : 'Your Autism Studio order is confirmed',
  displayName: 'Autism Purchase Confirmation',
  previewData: {
    name: 'Jane Doe',
    packageName: 'Single Story',
    orderTotal: '$47.00',
    orderId: 'preview-order-id',
    childFirstName: 'Alex',
    scenarioFocus: 'going to the dentist',
    isGift: false,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const headerSection = { backgroundColor: '#0D1B2A', padding: '24px 40px', textAlign: 'center' as const, borderRadius: '12px 12px 0 0' }
const logoText = { margin: '0', fontSize: '22px', fontWeight: '700' as const }
const bodySection = { padding: '32px 40px' }
const h1 = { fontSize: '24px', fontWeight: '300' as const, color: '#0D1B2A', margin: '0 0 20px', fontFamily: "'Georgia', 'Cormorant Garamond', serif" }
const h2 = { fontSize: '17px', fontWeight: '600' as const, color: '#0D1B2A', margin: '28px 0 12px', fontFamily: "'Georgia', 'Cormorant Garamond', serif" }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 14px' }
const smallText = { fontSize: '13px', color: '#6b7280', lineHeight: '1.55', margin: '0 0 12px' }
const receiptBox = { backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px 20px', margin: '20px 0 8px' }
const receiptLine = { fontSize: '14px', color: '#374151', margin: '0 0 6px', lineHeight: '1.5' }
const receiptLineSmall = { fontSize: '12px', color: '#6b7280', margin: '0 0 4px', lineHeight: '1.5' }
const ctaButton = { backgroundColor: '#C9A84C', color: '#0D1B2A', padding: '14px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: '600' as const, textDecoration: 'none', display: 'inline-block' as const }
const divider = { borderColor: '#e5e7eb', margin: '28px 0 20px' }
const inlineLink = { color: '#C9A84C', textDecoration: 'underline' }
const signoff = { fontSize: '14px', color: '#C9A84C', fontStyle: 'italic' as const, margin: '12px 0 8px', fontFamily: "'Georgia', 'Cormorant Garamond', serif" }
const mantra = { fontSize: '11px', color: '#9ca3af', letterSpacing: '0.2em', textTransform: 'uppercase' as const, margin: '0' }