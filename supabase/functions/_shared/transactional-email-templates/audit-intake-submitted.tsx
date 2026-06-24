import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FocusFlow AI"
const APP_ORIGIN = "https://coachkayai.life"

interface AuditIntakeSubmittedProps {
  name?: string | null
  business_name?: string | null
  audit_id?: string | null
}

const AuditIntakeSubmittedEmail = ({ name, business_name, audit_id }: AuditIntakeSubmittedProps) => {
  const dashboardUrl = `${APP_ORIGIN}/dashboard`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your AI Business Audit is being built — expect it within 24 hours</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>
              <span style={{ color: '#c9a227' }}>Focus</span>
              <span style={{ color: '#e8d5a3' }}>Flow</span>
              <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
            </Heading>
            <Text style={headerSubtitle}>AI Business Audit</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h1}>
              {name ? `${name}, we've got your intake.` : "We've got your intake."}
            </Heading>

            <Text style={text}>
              {business_name
                ? `Your audit for <strong style={{ color: '#111827' }}>${business_name}</strong> is now being generated.`
                : 'Your AI Business Audit intake has been received and your custom report is now being generated.'}
            </Text>

            <Text style={text}>
              Coach Kay's AI is analyzing your 17-field intake across 12 vectors — your offers, bottlenecks, tools, revenue stage, and your unique market position. Audits typically complete in under 2 minutes, though complex reports may take up to 24 hours.
            </Text>

            <Section style={expectationBox}>
              <Text style={expectationTitle}>What happens next</Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong> Your audit generates a personalized 8-section report
              </Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong> You'll get a custom 7-day action plan
              </Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong> Coach Kay's AI identifies your one best next move from the full catalog
              </Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong> We'll email you the moment your report is ready
              </Text>
            </Section>

            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button style={ctaButton} href={dashboardUrl}>
                Check My Dashboard
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={footerText}>
              You're receiving this because you submitted your AI Business Audit intake on {SITE_NAME}.
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
  component: AuditIntakeSubmittedEmail,
  subject: "Your AI Business Audit is being built — expect it within 24 hours",
  displayName: 'Audit Intake Submitted',
  previewData: {
    name: 'Jane',
    business_name: 'Elevate Coaching Co.',
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
const expectationBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  padding: '20px 24px',
  margin: '24px 0',
}
const expectationTitle = {
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
