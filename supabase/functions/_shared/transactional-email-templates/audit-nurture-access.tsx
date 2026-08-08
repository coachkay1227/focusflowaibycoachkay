import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "FocusFlow AI"
const APP_ORIGIN = "https://coachkayai.life"
const COMMUNITY_URL = "https://www.skool.com/focusflow-elevation-hub"

interface AuditNurtureAccessProps {
  name?: string | null
  audit_id?: string | null
}

const AuditNurtureAccessEmail = ({ name, audit_id }: AuditNurtureAccessProps) => {
  const reportUrl = audit_id
    ? `${APP_ORIGIN}/audit/report/${audit_id}`
    : `${APP_ORIGIN}/dashboard`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your account is live. Here's everything it already opens.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={logoText}>
              <span style={{ color: '#c9a227' }}>Focus</span>
              <span style={{ color: '#e8d5a3' }}>Flow</span>
              <span style={{ color: '#8a7a5a', fontSize: '14px', marginLeft: '6px' }}>AI</span>
            </Heading>
            <Text style={headerSubtitle}>Your Access</Text>
          </Section>

          <Section style={bodySection}>
            <Heading style={h1}>
              {name ? `${name}, your access is live.` : 'Your access is live.'}
            </Heading>

            <Text style={text}>
              Your audit came with more than the report. Most people never find the rest of it, so
              here it is in one place.
            </Text>

            <Section style={highlightBox}>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong>{' '}
                <Link href={reportUrl} style={inlineLink}>Your audit report</Link>. Private to you,
                and it stays put. Bookmark it.
              </Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong>{' '}
                <Link href={`${APP_ORIGIN}/dashboard`} style={inlineLink}>Your dashboard</Link>.
                Tracks your clarity score as you go.
              </Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong>{' '}
                <Link href={`${APP_ORIGIN}/challenges`} style={inlineLink}>Coaching challenges</Link>.
                Short, guided, built to turn the plan into motion.
              </Text>
              <Text style={listItem}>
                <strong style={{ color: '#c9a227' }}>→</strong>{' '}
                <Link href={COMMUNITY_URL} style={inlineLink}>The Focus Flow Elevation Hub</Link>.
                Real people doing this alongside you.
              </Text>
            </Section>

            <Text style={text}>
              If you only do one thing, start a challenge. Reading the plan is not the same as
              running it.
            </Text>

            <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
              <Button style={ctaButton} href={`${APP_ORIGIN}/challenges`}>
                Start My First Challenge
              </Button>
            </Section>

            <Hr style={divider} />

            <Text style={footerText}>
              You're receiving this because you purchased an AI Business Audit on {SITE_NAME}.
              Questions? Reply to Hello@coachkayelevates.org.
            </Text>
            <Text style={signoff}>Together we rise. 💛 Coach Kay</Text>
            <Text style={mantra}>Where Focus Goes, Energy Flows.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AuditNurtureAccessEmail,
  subject: "Everything your audit already unlocked",
  displayName: 'Audit Nurture. Day 3 Access',
  previewData: { name: 'Jane', audit_id: 'preview-audit-id' },
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
const listItem = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 12px', paddingLeft: '8px' }
const inlineLink = { color: '#8a6d1f', fontWeight: '600' as const, textDecoration: 'underline' }
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