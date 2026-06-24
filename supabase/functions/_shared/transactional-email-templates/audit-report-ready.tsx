import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FocusFlow AI"
const APP_ORIGIN = "https://coachkayai.life"

interface AuditReportReadyProps {
  name?: string | null
  audit_id?: string | null
}

const AuditReportReadyEmail = ({ name, audit_id }: AuditReportReadyProps) => {
  const reportUrl = audit_id
    ? `${APP_ORIGIN}/audit/report/${audit_id}`
    : `${APP_ORIGIN}/dashboard`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your AI Business Audit is ready — here's what we found</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>
              <span style={{ color: '#c9a227' }}>Focus</span>
              <span style={{ color: '#e8d5a3' }}>Flow</span>
              <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
            </Heading>
            <Text style={headerSubtitle}>Your Report Is Ready</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h1}>
              {name ? `${name}, your audit is ready.` : 'Your audit is ready.'}
            </Heading>

            <Text style={text}>
              Coach Kay's AI has finished analyzing your business across 12 vectors. Your personalized AI Business Audit is complete — and it's packed with specific, actionable insights built from everything you shared.
            </Text>

            <Section style={highlightBox}>
              <Text style={highlightTitle}>Inside your report</Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong> Executive Snapshot — where you are right now
              </Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong> Where You're Leaking — the hidden revenue and time drains
              </Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong> F.O.C.U.S. Diagnostic — scored across all 5 pillars
              </Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong> Custom 7-Day Action Plan — specific to your stage
              </Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong> Tool Stack Recommendations — what to keep, swap, add
              </Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong> Custom AI Prompts — written for your exact business
              </Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong> Your One Best Next Move — from the full Coach Kay catalog
              </Text>
            </Section>

            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button style={ctaButton} href={reportUrl}>
                View My Audit Report
              </Button>
            </Section>

            <Text style={nudgeText}>
              Your report is private and permanently linked to your account. Bookmark it — you'll want to come back to the 7-day plan.
            </Text>

            <Hr style={divider} />

            <Text style={footerText}>
              You're receiving this because your AI Business Audit on {SITE_NAME} has finished generating.
              {audit_id ? ` Audit ID: ${audit_id}.` : ''} Questions? Reply to Hello@coachkayelevates.org.
            </Text>
            <Text style={signoff}>Where Focus Goes, Energy Flows. 💛 Coach Kay</Text>
            <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AuditReportReadyEmail,
  subject: "Your AI Business Audit is ready — here's what we found",
  displayName: 'Audit Report Ready',
  previewData: {
    name: 'Jane',
    audit_id: 'preview-audit-id',
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
const highlightBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  borderLeft: '3px solid #c9a227',
  padding: '20px 24px',
  margin: '24px 0',
}
const highlightTitle = {
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
const nudgeText = { fontSize: '13px', color: '#6b7280', lineHeight: '1.5', margin: '0 0 8px', textAlign: 'center' as const }
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
