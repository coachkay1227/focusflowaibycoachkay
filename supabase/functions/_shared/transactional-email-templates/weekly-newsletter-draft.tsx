import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  issueNumber?: number
  subject?: string
  scamSection?: string
  truthSection?: string
  playSection?: string
  approveUrl?: string
  editUrl?: string
  subscriberCount?: number
}

function Pre({ text }: { text?: string }) {
  return <Text style={pre}>{text ?? ''}</Text>
}

const Email = ({ issueNumber, subject, scamSection, truthSection, playSection, approveUrl, editUrl, subscriberCount }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Draft issue #{issueNumber ?? '—'} ready for your review</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={logoText}>Weekly Newsletter Draft</Heading>
          <Text style={headerSubtitle}>Issue #{issueNumber ?? '—'} · {subscriberCount ?? 0} subscribers</Text>
        </Section>

        <Section style={bodySection}>
          <Text style={label}>SUBJECT LINE</Text>
          <Text style={subjectText}>{subject || '(no subject)'}</Text>

          <Hr style={divider} />

          <Text style={label}>1. SCAM ALERT</Text>
          <Pre text={scamSection} />

          <Text style={label}>2. TRUTH DROP</Text>
          <Pre text={truthSection} />

          <Text style={label}>3. AI PLAY</Text>
          <Pre text={playSection} />

          <Hr style={divider} />

          <Section style={{ textAlign: 'center' as const, margin: '24px 0' }}>
            {editUrl ? (
              <Button style={editButton} href={editUrl}>Edit in browser</Button>
            ) : null}
            {' '}
            {approveUrl ? (
              <Button style={approveButton} href={approveUrl}>Approve & send to all subscribers</Button>
            ) : null}
          </Section>

          <Text style={footnote}>
            Approval link expires in 7 days. Clicking "Approve & send" will deliver this issue to every active subscriber immediately. Suppressed addresses are skipped automatically.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, unknown>) => {
    const n = typeof data.issueNumber === 'number' ? data.issueNumber : '—'
    return `[Draft] Weekly Newsletter Issue #${n} — review & send`
  },
  to: 'Hello@coachkayelevates.org',
  displayName: 'Weekly Newsletter Draft (admin review)',
  previewData: {
    issueNumber: 1,
    subject: 'Sample subject',
    scamSection: 'Sample scam content...',
    truthSection: 'Sample truth content...',
    playSection: 'Sample play content...',
    approveUrl: 'https://coachkayai.life/api/approve',
    editUrl: 'https://coachkayai.life/admin/newsletter-draft/abc',
    subscriberCount: 42,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }
const container = { maxWidth: '640px', margin: '0 auto' }
const headerSection = { backgroundColor: '#111827', padding: '20px 32px', borderRadius: '12px 12px 0 0' }
const logoText = { margin: '0', fontSize: '18px', fontWeight: '700' as const, color: '#c9a227' }
const headerSubtitle = { margin: '4px 0 0', fontSize: '12px', color: '#9ca3af' }
const bodySection = { padding: '24px 32px' }
const label = { fontSize: '11px', fontWeight: '700' as const, color: '#6b7280', letterSpacing: '1.5px', margin: '16px 0 6px' }
const subjectText = { fontSize: '17px', fontWeight: '600' as const, color: '#111827', margin: '0 0 8px' }
const pre = {
  fontSize: '14px',
  color: '#1f2937',
  lineHeight: '1.6',
  margin: '0 0 16px',
  whiteSpace: 'pre-wrap' as const,
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '12px 14px',
}
const divider = { borderColor: '#e5e7eb', margin: '20px 0' }
const approveButton = {
  backgroundColor: '#c9a227',
  color: '#111827',
  padding: '12px 24px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  display: 'inline-block' as const,
}
const editButton = {
  backgroundColor: '#ffffff',
  color: '#111827',
  padding: '12px 24px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  display: 'inline-block' as const,
}
const footnote = { fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', margin: '16px 0 0', textAlign: 'center' as const }