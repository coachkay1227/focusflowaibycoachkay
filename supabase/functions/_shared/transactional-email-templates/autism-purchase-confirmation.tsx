import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface AutismConfirmProps {
  name?: string | null
  packageName?: string | null
  orderTotal?: string | null
  orderId?: string | null
  childFirstName?: string | null
  scenarioFocus?: string | null
  isGift?: boolean
  giftRecipient?: string | null
  deliveryMethod?: string | null
  storyCount?: number | null
  includesHsaReceipt?: boolean
  downloadUrl?: string | null
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
  deliveryMethod,
  storyCount,
  includesHsaReceipt,
  downloadUrl,
}: AutismConfirmProps) => {
  const greetingName = name?.split(' ')[0] ?? 'Friend'
  const child = childFirstName ?? 'your learner'
  const method = deliveryMethod ?? 'print-ready PDF'
  const count = storyCount ?? 1
  const isReady = !!downloadUrl
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        {isReady
          ? `Your ${packageName ?? 'social story'} is ready to download`
          : `Order received — your ${packageName ?? 'social story package'} is in production`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={brandName}>FocusFlow AI</Text>
            <Text style={subBrand}>Lulu's Adventures · Personalized Social Stories</Text>
          </Section>

          <Hr style={divider} />

          <Section style={bodySection}>
            <Heading style={h1}>Hey {greetingName}! 👋</Heading>
            <Text style={text}>
              {isReady ? (
                <>Your personalized story for <strong>{child}</strong> is ready.</>
              ) : (
                <>
                  Your order is confirmed. We received the details for{' '}
                  <strong>{child}</strong>
                  {scenarioFocus ? <> around <em>{scenarioFocus}</em></> : null}
                  , and your story is in production. You just took a meaningful step
                  toward supporting your child with tools that truly see them.
                </>
              )}
            </Text>

            <Section style={receiptBox}>
              <Text style={summaryLabel}>Order Summary</Text>
              <Text style={receiptLine}><strong>Bundle:</strong> {packageName ?? '—'}</Text>
              {orderTotal ? <Text style={receiptLine}><strong>Amount paid:</strong> {orderTotal}</Text> : null}
              {orderId ? <Text style={receiptLineSmall}><strong>Order #:</strong> {orderId}</Text> : null}
              <Text style={receiptLine}>
                <strong>Delivery format:</strong>{' '}
                {count === 1 ? `1 ${method}` : `${count} ${method}s`}
              </Text>
              {isGift && giftRecipient
                ? <Text style={receiptLineSmall}>Gift wrap for: {giftRecipient}</Text>
                : null}
            </Section>

            <Text style={sectionHeading}>What's included</Text>
            <Text style={bullet}>
              ✦ {count === 1 ? '1 personalized social story' : `${count} personalized social stories`}, tailored to {child}
            </Text>
            <Text style={bullet}>✦ Delivered as {method} — ready to print or share digitally</Text>
            {includesHsaReceipt !== false && (
              <>
                <Text style={bullet}>✦ Itemized HSA/FSA receipt</Text>
                <Text style={bullet}>✦ Letter of Medical Necessity template</Text>
                <Text style={bullet}>✦ IEP-aligned objective language</Text>
              </>
            )}

            <Text style={sectionHeading}>When will I receive my story?</Text>
            {isReady ? (
              <Text style={text}>
                Your {method} is ready.{' '}
                <Link href={downloadUrl!} style={link}>Download your story here →</Link>
              </Text>
            ) : (
              <Text style={text}>
                Your personalized story is being generated now. You'll receive a
                separate email with your download link within 24–48 hours.
                Custom-illustrated orders may take up to 5 business days.
              </Text>
            )}

            <Section style={noteBox}>
              <Text style={noteText}>
                💡 HSA/FSA reimbursement tip: Your itemized receipt and Letter of
                Medical Necessity template are included with your order. Keep these
                on file for insurance or flex spending submissions. We don't
                guarantee reimbursement — always confirm eligibility with your plan
                administrator.
              </Text>
            </Section>

            <Hr style={divider} />

            <Text style={smallText}>
              <strong>Need to add details, change something, or have a question?</strong>{' '}
              Just reply to this email or write us directly at{' '}
              <Link href="mailto:Hello@coachkayelevates.org" style={link}>Hello@coachkayelevates.org</Link>.
              Coach Kay reads every message personally.
            </Text>
            <Text style={smallText}>
              These stories are educational supports, not medical or clinical
              interventions. They work best alongside the guidance of caregivers,
              teachers, and qualified providers who know {child} best.
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
  subject: (data: { downloadUrl?: string; packageName?: string }) =>
    data?.downloadUrl
      ? `Your ${data?.packageName ?? 'social story'} is ready to download`
      : data?.packageName
        ? `Order confirmed — ${data.packageName}`
        : 'Your Autism Studio order is confirmed',
  displayName: 'Autism Purchase Confirmation',
  previewData: {
    name: 'Jane Doe',
    packageName: 'Single Digital Social Story',
    orderTotal: '$47.00',
    orderId: 'preview-order-id',
    childFirstName: 'Alex',
    scenarioFocus: 'going to the dentist',
    isGift: false,
    deliveryMethod: 'print-ready PDF',
    storyCount: 1,
    includesHsaReceipt: true,
  },
} satisfies TemplateEntry

// ─── Styles ───────────────────────────────────────────────
const main = { backgroundColor: '#0D1B2A', fontFamily: "Georgia, 'Cormorant Garamond', serif" }
const container = { maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }
const headerSection = { textAlign: 'center' as const, paddingBottom: '8px' }
const brandName = { fontSize: '22px', fontWeight: '700' as const, color: '#C9A84C', margin: '0', letterSpacing: '0.02em' }
const subBrand = { fontSize: '12px', color: '#F5EDD6', opacity: 0.75, margin: '6px 0 0', letterSpacing: '0.05em' }
const divider = { borderColor: '#C9A84C', opacity: 0.3, margin: '24px 0' }
const bodySection = { paddingBottom: '8px' }
const h1 = { fontSize: '22px', color: '#F5EDD6', margin: '0 0 12px', fontWeight: '400' as const }
const text = { fontSize: '15px', color: '#F5EDD6', lineHeight: '1.6', margin: '8px 0 14px' }
const bullet = { fontSize: '14px', color: '#F5EDD6', lineHeight: '1.6', margin: '4px 0' }
const sectionHeading = { fontSize: '13px', fontWeight: '700' as const, color: '#C9A84C', textTransform: 'uppercase' as const, letterSpacing: '0.08em', margin: '24px 0 8px' }
const smallText = { fontSize: '12px', color: '#F5EDD6', opacity: 0.75, lineHeight: '1.55', margin: '0 0 12px' }
const receiptBox = { backgroundColor: '#1a2a3a', borderRadius: '8px', padding: '18px 22px', margin: '20px 0 8px' }
const summaryLabel = { fontSize: '12px', fontWeight: '700' as const, color: '#C9A84C', textTransform: 'uppercase' as const, letterSpacing: '0.08em', margin: '0 0 10px' }
const receiptLine = { fontSize: '14px', color: '#F5EDD6', margin: '4px 0', lineHeight: '1.5' }
const receiptLineSmall = { fontSize: '12px', color: '#F5EDD6', opacity: 0.7, margin: '4px 0', lineHeight: '1.5' }
const noteBox = { backgroundColor: '#111f2e', borderLeft: '3px solid #C9A84C', padding: '14px 18px', borderRadius: '0 6px 6px 0', margin: '20px 0 8px' }
const noteText = { fontSize: '13px', color: '#F5EDD6', opacity: 0.85, lineHeight: '1.6', margin: '0' }
const link = { color: '#C9A84C', textDecoration: 'underline' }
const signoff = { fontSize: '14px', color: '#C9A84C', fontStyle: 'italic' as const, margin: '12px 0 6px' }
const mantra = { fontSize: '11px', color: '#F5EDD6', opacity: 0.5, letterSpacing: '0.2em', textTransform: 'uppercase' as const, margin: '0' }