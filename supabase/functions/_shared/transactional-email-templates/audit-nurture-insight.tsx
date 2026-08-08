import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FocusFlow AI"
const APP_ORIGIN = "https://coachkayai.life"

interface AuditNurtureInsightProps {
  name?: string | null
  audit_id?: string | null
  leak?: string | null
  action_title?: string | null
  action?: string | null
  pillar?: string | null
}

const AuditNurtureInsightEmail = ({
  name, audit_id, leak, action_title, action, pillar,
}: AuditNurtureInsightProps) => {
  const reportUrl = audit_id
    ? `${APP_ORIGIN}/audit/report/${audit_id}`
    : `${APP_ORIGIN}/dashboard`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>The one thing your audit found, and what to do about it this week</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>
              <span style={{ color: '#c9a227' }}>Focus</span>
              <span style={{ color: '#e8d5a3' }}>Flow</span>
              <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
            </Heading>
            <Text style={headerSubtitle}>Your Insight</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h1}>
              {name ? `${name}, here's the one that matters.` : "Here's the one that matters."}
            </Heading>

            <Text style={text}>
              Your audit found a lot. Reports are easy to skim and forget, so I pulled out the single
              finding worth your attention this week.
            </Text>

            {leak ? (
              <Section style={highlightBox}>
                <Text style={highlightTitle}>Where you're leaking</Text>
                <Text style={quoteText}>{leak}</Text>
              </Section>
            ) : null}

            {action ? (
              <Section style={actionBox}>
                <Text style={highlightTitle}>
                  {pillar ? `Do this first. Pillar: ${pillar}` : 'Do this first'}
                </Text>
                {action_title ? <Text style={actionTitleText}>{action_title}</Text> : null}
                <Text style={text}>{action}</Text>
              </Section>
            ) : null}

            <Text style={text}>
              One move. Not seven. Do that one, and the rest of the plan gets easier to follow.
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button style={ctaButton} href={reportUrl}>
                Open My Full Report
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={footerText}>
              You're receiving this because you purchased an AI Business Audit on {SITE_NAME}.
              Questions? Reply to Hello@coachkayelevates.org.
            </Text>
            <Text style={signoff}>I'm glad you're here. 💛 Coach Kay</Text>
            <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AuditNurtureInsightEmail,
  subject: "The one thing your audit found",
  displayName: 'Audit Nurture. Day 1 Insight',
  previewData: {
    name: 'Jane',
    audit_id: 'preview-audit-id',
    leak: "You are leaking revenue in the gap between a lead showing interest and you finding time to reply.",
    action_title: 'Audit the Entry Points',
    action: 'List every place a lead currently enters your world (DM, email, referral).',
    pillar: 'Foundation',
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
const actionBox = {
  backgroundColor: '#fffaf0',
  borderRadius: '8px',
  border: '1px solid #eadfc2',
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
const quoteText = { fontSize: '15px', color: '#374151', lineHeight: '1.7', margin: '0' }
const actionTitleText = {
  fontSize: '16px',
  fontWeight: '600' as const,
  color: '#111827',
  margin: '0 0 8px',
}
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